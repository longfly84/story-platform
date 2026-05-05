import type { CoverBlueprint, CoverConcept, JsonRecord, StoryInput, TitleDrivenVisuals } from './coverTypes.js'
import { normalizeText, pickVariant, safeString, uniqueStrings, stringifyUseful } from './coverText.js'
import { pickSummary } from './storyInput.js'

function flattenStoryKeywords(story: StoryInput, storyDna: JsonRecord | null): string {
  const pieces: string[] = [
    story.title,
    story.summary,
    story.description,
    story.genre,
    story.genreLabel,
    ...(story.genres || []),
    ...(story.tags || []),
  ].filter(Boolean) as string[]

  if (storyDna) {
    const maybePieces = [
      storyDna.corePremise,
      storyDna.openingScene,
      storyDna.incitingIncident,
      storyDna.hiddenTruth,
      storyDna.evidenceObject,
      storyDna.evidenceType,
      storyDna.emotionalStake,
      storyDna.villainAttack,
      storyDna.heroineCounter,
      storyDna.coverPromptHint,
      storyDna.motifText,
      storyDna.factory_seed,
      storyDna.storyPlan,
      storyDna.arena,
      storyDna.setting,
      storyDna.hookVisual,
      storyDna.visualArena,
    ]

    for (const item of maybePieces) {
      const text = stringifyUseful(item)
      if (text) pieces.push(text)
    }

    if (Array.isArray(storyDna.tags)) {
      pieces.push(...storyDna.tags.map((x: unknown) => safeString(x)))
    }

    if (storyDna.coverConcept && typeof storyDna.coverConcept === 'object') {
      const coverConcept = storyDna.coverConcept as JsonRecord
      pieces.push(
        safeString(coverConcept.arena),
        safeString(coverConcept.mood),
        safeString(coverConcept.secondaryFigure),
        safeString(coverConcept.compositionType),
      )

      if (Array.isArray(coverConcept.clueProps)) {
        pieces.push(...coverConcept.clueProps.map((x: unknown) => safeString(x)))
      }
    }

    if (storyDna.motifFingerprint && typeof storyDna.motifFingerprint === 'object') {
      const fp = storyDna.motifFingerprint as JsonRecord
      const fpCandidates = [
        fp.premiseFamily,
        fp.openingArena,
        fp.mainArena,
        fp.secondaryArena,
        fp.publicPressure,
        fp.powerStructure,
        fp.evidenceObject,
        fp.evidenceType,
        fp.hiddenTruthType,
        fp.villainAttackType,
        fp.heroineCounterType,
        fp.endingPromise,
      ]

      for (const item of fpCandidates) {
        if (typeof item === 'string') pieces.push(item)
      }
    }
  }

  return normalizeText(pieces.filter(Boolean).join(' | '))
}

function inferBlueprint(story: StoryInput, storyDna: JsonRecord | null): CoverBlueprint {
  const haystack = flattenStoryKeywords(story, storyDna)

  if (
    haystack.includes('showbiz') ||
    haystack.includes('hot search') ||
    haystack.includes('pr scandal') ||
    haystack.includes('paparazzi') ||
    haystack.includes('hop bao') ||
    haystack.includes('livestream') ||
    haystack.includes('weibo') ||
    haystack.includes('giai tri')
  ) {
    return 'showbiz-scandal'
  }

  if (
    haystack.includes('gia toc') ||
    haystack.includes('thua ke') ||
    haystack.includes('di chuc') ||
    haystack.includes('tu duong') ||
    haystack.includes('me chong') ||
    haystack.includes('nha chong') ||
    haystack.includes('co dong') ||
    haystack.includes('di san')
  ) {
    return 'family-inheritance'
  }

  if (
    haystack.includes('san bay') ||
    haystack.includes('boarding pass') ||
    haystack.includes('ve may bay') ||
    haystack.includes('mat tich') ||
    haystack.includes('departure') ||
    haystack.includes('hanh ly') ||
    haystack.includes('resort') ||
    haystack.includes('du lich')
  ) {
    return 'airport-mystery'
  }

  if (
    haystack.includes('ngoai tinh') ||
    haystack.includes('hon nhan') ||
    haystack.includes('chong') ||
    haystack.includes('ly hon') ||
    haystack.includes('ban than phan boi') ||
    haystack.includes('nguoi thu ba')
  ) {
    return 'marriage-betrayal'
  }

  if (
    haystack.includes('truong hoc') ||
    haystack.includes('phu huynh') ||
    haystack.includes('lop hoc') ||
    haystack.includes('con nho') ||
    haystack.includes('giao vien') ||
    haystack.includes('quyen nuoi con') ||
    haystack.includes('mau giao')
  ) {
    return 'child-school'
  }

  if (
    haystack.includes('benh vien') ||
    haystack.includes('ho so benh an') ||
    haystack.includes('xet nghiem') ||
    haystack.includes('adn') ||
    haystack.includes('dna') ||
    haystack.includes('phong cap cuu') ||
    haystack.includes('bac si')
  ) {
    return 'hospital-truth'
  }

  if (
    haystack.includes('tap doan') ||
    haystack.includes('hoi dong') ||
    haystack.includes('van phong') ||
    haystack.includes('thuong chien') ||
    haystack.includes('co phan') ||
    haystack.includes('hop dong') ||
    haystack.includes('doanh nghiep') ||
    haystack.includes('cong chung') ||
    haystack.includes('mau thiet ke') ||
    haystack.includes('show dien')
  ) {
    return 'corporate-war'
  }

  return 'general-drama'
}

