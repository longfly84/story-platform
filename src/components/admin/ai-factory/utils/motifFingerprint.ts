import type {
  ExistingStory,
  FactoryStorySeed,
  StoryMotifFingerprint,
  StoryMotifRegistryItem,
} from '../aiFactoryTypes'

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function normalizeLooseText(value: unknown) {
  return safeText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[“”"']/g, '')
    .replace(/[^a-z0-9\u00C0-\u1EF9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
}

function normalizeTags(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => normalizeLooseText(item))
    .filter(Boolean)
    .slice(0, 24)
}

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword))
}

function classifyPremiseFamily(text: string) {
  if (includesAny(text, ['con_bi_trao', 'nhan_nuoi', 'giay_khai_sinh', 'ho_khau', 'quyen_nuoi_con'])) {
    return 'child_identity_or_custody'
  }

  if (includesAny(text, ['di_chuc', 'thua_ke', 'co_phan', 'quyen_dieu_hanh', 'hoi_dong_quan_tri'])) {
    return 'inheritance_or_corporate_control'
  }

  if (includesAny(text, ['ngoai_tinh', 'tieu_tam', 'ly_hon', 'huy_hon', 'ban_than_ngu_voi_chong'])) {
    return 'marriage_betrayal'
  }

  if (includesAny(text, ['benh_vien', 'adn', 'xet_nghiem', 'ho_so_benh_an', 'than_the'])) {
    return 'medical_or_identity_secret'
  }

  if (includesAny(text, ['livestream', 'weibo', 'hot_search', 'boc_phot', 'du_luan'])) {
    return 'public_viral_scandal'
  }

  if (includesAny(text, ['phap_ly', 'luat_su', 'hop_dong', 'toa_an', 'kien_tung'])) {
    return 'legal_drama'
  }

  if (includesAny(text, ['gia_toc', 'hao_mon', 'lien_hon', 'nha_chong', 'me_chong'])) {
    return 'wealthy_family_pressure'
  }

  return 'urban_drama'
}

function classifyArena(text: string) {
  if (includesAny(text, ['san_bay', 'chuyen_bay', 've_may_bay', 'pvg', 'pek'])) return 'airport'
  if (includesAny(text, ['ngan_hang', 'phong_vip'])) return 'bank_vip_room'
  if (includesAny(text, ['co_nhi_vien'])) return 'orphanage'
  if (includesAny(text, ['vien_duong_lao', 'duong_lao', 'thanh_du_vien'])) return 'nursing_home'
  if (includesAny(text, ['benh_vien', 'hanh_lang_benh_vien'])) return 'hospital'
  if (includesAny(text, ['truong_hoc', 'phu_huynh', 'lop_hoc'])) return 'school'
  if (includesAny(text, ['van_phong_luat', 'luat_su'])) return 'law_office'
  if (includesAny(text, ['phong_hop', 'hoi_dong', 'co_dong'])) return 'boardroom'
  if (includesAny(text, ['khach_san', 'phong_khach_san'])) return 'hotel'
  if (includesAny(text, ['ham_xe', 'bai_do_xe', 'gara'])) return 'parking_garage'
  if (includesAny(text, ['livestream', 'studio'])) return 'livestream_room'
  if (includesAny(text, ['sanh_cuoi', 'dam_cuoi', 'hon_le'])) return 'wedding_hall'

  return 'modern_city'
}