export function pickStoryField(storyDna: JsonRecord | null, keys: string[]): string {
  if (!storyDna) return ''

  for (const key of keys) {
    const value = storyDna[key]
    const text = stringifyUseful(value)
    if (text.trim()) return text.trim()
  }

  return ''
}

function pickArrayField(storyDna: JsonRecord | null, keys: string[]): string[] {
  if (!storyDna) return []

  for (const key of keys) {
    const value = storyDna[key]
    if (Array.isArray(value)) {
      return value.map((item) => safeString(item)).filter(Boolean)
    }
  }

  return []
}

function inferTitleDrivenVisuals(story: StoryInput, storyDna: JsonRecord | null): TitleDrivenVisuals {
  const haystack = flattenStoryKeywords(story, storyDna)
  const titleNorm = normalizeText(story.title)
  const summaryNorm = normalizeText(pickSummary(story))
  const combined = `${titleNorm} | ${summaryNorm} | ${haystack}`

  const storyEvidence =
    pickStoryField(storyDna, ['evidenceObject', 'evidenceType', 'hookVisual', 'motifText']) || ''

  const base: TitleDrivenVisuals = {
    signatureObject: storyEvidence || 'một vật chứng then chốt gắn trực tiếp với bí mật của truyện',
    signatureScene: 'một khoảnh khắc phát hiện bí mật ngay trước khi cục diện đổi chiều',
    supportingProps: [],
    supportingFigures: [],
    visualConflict: [],
    heroineAction: 'nữ chính nắm giữ vật chứng, ánh mắt tỉnh táo và chuẩn bị phản công',
    arenaHint: '',
    moodHint: '',
  }

  if (combined.includes('the phong') || combined.includes('room card') || combined.includes('key card')) {
    return {
      signatureObject: 'một thẻ phòng khách sạn ánh vàng, có số phòng rõ ràng, rất dễ nhận ra',
      signatureScene:
        'khoảnh khắc nữ chính phát hiện chiếc thẻ phòng bị bỏ quên ngay trước cửa phòng khách sạn hoặc resort về đêm',
      supportingProps: ['cửa khóa điện tử phát sáng', 'vali du lịch kéo hờ', 'điện thoại hiện tin nhắn đáng ngờ'],
      supportingFigures: ['một bóng người vừa rời khỏi hành lang khách sạn'],
      visualConflict: ['một bí mật ngoại tình hoặc gặp gỡ lén lút vừa bị lộ bởi chiếc thẻ phòng'],
      heroineAction: 'nữ chính siết chặt thẻ phòng, đứng khựng lại giữa hành lang và nhận ra sự phản bội',
      arenaHint: 'hành lang khách sạn hoặc resort về đêm, ánh đèn cửa phòng và chiều sâu rõ ràng',
      moodHint: 'phản bội, phát hiện bất ngờ, căng và lạnh',
    }
  }

  if (combined.includes('chia khoa') || combined.includes('key') || combined.includes('keyhole')) {
    return {
      signatureObject: 'một chiếc chìa khóa kim loại nổi bật, có cảm giác không thuộc về nữ chính',
      signatureScene:
        'khoảnh khắc nữ chính cầm chiếc chìa khóa lạ trước cánh cửa hoặc căn phòng che giấu bí mật thân phận',
      supportingProps: ['ổ khóa cổ hoặc khóa cửa hiện đại', 'hộp nhỏ hoặc ngăn kéo bí mật', 'ánh đèn hắt vào chìa khóa'],
      supportingFigures: ['một bóng người theo dõi từ sau cánh cửa hoặc cuối hành lang'],
      visualConflict: ['chiếc chìa khóa lạ mở ra một bí mật bị chôn giấu'],
      heroineAction: 'nữ chính nâng chiếc chìa khóa lên trước mắt, vừa cảnh giác vừa quyết mở ra sự thật',
      arenaHint: 'căn nhà, hành lang hoặc căn phòng bí mật có chiều sâu điện ảnh',
      moodHint: 'bí mật gia đình, tò mò, căng thẳng và dự cảm nguy hiểm',
    }
  }

  if (combined.includes('chiec hop') || combined.includes('hop cu') || combined.includes('box')) {
    return {
      signatureObject: 'một chiếc hộp cũ nổi bật với cảm giác chứa bí mật quan trọng',
      signatureScene: 'khoảnh khắc chiếc hộp cũ được mở ra hoặc vừa bị phát hiện trong bối cảnh căng thẳng',
      supportingProps: ['nắp hộp hé mở', 'vật chứng phát sáng nhẹ bên trong', 'bụi và ánh đèn tạo cảm giác bí mật lâu năm'],
      supportingFigures: ['một bóng người muốn giành lại hoặc che giấu chiếc hộp'],
      visualConflict: ['bí mật bị phong kín lâu nay chuẩn bị bị bóc trần'],
      heroineAction: 'nữ chính ôm hoặc mở chiếc hộp cũ, ánh mắt chấn động nhưng quyết không lùi',
      arenaHint: 'căn phòng riêng, bệnh viện, nhà cũ hoặc không gian cất giấu bí mật',
      moodHint: 'bí ẩn, phát hiện, nghẹt thở',
    }
  }

  if (combined.includes('to giay') || combined.includes('giay') || combined.includes('note') || combined.includes('paper')) {
    return {
      signatureObject: 'một tờ giấy hoặc biên bản quan trọng với chi tiết bất thường rất dễ nhìn thấy',
      signatureScene: 'khoảnh khắc một tờ giấy không nên xuất hiện bị phát hiện giữa cuộc đối đầu căng thẳng',
      supportingProps: ['bàn họp hoặc bàn làm việc', 'dấu đỏ, chữ ký hoặc chi tiết bị sửa', 'điện thoại hoặc hồ sơ liên quan'],
      supportingFigures: ['một đối thủ đang muốn lấy lại tờ giấy', 'một nhóm người bị chạm vào bí mật'],
      visualConflict: ['tờ giấy là vật chứng khiến cục diện thay đổi'],
      heroineAction: 'nữ chính giữ chặt tờ giấy, ngẩng đầu nhìn thẳng đối thủ và sẵn sàng vạch trần sự thật',
      arenaHint: 'phòng họp, văn phòng, hành lang hoặc nơi công khai bí mật',
      moodHint: 'đấu trí, bằng chứng, căng thẳng công khai',
    }
  }

  if (combined.includes('su that') || combined.includes('nhin thay') || combined.includes('truth') || combined.includes('witness')) {
    return {
      signatureObject: 'một màn hình camera, phản chiếu trong gương, hoặc chi tiết cho thấy ai đó đã nhìn thấy sự thật',
      signatureScene: 'khoảnh khắc nữ chính nhận ra hoặc là người cuối cùng nhìn thấy sự thật không ai muốn lộ ra',
      supportingProps: ['màn hình giám sát hoặc điện thoại phát lại hình ảnh', 'ánh mắt phản chiếu rõ trong gương hoặc kính', 'manh mối phát sáng'],
      supportingFigures: ['một kẻ muốn bịt miệng nhân chứng', 'một bóng người bị lộ diện trong hình ảnh'],
      visualConflict: ['sự thật đã bị nhìn thấy và không thể thu lại'],
      heroineAction: 'nữ chính nhìn thẳng vào manh mối hoặc màn hình, vẻ mặt vừa sốc vừa kiên quyết giữ lấy sự thật',
      arenaHint: 'không gian bí mật, hành lang đêm, phòng giám sát hoặc nơi có lớp kính phản chiếu',
      moodHint: 'bí mật bị phơi bày, áp lực truy đuổi, nghẹt thở',
    }
  }

  if (combined.includes('ngay cuoi') || combined.includes('hon') || combined.includes('cuoi') || combined.includes('wedding')) {
    return {
      signatureObject: 'một chi tiết cưới nổi bật như khăn voan, bó hoa, thiệp cưới hoặc nhẫn cưới bị phá vỡ cảm giác hạnh phúc',
      signatureScene: 'khoảnh khắc biến cố nổ ra ngay trong bối cảnh cưới hỏi hoặc hủy hôn công khai',
      supportingProps: ['đèn sân khấu hoặc phông cưới', 'nhẫn cưới hoặc thiệp cưới', 'micro hoặc ánh nhìn của đám đông'],
      supportingFigures: ['một chú rể hoặc gia đình chồng bàng hoàng', 'một đối thủ đang bị lật mặt công khai'],
      visualConflict: ['hôn lễ biến thành chiến trường cảm xúc'],
      heroineAction: 'nữ chính đứng giữa không gian cưới hỏi với tư thế chủ động, lạnh lùng hoặc dứt khoát phản đòn',
      arenaHint: 'sân khấu cưới, đại sảnh, khán phòng hoặc bối cảnh công khai',
      moodHint: 'công khai, kịch tính, vả mặt, chiến thắng',
    }
  }

  if (
    combined.includes('adn') ||
    combined.includes('dna') ||
    combined.includes('xet nghiem') ||
    combined.includes('benh vien') ||
    combined.includes('ho so benh')
  ) {
    return {
      signatureObject: 'kết quả xét nghiệm, hồ sơ bệnh án hoặc vật chứng y khoa nổi bật',
      signatureScene: 'khoảnh khắc bí mật y khoa hoặc thân phận bị lật ra trong bối cảnh bệnh viện',
      supportingProps: ['hành lang bệnh viện', 'vòng tay bệnh nhân hoặc ống thuốc', 'ánh sáng lạnh của phòng khám'],
      supportingFigures: ['một bác sĩ hoặc người thân đang bị cuốn vào bí mật'],
      visualConflict: ['sự thật y khoa hoặc thân phận bị che giấu đang bị bóc trần'],
      heroineAction: 'nữ chính cầm chặt kết quả xét nghiệm hoặc hồ sơ, lao tới sự thật với vẻ mặt quyết liệt',
      arenaHint: 'bệnh viện, phòng xét nghiệm hoặc hành lang cấp cứu',
      moodHint: 'lạnh, khẩn cấp, đau đớn nhưng quyết không bỏ cuộc',
    }
  }

  if (
    combined.includes('hop bao') ||
    combined.includes('livestream') ||
    combined.includes('hot search') ||
    combined.includes('showbiz')
  ) {
    return {
      signatureObject: 'micro họp báo, màn hình LED hoặc điện thoại hiện hot search nổi bật',
      signatureScene: 'khoảnh khắc scandal bùng nổ ở buổi họp báo hoặc livestream công khai',
      supportingProps: ['flash paparazzi', 'màn hình sân khấu', 'biểu cảm sốc của đám đông'],
      supportingFigures: ['một đối thủ mỉm cười gượng', 'một người đàn ông quyền lực phía sau ánh đèn'],
      visualConflict: ['scandal công khai, truyền thông bủa vây, thế cờ đảo chiều'],
      heroineAction: 'nữ chính đứng giữa ánh đèn và micro, toát ra cảm giác chủ động lật ngược tình thế',
      arenaHint: 'sân khấu họp báo, khu truyền thông hoặc trường quay',
      moodHint: 'ồn ào, công khai, áp lực truyền thông, quyền lực',
    }
  }

  if (
    combined.includes('du lich') ||
    combined.includes('san bay') ||
    combined.includes('boarding pass') ||
    combined.includes('resort') ||
    combined.includes('vali')
  ) {
    return {
      signatureObject: 'vé máy bay, boarding pass, vali hoặc đạo cụ du lịch gắn với một bí mật chuyến đi',
      signatureScene: 'khoảnh khắc chuyến đi tưởng yên bình bỗng lộ ra phản bội hoặc mất tích',
      supportingProps: ['bảng chuyến bay hoặc hành lang resort', 'hành lý kéo', 'điện thoại chứa manh mối'],
      supportingFigures: ['một cặp đôi hoặc bóng người đang bỏ đi', 'một người phụ nữ thứ ba trong nền'],
      visualConflict: ['phản bội bị bắt quả tang giữa chuyến đi'],
      heroineAction: 'nữ chính đứng chặn lại hoặc chết lặng giữa không gian du lịch khi bí mật vỡ ra',
      arenaHint: 'sân bay, resort, bãi biển đêm hoặc hành lang khách sạn',
      moodHint: 'phản bội, phát hiện, gấp gáp',
    }
  }

  if (
    combined.includes('thuong chien') ||
    combined.includes('tap doan') ||
    combined.includes('hoi dong') ||
    combined.includes('hop dong') ||
    combined.includes('doanh nghiep') ||
    combined.includes('cong ty')
  ) {
    return {
      signatureObject: 'hợp đồng, thẻ ra vào, hồ sơ quyền lực hoặc màn hình dữ liệu doanh nghiệp nổi bật',
      signatureScene: 'khoảnh khắc thương chiến nổ ra trong phòng họp hoặc văn phòng quyền lực',
      supportingProps: ['bàn họp kính', 'màn hình số liệu', 'tòa nhà tập đoàn hoặc cửa kính'],
      supportingFigures: ['một người đàn ông quyền lực', 'đối thủ nữ hoặc nhóm hội đồng quản trị'],
      visualConflict: ['tranh quyền đoạt lợi, cướp đoạt vị trí, chuẩn bị phản công'],
      heroineAction: 'nữ chính giữ chặt hồ sơ hoặc hợp đồng, đứng thẳng trước không gian quyền lực với ánh mắt phản công',
      arenaHint: 'văn phòng cao cấp, phòng họp kính hoặc sảnh tập đoàn',
      moodHint: 'quyền lực, lạnh, đấu trí, phản công',
    }
  }

  if (combined.includes('truong hoc') || combined.includes('phu huynh') || combined.includes('mau giao') || combined.includes('quyen nuoi con')) {
    return {
      signatureObject: 'một chi tiết liên quan đến con trẻ như thẻ học sinh, cặp sách, hồ sơ nhập học hoặc tranh vẽ',
      signatureScene: 'khoảnh khắc nữ chính bảo vệ con trước áp lực công khai ở trường học',
      supportingProps: ['cổng trường hoặc hành lang lớp học', 'điện thoại hiện tin nhắn nhóm phụ huynh', 'bảng thông báo'],
      supportingFigures: ['một đứa trẻ đứng gần nữ chính', 'giáo viên hoặc phụ huynh gây áp lực trong nền'],
      visualConflict: ['đứa trẻ bị kéo vào cuộc chiến người lớn'],
      heroineAction: 'nữ chính che chắn cho con hoặc đứng chắn trước áp lực đám đông',
      arenaHint: 'trường học, hành lang lớp, buổi họp phụ huynh',
      moodHint: 'bảo vệ con, đau nhưng kiên cường',
    }
  }

  return base
}