function classifyEvidenceType(text: string) {
  if (includesAny(text, ['giay_khai_sinh'])) return 'birth_certificate'
  if (includesAny(text, ['ho_khau'])) return 'household_registration'
  if (includesAny(text, ['nhan_nuoi', 'so_tiep_nhan'])) return 'adoption_or_intake_record'
  if (includesAny(text, ['adn', 'xet_nghiem'])) return 'dna_or_medical_test'
  if (includesAny(text, ['di_chuc', 'cong_chung'])) return 'will_or_notarized_document'
  if (includesAny(text, ['hop_dong', 'phu_luc'])) return 'contract_or_appendix'
  if (includesAny(text, ['camera', 'cctv', 'video'])) return 'camera_or_video'
  if (includesAny(text, ['ghi_am', 'recording'])) return 'voice_recording'
  if (includesAny(text, ['sao_ke', 'chuyen_khoan', 'giao_dich'])) return 'transaction_log'
  if (includesAny(text, ['the_nho', 'usb'])) return 'memory_device'
  if (includesAny(text, ['tin_nhan', 'email', 'mail'])) return 'message_or_email'
  if (includesAny(text, ['ve_may_bay', 'boarding'])) return 'travel_record'
  if (includesAny(text, ['anh_cu', 'anh_chup'])) return 'photo_evidence'

  return 'document_evidence'
}

function classifyVillainAttackType(text: string) {
  if (includesAny(text, ['khoa_tai_khoan', 'phong_toa', 'dong_bang'])) return 'asset_or_access_freeze'
  if (includesAny(text, ['duoi_hoc', 'tam_dung_tiep_nhan', 'truong'])) return 'school_or_child_pressure'
  if (includesAny(text, ['mien_nhiem', 'tuoc_quyen', 'quyen_dieu_hanh', 'co_dong'])) return 'job_or_power_removal'
  if (includesAny(text, ['hot_search', 'weibo', 'boc_phot', 'du_luan'])) return 'public_shaming'
  if (includesAny(text, ['quyen_nuoi_con', 'con_bi'])) return 'custody_or_child_threat'
  if (includesAny(text, ['niêm_phong', 'niem_phong', 'ban_goc'])) return 'evidence_lockdown'
  if (includesAny(text, ['ep_ky', 'cam_ket', 'thoa_thuan'])) return 'forced_agreement'
  if (includesAny(text, ['thu_luat_su', 'kien', 'toa'])) return 'legal_trap'

  return 'social_or_family_pressure'
}

function classifyHeroineCounterType(text: string) {
  if (includesAny(text, ['luat_su', 'toa', 'bao_toan_chung_cu', 'don_khan'])) return 'legal_countermove'
  if (includesAny(text, ['truy_xuat_camera', 'cctv', 'camera'])) return 'camera_investigation'
  if (includesAny(text, ['co_nhi_vien', 'benh_vien', 'so_tiep_nhan', 'ban_goc'])) return 'source_record_verification'
  if (includesAny(text, ['ghi_am', 'bat_ghi_am'])) return 'recording_trap'
  if (includesAny(text, ['cong_khai', 'hop_bao', 'livestream', 'weibo'])) return 'public_reversal'
  if (includesAny(text, ['hoi_dong', 'co_dong', 'phong_hop'])) return 'boardroom_counterattack'
  if (includesAny(text, ['nhan_chung', 'lam_chung'])) return 'witness_hunt'
  if (includesAny(text, ['cai_bay', 'thu_moi', 'gia_bay'])) return 'bait_trap'

  return 'evidence_collection'
}

function classifyPowerStructure(text: string) {
  if (includesAny(text, ['hoi_dong', 'co_dong', 'tap_doan', 'co_phan'])) return 'corporate_board_power'
  if (includesAny(text, ['gia_toc', 'hao_mon', 'nha_chong', 'duong_gia', 'ha_gia'])) return 'wealthy_family_power'
  if (includesAny(text, ['truong', 'so_giao_duc', 'phu_huynh'])) return 'school_administrative_power'
  if (includesAny(text, ['benh_vien', 'vien_duong_lao', 'co_nhi_vien'])) return 'institutional_record_power'
  if (includesAny(text, ['weibo', 'hot_search', 'du_luan', 'pr'])) return 'public_opinion_power'
  if (includesAny(text, ['ngan_hang', 'tai_khoan'])) return 'financial_institution_power'
  if (includesAny(text, ['toa', 'luat_su', 'phap_ly'])) return 'legal_power'

  return 'family_or_social_power'
}

function classifyPublicPressure(text: string) {
  if (includesAny(text, ['weibo', 'hot_search', 'douyin', 'livestream'])) return 'social_media'
  if (includesAny(text, ['hoi_dong', 'co_dong', 'phong_hop'])) return 'boardroom'
  if (includesAny(text, ['phu_huynh', 'truong', 'nhom_phu_huynh'])) return 'school_parent_circle'
  if (includesAny(text, ['gia_toc', 'nha_chong', 'lao_phu_nhan'])) return 'family_clan'
  if (includesAny(text, ['bao_chi', 'phong_vien', 'hop_bao'])) return 'press_media'
  if (includesAny(text, ['le_trao_giai', 'san_khau'])) return 'public_event'

  return 'private_pressure'
}

function classifyHiddenTruthType(text: string) {
  if (includesAny(text, ['con_bi_trao', 'than_the', 'giay_khai_sinh', 'adn'])) return 'identity_or_child_swap'
  if (includesAny(text, ['chu_ky_gia', 'con_dau_gia', 'metadata', 'scan'])) return 'forged_document_timeline'
  if (includesAny(text, ['co_phan', 'quyen_dieu_hanh', 'thua_ke', 'di_chuc'])) return 'inheritance_or_control_scheme'
  if (includesAny(text, ['ngoai_tinh', 'tieu_tam', 'ban_than'])) return 'betrayal_conspiracy'
  if (includesAny(text, ['chuyen_tien', 'sao_ke', 'tai_chinh'])) return 'money_trail'
  if (includesAny(text, ['camera', 'nguoi_dan_ong_la', 'nhan_chung'])) return 'hidden_witness_or_actor'

  return 'hidden_conspiracy'
}

function classifyDeadlineStyle(text: string) {
  if (includesAny(text, ['48_gio', '48h'])) return 'forty_eight_hours'
  if (includesAny(text, ['24_gio', '24h'])) return 'twenty_four_hours'
  if (includesAny(text, ['9_gio', 'chin_gio', 'sang_mai'])) return 'scheduled_meeting'
  if (includesAny(text, ['dem_nguoc', '31_59'])) return 'countdown_message'
  if (includesAny(text, ['han_chot', 'deadline'])) return 'generic_deadline'

  return 'no_clear_deadline'
}

export function normalizeMotifFingerprint(input: Partial<StoryMotifFingerprint>) {
  const normalized: StoryMotifFingerprint = {
    premiseFamily: normalizeLooseText(input.premiseFamily),
    openingArena: normalizeLooseText(input.openingArena),
    incitingIncident: normalizeLooseText(input.incitingIncident),
    evidenceType: normalizeLooseText(input.evidenceType),
    evidenceObject: normalizeLooseText(input.evidenceObject),
    villainAttackType: normalizeLooseText(input.villainAttackType),
    heroineCounterType: normalizeLooseText(input.heroineCounterType),
    powerStructure: normalizeLooseText(input.powerStructure),
    publicPressure: normalizeLooseText(input.publicPressure),
    emotionalWound: normalizeLooseText(input.emotionalWound),
    hiddenTruthType: normalizeLooseText(input.hiddenTruthType),
    mainArena: normalizeLooseText(input.mainArena),
    secondaryArena: normalizeLooseText(input.secondaryArena),
    relationshipCore: normalizeLooseText(input.relationshipCore),
    twistEngine: normalizeLooseText(input.twistEngine),
    deadlineStyle: normalizeLooseText(input.deadlineStyle),
    endingPromise: normalizeLooseText(input.endingPromise),
    antiRepeatTags: normalizeTags(input.antiRepeatTags),
  }

  const fingerprintParts = [
    normalized.premiseFamily,
    normalized.openingArena,
    normalized.incitingIncident,
    normalized.evidenceType,
    normalized.villainAttackType,
    normalized.heroineCounterType,
    normalized.powerStructure,
    normalized.publicPressure,
    normalized.hiddenTruthType,
    normalized.deadlineStyle,
  ].filter(Boolean)

  normalized.fingerprint = fingerprintParts.join('|')

  return normalized
}