function buildCompositionVariant(story: StoryInput) {
  const seed = story.slug || story.id || story.title
  const variants = [
    {
      compositionType:
        'heroine ở nửa trái khung hình, cận bán thân; vật chứng chính được phóng lớn gần tay hoặc trước ngực; phản diện ở trung cảnh; bối cảnh trải sâu phía sau',
      cameraAngle: 'medium close-up hơi thấp, cinematic, tạo cảm giác nhân vật đang chiếm lại thế chủ động',
    },
    {
      compositionType:
        'heroine ở trung tâm hoặc hơi lệch phải; vật chứng chính nằm ở tiền cảnh rất rõ; một nhân vật phụ hoặc bóng người ở hậu cảnh; không gian câu chuyện hiện rõ',
      cameraAngle: 'medium shot ngang tầm mắt, storytelling poster, cân bằng giữa nhân vật và bối cảnh',
    },
    {
      compositionType:
        'heroine bước trong không gian câu chuyện, vật chứng chính nằm trên đường chéo khung hình; hậu cảnh có chiều sâu và một bóng người đe dọa hoặc theo dõi',
      cameraAngle: 'wide-medium shot, góc nhìn điện ảnh, ưu tiên chiều sâu bối cảnh',
    },
    {
      compositionType:
        'heroine ở tiền cảnh rõ nét với biểu cảm mạnh; vật chứng chính đặt gần camera; phản diện hoặc nhân vật liên quan bị đẩy về sau qua lớp kính, cửa, hoặc ánh đèn',
      cameraAngle: 'dramatic perspective with foreground object emphasis',
    },
    {
      compositionType:
        'poster kiểu phân lớp rõ rệt: tiền cảnh là nữ chính và vật chứng, trung cảnh là xung đột hoặc nhân vật phụ, hậu cảnh là địa điểm then chốt của truyện',
      cameraAngle: 'three-layer poster framing, giàu kể chuyện, đọc tốt ở thumbnail',
    },
  ]

  return pickVariant(seed, variants)
}