export function buildMotifFingerprintFromSeed(seed: FactoryStorySeed) {
  const fullText = normalizeLooseText(
    [
      seed.title,
      seed.genreBlend?.join(' '),
      seed.corePremise,
      seed.openingScene,
      seed.incitingIncident,
      seed.evidenceObject,
      seed.mainConflict,
      seed.hiddenTruth,
      seed.setting,
      seed.villainType,
      seed.heroineArc,
      seed.emotionalHook,
      seed.powerStructure,
      seed.publicPressure,
      seed.shortFingerprint,
      seed.antiRepeatTags?.join(' '),
    ].join(' '),
  )

  return normalizeMotifFingerprint({
    premiseFamily: classifyPremiseFamily(fullText),
    openingArena: classifyArena(`${normalizeLooseText(seed.openingScene)} ${fullText}`),
    incitingIncident: seed.incitingIncident || seed.corePremise,
    evidenceType: classifyEvidenceType(`${normalizeLooseText(seed.evidenceObject)} ${fullText}`),
    evidenceObject: seed.evidenceObject,
    villainAttackType: classifyVillainAttackType(`${normalizeLooseText(seed.mainConflict)} ${fullText}`),
    heroineCounterType: classifyHeroineCounterType(`${normalizeLooseText(seed.heroineArc)} ${fullText}`),
    powerStructure: classifyPowerStructure(`${normalizeLooseText(seed.powerStructure)} ${fullText}`),
    publicPressure: classifyPublicPressure(`${normalizeLooseText(seed.publicPressure)} ${fullText}`),
    emotionalWound: seed.emotionalHook,
    hiddenTruthType: classifyHiddenTruthType(`${normalizeLooseText(seed.hiddenTruth)} ${fullText}`),
    mainArena: classifyArena(`${normalizeLooseText(seed.setting)} ${fullText}`),
    secondaryArena: '',
    relationshipCore: seed.mainConflict,
    twistEngine: seed.hiddenTruth,
    deadlineStyle: classifyDeadlineStyle(fullText),
    endingPromise: seed.shortFingerprint,
    antiRepeatTags: seed.antiRepeatTags,
  })
}

export function buildMotifTextFromFingerprint(
  fingerprint: StoryMotifFingerprint,
  seed?: Partial<FactoryStorySeed>,
) {
  const parts = [
    `premiseFamily: ${fingerprint.premiseFamily || 'unknown'}`,
    `openingArena: ${fingerprint.openingArena || 'unknown'}`,
    `incitingIncident: ${fingerprint.incitingIncident || seed?.incitingIncident || 'unknown'}`,
    `evidenceType: ${fingerprint.evidenceType || 'unknown'}`,
    `evidenceObject: ${fingerprint.evidenceObject || seed?.evidenceObject || 'unknown'}`,
    `villainAttackType: ${fingerprint.villainAttackType || 'unknown'}`,
    `heroineCounterType: ${fingerprint.heroineCounterType || 'unknown'}`,
    `powerStructure: ${fingerprint.powerStructure || 'unknown'}`,
    `publicPressure: ${fingerprint.publicPressure || 'unknown'}`,
    `hiddenTruthType: ${fingerprint.hiddenTruthType || 'unknown'}`,
    `mainArena: ${fingerprint.mainArena || 'unknown'}`,
    `deadlineStyle: ${fingerprint.deadlineStyle || 'unknown'}`,
    `antiRepeatTags: ${(fingerprint.antiRepeatTags || []).join(', ') || 'none'}`,
  ]

  if (seed?.corePremise) parts.push(`corePremise: ${seed.corePremise}`)
  if (seed?.hiddenTruth) parts.push(`hiddenTruth: ${seed.hiddenTruth}`)

  return parts.join('\n')
}

export function attachMotifToSeed(seed: FactoryStorySeed) {
  const motifFingerprint = buildMotifFingerprintFromSeed(seed)
  const motifText = buildMotifTextFromFingerprint(motifFingerprint, seed)

  return {
    ...seed,
    motifFingerprint,
    motifText,
  }
}

function readNestedObject(value: unknown, keys: string[]) {
  let current: any = value

  for (const key of keys) {
    if (!current || typeof current !== 'object') return null
    current = current[key]
  }

  return current && typeof current === 'object' ? current : null
}

export function extractMotifRegistryItemFromStory(story: ExistingStory): StoryMotifRegistryItem | null {
  const storyDna = story.story_dna as any

  if (!storyDna || typeof storyDna !== 'object') return null

  const factorySeed =
    readNestedObject(storyDna, ['factory_seed']) ||
    readNestedObject(storyDna, ['factorySeed']) ||
    readNestedObject(storyDna, ['seed'])

  const rawFingerprint =
    readNestedObject(storyDna, ['motifFingerprint']) ||
    readNestedObject(storyDna, ['motif_fingerprint']) ||
    readNestedObject(storyDna, ['factory_seed', 'motifFingerprint']) ||
    readNestedObject(storyDna, ['factorySeed', 'motifFingerprint']) ||
    readNestedObject(factorySeed, ['motifFingerprint'])

  const rawMotifText =
    safeText(storyDna.motifText) ||
    safeText(storyDna.motif_text) ||
    safeText(storyDna?.factory_seed?.motifText) ||
    safeText(storyDna?.factorySeed?.motifText)

  if (rawFingerprint) {
    const fingerprint = normalizeMotifFingerprint(rawFingerprint as StoryMotifFingerprint)

    return {
      storyId: story.id,
      title: story.title || undefined,
      fingerprint,
      motifText: rawMotifText || buildMotifTextFromFingerprint(fingerprint),
      embedding: Array.isArray(storyDna?.motifEmbedding) ? storyDna.motifEmbedding : undefined,
      source: 'story_dna',
    }
  }

  if (factorySeed) {
    const seed = factorySeed as FactoryStorySeed
    const enriched = attachMotifToSeed({
      title: safeText(seed.title, story.title || 'Truyện chưa có tên'),
      genreBlend: Array.isArray(seed.genreBlend) ? seed.genreBlend : [],
      corePremise: safeText(seed.corePremise, story.description || ''),
      openingScene: safeText(seed.openingScene),
      incitingIncident: safeText(seed.incitingIncident),
      evidenceObject: safeText(seed.evidenceObject),
      mainConflict: safeText(seed.mainConflict),
      hiddenTruth: safeText(seed.hiddenTruth),
      setting: safeText(seed.setting),
      villainType: safeText(seed.villainType),
      heroineArc: safeText(seed.heroineArc),
      emotionalHook: safeText(seed.emotionalHook),
      powerStructure: safeText(seed.powerStructure),
      publicPressure: safeText(seed.publicPressure),
      shortFingerprint: safeText(seed.shortFingerprint),
      antiRepeatTags: Array.isArray(seed.antiRepeatTags) ? seed.antiRepeatTags : [],
    })

    return {
      storyId: story.id,
      title: story.title || undefined,
      fingerprint: enriched.motifFingerprint || buildMotifFingerprintFromSeed(enriched),
      motifText: enriched.motifText || '',
      source: 'story_dna',
    }
  }

  return null
}

export function extractMotifRegistryItemsFromStories(stories: ExistingStory[]) {
  return stories
    .map((story) => extractMotifRegistryItemFromStory(story))
    .filter((item): item is StoryMotifRegistryItem => Boolean(item))
}