export function buildCoverConcept(story: StoryInput, storyDna: JsonRecord | null): CoverConcept {
  const blueprint = inferBlueprint(story, storyDna)
  const titleDriven = inferTitleDrivenVisuals(story, storyDna)

  const heroineLook =
    pickStoryField(storyDna, [
      'heroineVisual',
      'heroineLook',
      'heroineArchetype',
      'heroineType',
      'heroineArc',
    ]) || 'một nữ chính hiện đại, sắc sảo, mạnh mẽ, ánh mắt có chiều sâu, chịu tổn thương nhưng không yếu'

  const dnaCoverConcept =
    storyDna && typeof storyDna.coverConcept === 'object'
      ? (storyDna.coverConcept as JsonRecord)
      : null

  const dnaClueProps = uniqueStrings([
    ...(Array.isArray(dnaCoverConcept?.clueProps)
      ? dnaCoverConcept.clueProps.map((x: unknown) => safeString(x))
      : []),
    ...pickArrayField(storyDna, ['clueProps', 'visualClues', 'hookProps']),
    pickStoryField(storyDna, ['evidenceObject', 'evidenceType', 'hookVisual']),
  ])

  const dnaSecondary = uniqueStrings([
    ...(Array.isArray(dnaCoverConcept?.secondaryFigures)
      ? dnaCoverConcept.secondaryFigures.map((x: unknown) => safeString(x))
      : []),
    safeString(dnaCoverConcept?.secondaryFigure),
    pickStoryField(storyDna, ['villainFigure', 'villainType', 'secondaryFigure', 'shadowFigure']),
  ])

  const dnaConflictVisuals = uniqueStrings([
    ...(Array.isArray(dnaCoverConcept?.conflictVisuals)
      ? dnaCoverConcept.conflictVisuals.map((x: unknown) => safeString(x))
      : []),
    pickStoryField(storyDna, [
      'villainAttack',
      'villainAttackType',
      'heroineCounter',
      'heroineCounterType',
      'emotionalStake',
      'mainConflict',
    ]),
  ])

  const presets: Record<CoverBlueprint, Omit<CoverConcept, 'blueprint' | 'heroineLook' | 'heroineAction' | 'signatureObject' | 'signatureScene' | 'compositionType' | 'cameraAngle' | 'antiGenericNotes'>> = {
    'showbiz-scandal': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        titleDriven.arenaHint ||
        'một buổi họp báo, sân khấu hoặc khu truyền thông với màn hình LED, flash paparazzi và không khí scandal công khai',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        titleDriven.moodHint ||
        'truyền thông bùng nổ, công khai, scandal, thắng thua, bị dồn ép trước công chúng',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : [...titleDriven.supportingFigures, 'một người đàn ông lạnh lùng phía sau', 'một người phụ nữ đối thủ với nụ cười khiêu khích'],
      clueProps:
        titleDriven.supportingProps.length > 0
          ? [titleDriven.signatureObject, ...titleDriven.supportingProps, ...dnaClueProps]
          : ['điện thoại hiện hot search', 'micro họp báo', 'màn hình scandal', 'ánh flash paparazzi', ...dnaClueProps],
      conflictVisuals:
        titleDriven.visualConflict.length > 0
          ? [...titleDriven.visualConflict, ...dnaConflictVisuals]
          : ['xuất hiện scandal hoặc hot search công khai', 'không khí bị công kích trước truyền thông', ...dnaConflictVisuals],
      mustShowElements: ['nữ chính', 'ít nhất một đối thủ/phản diện phụ', 'màn hình/hot search', 'một vật chứng rõ'],
      colorTone: 'đỏ đen vàng, ánh sáng truyền thông mạnh, high contrast',
    },

    'family-inheritance': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        titleDriven.arenaHint ||
        'biệt thự, từ đường, phòng họp gia tộc hoặc không gian thừa kế quyền lực',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        titleDriven.moodHint ||
        'đấu đá gia tộc, bí mật di sản, quyền lực lạnh lùng, nghi kỵ',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : [...titleDriven.supportingFigures, 'một trưởng bối nghiêm khắc', 'một người đàn ông quyền lực hoặc mẹ chồng sắc lạnh'],
      clueProps:
        titleDriven.supportingProps.length > 0
          ? [titleDriven.signatureObject, ...titleDriven.supportingProps, ...dnaClueProps]
          : ['chìa khóa đồng', 'di chúc hoặc hồ sơ thừa kế', 'nhẫn hoặc con dấu gia tộc', ...dnaClueProps],
      conflictVisuals:
        titleDriven.visualConflict.length > 0
          ? [...titleDriven.visualConflict, ...dnaConflictVisuals]
          : ['không khí tranh giành di sản', 'đối đầu lạnh giữa các thành viên gia tộc', ...dnaConflictVisuals],
      mustShowElements: ['nữ chính', 'ít nhất một trưởng bối hoặc phản diện', 'chìa khóa/hồ sơ', 'bối cảnh gia tộc'],
      colorTone: 'xanh đậm, vàng tối, nâu đen sang trọng',
    },

    'airport-mystery': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        titleDriven.arenaHint ||
        'sân bay, resort, hành lang chờ, bảng chuyến bay hoặc không gian di chuyển gợi mất tích và truy đuổi',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        titleDriven.moodHint ||
        'bí ẩn, khẩn cấp, mất tích, truy vết, lạnh và căng',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : [...titleDriven.supportingFigures, 'một bóng người đang rời đi', 'một người đàn ông quay lưng chuẩn bị biến mất'],
      clueProps:
        titleDriven.supportingProps.length > 0
          ? [titleDriven.signatureObject, ...titleDriven.supportingProps, ...dnaClueProps]
          : ['vé máy bay hoặc boarding pass', 'điện thoại/camera an ninh', 'vali hoặc hành lý', ...dnaClueProps],
      conflictVisuals:
        titleDriven.visualConflict.length > 0
          ? [...titleDriven.visualConflict, ...dnaConflictVisuals]
          : ['manh mối bị che giấu khi ai đó rời đi', 'không khí truy vết gấp gáp', ...dnaConflictVisuals],
      mustShowElements: ['nữ chính', 'bóng người rời đi', 'vé hoặc điện thoại/camera', 'sân bay/resort'],
      colorTone: 'xanh lạnh, trắng xám, cinematic night lighting',
    },

    'marriage-betrayal': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        titleDriven.arenaHint ||
        'phòng khách sang trọng, khách sạn, bàn ăn, phòng ngủ hoặc nơi đối đầu tình cảm',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        titleDriven.moodHint ||
        'phản bội, đau đớn, lạnh lòng, chuẩn bị trả thù',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : [...titleDriven.supportingFigures, 'một người chồng hoặc bạn trai trong nền', 'một người phụ nữ thứ ba mờ phía sau'],
      clueProps:
        titleDriven.supportingProps.length > 0
          ? [titleDriven.signatureObject, ...titleDriven.supportingProps, ...dnaClueProps]
          : ['nhẫn cưới', 'tin nhắn trong điện thoại', 'ly rượu hoặc chìa khóa phòng khách sạn', ...dnaClueProps],
      conflictVisuals:
        titleDriven.visualConflict.length > 0
          ? [...titleDriven.visualConflict, ...dnaConflictVisuals]
          : ['không khí phản bội tình cảm', 'một sự thật bị bóc trần', ...dnaConflictVisuals],
      mustShowElements: ['nữ chính', 'ít nhất một người phản bội', 'vật chứng tình cảm', 'không gian quan hệ đổ vỡ'],
      colorTone: 'đỏ đô, đen, vàng tối',
    },

    'child-school': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        titleDriven.arenaHint ||
        'trường học, buổi họp phụ huynh, hành lang lớp học, cổng trường hoặc nhóm phụ huynh bị công khai',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        titleDriven.moodHint ||
        'bảo vệ con, áp lực xã hội, tổn thương nhưng kiên cường',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : [...titleDriven.supportingFigures, 'một đứa trẻ đứng cạnh hoặc phía sau nữ chính', 'phụ huynh hoặc giáo viên trong nền'],
      clueProps:
        titleDriven.supportingProps.length > 0
          ? [titleDriven.signatureObject, ...titleDriven.supportingProps, ...dnaClueProps]
          : ['hồ sơ nhập học', 'điện thoại hiện nhóm phụ huynh', 'thẻ truy cập', 'cặp sách hoặc đồng phục học sinh', ...dnaClueProps],
      conflictVisuals:
        titleDriven.visualConflict.length > 0
          ? [...titleDriven.visualConflict, ...dnaConflictVisuals]
          : ['đứa trẻ bị kéo vào cuộc chiến người lớn', 'nữ chính bảo vệ con dưới áp lực công khai', ...dnaConflictVisuals],
      mustShowElements: ['nữ chính', 'đứa trẻ', 'vật chứng/hồ sơ hoặc điện thoại', 'bối cảnh trường học'],
      colorTone: 'xanh xám, vàng ấm nhẹ, buồn nhưng có lực',
    },

    'hospital-truth': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        titleDriven.arenaHint ||
        'bệnh viện, hành lang cấp cứu, phòng bệnh hoặc nơi cất giấu bí mật y khoa',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        titleDriven.moodHint ||
        'sự thật y khoa bị che giấu, lạnh, căng, đau và khẩn trương',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : [...titleDriven.supportingFigures, 'một bác sĩ hoặc y tá trong nền', 'một người thân yếu thế phía sau'],
      clueProps:
        titleDriven.supportingProps.length > 0
          ? [titleDriven.signatureObject, ...titleDriven.supportingProps, ...dnaClueProps]
          : ['hồ sơ bệnh án', 'kết quả xét nghiệm', 'vòng tay bệnh viện', 'ống thuốc', ...dnaClueProps],
      conflictVisuals:
        titleDriven.visualConflict.length > 0
          ? [...titleDriven.visualConflict, ...dnaConflictVisuals]
          : ['bí mật thân phận hoặc bệnh án bị che lại', 'cuộc chạy đua tìm sự thật', ...dnaConflictVisuals],
      mustShowElements: ['nữ chính', 'người thân/bác sĩ', 'hồ sơ/xét nghiệm', 'bối cảnh bệnh viện'],
      colorTone: 'trắng xanh lạnh, xám bạc',
    },

    'corporate-war': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        titleDriven.arenaHint ||
        'phòng họp kính, sàn diễn, văn phòng cao cấp, tòa nhà tập đoàn hoặc không gian thương chiến hiện đại',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        titleDriven.moodHint ||
        'đấu trí, quyền lực, cướp đoạt, phản công, sức ép nghề nghiệp công khai',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : [...titleDriven.supportingFigures, 'một người đàn ông quyền lực trong bộ vest', 'một đối thủ nữ hoặc nhóm hội đồng ở nền'],
      clueProps:
        titleDriven.supportingProps.length > 0
          ? [titleDriven.signatureObject, ...titleDriven.supportingProps, ...dnaClueProps]
          : ['mẫu thiết kế hoặc hồ sơ hợp đồng', 'thẻ ra vào', 'điện thoại chứa bằng chứng', 'màn hình dữ liệu', ...dnaClueProps],
      conflictVisuals:
        titleDriven.visualConflict.length > 0
          ? [...titleDriven.visualConflict, ...dnaConflictVisuals]
          : ['đối đầu công việc hoặc cướp quyền', 'nữ chính chuẩn bị lật thế cờ', ...dnaConflictVisuals],
      mustShowElements: ['nữ chính', 'ít nhất một đối thủ', 'mẫu thiết kế/hồ sơ', 'bối cảnh công ty hoặc show diễn'],
      colorTone: 'xanh đen, xám bạc, vàng kim nhẹ',
    },

    'general-drama': {
      arena:
        safeString(dnaCoverConcept?.arena) ||
        titleDriven.arenaHint ||
        'một bối cảnh hiện đại có chiều sâu, đủ kể câu chuyện chứ không phải nền trống',
      mood:
        safeString(dnaCoverConcept?.mood) ||
        titleDriven.moodHint ||
        'drama, bí mật, phản công, căng thẳng cảm xúc',
      secondaryFigures:
        dnaSecondary.length > 0
          ? dnaSecondary
          : [...titleDriven.supportingFigures, 'ít nhất một nhân vật phụ hoặc bóng người liên quan trực tiếp đến bí mật'],
      clueProps:
        titleDriven.supportingProps.length > 0
          ? [titleDriven.signatureObject, ...titleDriven.supportingProps, ...dnaClueProps]
          : ['một đến hai đạo cụ manh mối', 'điện thoại hoặc tài liệu gợi bí mật', ...dnaClueProps],
      conflictVisuals:
        titleDriven.visualConflict.length > 0
          ? [...titleDriven.visualConflict, ...dnaConflictVisuals]
          : ['căng thẳng đối đầu', 'bí mật chuẩn bị bị bóc trần', ...dnaConflictVisuals],
      mustShowElements: ['nữ chính', 'nhân vật phụ hoặc bóng người', 'vật chứng rõ', 'bối cảnh có câu chuyện'],
      colorTone: 'cinematic, rõ chiều sâu, không tối bệt',
    },
  }

  const picked = presets[blueprint]
  const compositionVariant = buildCompositionVariant(story)

  return {
    blueprint,
    heroineLook,
    heroineAction:
      titleDriven.heroineAction ||
      'nữ chính đang ở đúng khoảnh khắc nắm được manh mối và chuẩn bị phản công',
    signatureObject:
      titleDriven.signatureObject ||
      dnaClueProps[0] ||
      'một vật chứng then chốt có liên quan trực tiếp đến bí mật của truyện',
    signatureScene: titleDriven.signatureScene || picked.arena,
    arena: picked.arena,
    mood: picked.mood,
    secondaryFigures: uniqueStrings(picked.secondaryFigures, 4),
    clueProps: uniqueStrings(picked.clueProps, 5),
    conflictVisuals: uniqueStrings(picked.conflictVisuals, 4),
    mustShowElements: uniqueStrings([
      ...picked.mustShowElements,
      'vật chứng chính phải nổi bật và dễ nhận ra',
      'bố cục phải kể được câu chuyện riêng của truyện này',
    ], 8),
    colorTone: picked.colorTone,
    compositionType: compositionVariant.compositionType,
    cameraAngle: compositionVariant.cameraAngle,
    antiGenericNotes: uniqueStrings([
      'không biến cover thành chân dung nữ chính đứng một mình trên nền tối',
      'không mặc định cho nữ chính cầm giấy nếu câu chuyện không thật sự xoay quanh giấy tờ',
      'vật chứng chính phải khác biệt theo title và premise của truyện',
      'bối cảnh phải gợi đúng thế giới truyện, không dùng nền mơ hồ chung chung',
      'ít nhất một nhân vật phụ hoặc bóng người phải hiện diện để tạo xung đột',
    ], 6),
  }
}
