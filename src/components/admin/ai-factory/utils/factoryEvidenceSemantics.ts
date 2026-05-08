export type FactoryEvidenceSemanticType =
  | 'cake_order_slip'
  | 'cafeteria_seat_ticket'
  | 'locker_access_card'
  | 'hotel_room_key'
  | 'laundry_tag'
  | 'sewing_thread_button'
  | 'plant_pot_label'
  | 'bottle_cap_scratch'
  | 'bracelet_bead'
  | 'photo_ribbon'
  | 'towel_embroidery'
  | 'note_piece'
  | 'unknown'

export type FactoryEvidenceSemantics = {
  semanticType: FactoryEvidenceSemanticType
  title: string
  titleVariants: string[]
  worldLabel: string
  settingHints: string[]
  conflictHints: string[]
  forbiddenMeanings: string[]
  confidence: number
  reason: string
}

function safeString(value: unknown) {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim()
  return ''
}

export function normalizeFactoryEvidenceText(value: unknown) {
  return safeString(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ä‘/g, 'd')
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordsOf(value: string) {
  return value.split(/\s+/).filter(Boolean)
}

function hasWord(text: string, word: string) {
  return wordsOf(text).includes(word)
}

function hasAllWords(text: string, words: string[]) {
  return words.every((word) => hasWord(text, word))
}

function hasAnyWord(text: string, words: string[]) {
  return words.some((word) => hasWord(text, word))
}

function hasPhrase(text: string, phrases: string[]) {
  return phrases.some((phrase) => text.includes(normalizeFactoryEvidenceText(phrase)))
}

function makeSemantic(params: Omit<FactoryEvidenceSemantics, 'titleVariants'> & {
  titleVariants?: string[]
}): FactoryEvidenceSemantics {
  return {
    ...params,
    titleVariants: Array.from(new Set([params.title, ...(params.titleVariants || [])])),
  }
}

export function buildFactoryEvidenceContextText(seed: unknown) {
  const record = seed && typeof seed === 'object' && !Array.isArray(seed)
    ? (seed as Record<string, unknown>)
    : {}

  return [
    record.title,
    record.genre,
    record.genreLabel,
    record.setting,
    record.openingArena,
    record.mainArena,
    record.evidenceObject,
    record.evidenceType,
    record.signatureObject,
    record.relationshipConflict,
    record.coreConflict,
    record.publicPressure,
    record.hiddenTruth,
    record.villainAttack,
    record.heroineCounter,
    record.motifText,
    record.shortFingerprint,
    record.fingerprint,
  ]
    .map(safeString)
    .filter(Boolean)
    .join(' | ')
}

export function resolveFactoryEvidenceSemantics(params: {
  evidenceText?: unknown
  contextText?: unknown
}): FactoryEvidenceSemantics {
  const evidence = normalizeFactoryEvidenceText(params.evidenceText)
  const context = normalizeFactoryEvidenceText(params.contextText)
  const text = `${evidence} ${context}`.trim()

  const hasTicketWord = hasAnyWord(text, ['ve', 'phieu'])
  const hasCardWord = hasAnyWord(text, ['the', 'card'])
  const isCakeOrder =
    hasPhrase(text, [
      'phieu dat banh',
      'phieu banh',
      'goc phieu banh',
      'phieu banh bi xe',
      'banh bi xe goc',
      'hoa don banh',
      'don banh',
    ]) || hasAllWords(text, ['phieu', 'banh'])

  // ORDER MATTERS:
  // Cake slip must be resolved before food ticket because "banh" contains "an" in raw text.
  if (isCakeOrder) {
    return makeSemantic({
      semanticType: 'cake_order_slip',
      title: 'Phiáº¿u BÃ¡nh Bá»‹ XÃ© GÃ³c',
      titleVariants: ['GÃ³c Phiáº¿u BÃ¡nh Bá»‹ XÃ©', 'Tá» Phiáº¿u Äáº·t BÃ¡nh Bá»‹ XÃ©'],
      worldLabel: 'tiá»‡m bÃ¡nh / Ä‘Æ¡n Ä‘áº·t bÃ¡nh / phá»¥ huynh',
      settingHints: [
        'quáº§y nháº­n bÃ¡nh cá»§a tiá»‡m bÃ¡nh',
        'khu giao bÃ¡nh gáº§n lá»›p há»c',
        'sáº£nh chung cÆ° nÆ¡i phá»¥ huynh Ä‘á»‘i cháº¥t vá» Ä‘Æ¡n bÃ¡nh',
      ],
      conflictHints: [
        'phiáº¿u Ä‘áº·t bÃ¡nh bá»‹ xÃ© gÃ³c bá»‹ dÃ¹ng Ä‘á»ƒ Ä‘á»• lá»—i cho ná»¯ chÃ­nh',
        'Ä‘Æ¡n bÃ¡nh bá»‹ sá»­a sau khi rá»i quáº§y, khiáº¿n ná»¯ chÃ­nh bá»‹ hiá»ƒu sai',
      ],
      forbiddenMeanings: ['vÃ© Äƒn', 'phiáº¿u Äƒn', 'nhÃ  Äƒn', 'sá»‘ gháº¿', 'tháº» phÃ²ng', 'tháº» tá»§ Ä‘á»“'],
      confidence: 0.98,
      reason: 'matched cake/order-slip semantics before generic food-ticket semantics',
    })
  }

  const isLockerCard =
    hasPhrase(text, [
      'the tu do',
      'the locker',
      'locker',
      'tu locker',
      'khe tu',
      'phong tap',
      'cau lac bo the thao',
      'the thanh vien',
      'so thanh vien',
    ]) ||
    (hasCardWord && hasAnyWord(text, ['locker', 'tu']) && hasAnyWord(text, ['do', 'tap', 'the thao', 'cau']))

  // Locker card must be resolved before hotel room key because "phong tap" contains "phong".
  if (isLockerCard) {
    return makeSemantic({
      semanticType: 'locker_access_card',
      title: 'Táº¥m Tháº» Tá»§ Äá»“ Bá»‹ Äáº·t Sai',
      titleVariants: ['Táº¥m Tháº» á»ž Tá»§ Äá»“ PhÃ²ng Táº­p', 'Chiáº¿c Tháº» Trong Khe Locker'],
      worldLabel: 'phÃ²ng táº­p / cÃ¢u láº¡c bá»™ thá»ƒ thao / khu tá»§ Ä‘á»“',
      settingHints: [
        'khu tá»§ Ä‘á»“ cá»§a cÃ¢u láº¡c bá»™ thá»ƒ thao',
        'bÃ n quáº£n lÃ½ tháº» thÃ nh viÃªn á»Ÿ phÃ²ng táº­p',
        'hÃ nh lang locker cáº¡nh khu tráº» em',
      ],
      conflictHints: [
        'tháº» tá»§ Ä‘á»“ bá»‹ Ä‘áº·t sai chá»— Ä‘á»ƒ gÃ¡n ná»¯ chÃ­nh vá»›i má»™t viá»‡c cÃ´ khÃ´ng lÃ m',
        'tháº» thÃ nh viÃªn bá»‹ chuyá»ƒn sang locker cá»§a ngÆ°á»i khÃ¡c Ä‘á»ƒ táº¡o hiá»ƒu láº§m',
      ],
      forbiddenMeanings: ['tháº» phÃ²ng khÃ¡ch sáº¡n', 'room key', 'khÃ¡ch sáº¡n', 'phÃ²ng VIP'],
      confidence: 0.97,
      reason: 'matched locker/gym access-card semantics before hotel-room-key semantics',
    })
  }

  const isCafeteriaSeatTicket =
    hasTicketWord &&
    (
      hasPhrase(text, ['ve an', 'phieu an', 'nha an', 'so ghe', 'cho ngoi', 'ban an hoc sinh']) ||
      hasAllWords(text, ['so', 'ghe']) ||
      (hasWord(text, 'an') && hasAnyWord(text, ['ghe', 'ban', 'nha']))
    )

  if (isCafeteriaSeatTicket) {
    return makeSemantic({
      semanticType: 'cafeteria_seat_ticket',
      title: 'VÃ© Ä‚n Sá»‘ Gháº¿ Lá»‡ch',
      titleVariants: ['Táº¥m VÃ© Ä‚n Bá»‹ Äá»•i Sá»‘', 'Dáº¥u Má»±c TrÃªn VÃ© Ä‚n'],
      worldLabel: 'trÆ°á»ng há»c / nhÃ  Äƒn / sá»‘ gháº¿ / phá»¥ huynh',
      settingHints: [
        'quáº§y phÃ¡t vÃ© Äƒn cá»§a nhÃ  Äƒn',
        'khu bÃ n Äƒn cÃ³ Ä‘Ã¡nh sá»‘ gháº¿',
        'phÃ²ng há»p phá»¥ huynh cáº¡nh nhÃ  Äƒn',
      ],
      conflictHints: [
        'vÃ© Äƒn cÃ³ sá»‘ gháº¿ bá»‹ Ä‘á»•i Ä‘á»ƒ khiáº¿n ná»¯ chÃ­nh bá»‹ hiá»ƒu sai',
        'sá»‘ gháº¿ trÃªn phiáº¿u Äƒn bá»‹ dÃ¹ng lÃ m báº±ng chá»©ng giáº£',
      ],
      forbiddenMeanings: ['phiáº¿u Ä‘áº·t bÃ¡nh', 'tiá»‡m bÃ¡nh', 'tháº» phÃ²ng', 'locker'],
      confidence: 0.95,
      reason: 'matched food-ticket/seat-number semantics with word-level token checks',
    })
  }

  const isHotelRoomKey =
    hasCardWord &&
    hasPhrase(text, ['the phong', 'room key', 'khach san', 'phong khach san', 'suite', 'le tan khach san']) &&
    !hasPhrase(text, ['phong tap', 'tu do', 'locker'])

  if (isHotelRoomKey) {
    return makeSemantic({
      semanticType: 'hotel_room_key',
      title: 'Táº¥m Tháº» PhÃ²ng Bá»‹ Bá» QuÃªn',
      titleVariants: ['Tháº» PhÃ²ng Quáº¹t LÃºc Ná»­a ÄÃªm', 'Dáº¥u Quáº¹t TrÃªn Tháº» PhÃ²ng'],
      worldLabel: 'khÃ¡ch sáº¡n / tháº» phÃ²ng / hÃ nh lang riÃªng tÆ°',
      settingHints: ['hÃ nh lang khÃ¡ch sáº¡n', 'quáº§y lá»… tÃ¢n', 'cá»­a phÃ²ng cÃ³ tháº» tá»«'],
      conflictHints: ['tháº» phÃ²ng bá»‹ dÃ¹ng Ä‘á»ƒ dá»±ng hiá»ƒu láº§m vá» má»™t cuá»™c gáº·p riÃªng tÆ°'],
      forbiddenMeanings: ['tháº» tá»§ Ä‘á»“', 'locker', 'phÃ²ng táº­p'],
      confidence: 0.92,
      reason: 'matched hotel room-key semantics',
    })
  }

  if (hasPhrase(text, ['the giat', 'tiem giat', 'bien lai giat', 'ao con ghim the']) || hasAllWords(text, ['the', 'giat'])) {
    return makeSemantic({
      semanticType: 'laundry_tag',
      title: 'Tháº» Giáº·t CÃ²n Ghim',
      titleVariants: ['Táº¥m Tháº» á»ž Tiá»‡m Giáº·t', 'Dáº¥u Váº£i Sau Láº§n Giáº·t'],
      worldLabel: 'tiá»‡m giáº·t / Ä‘á»“ gá»­i nháº§m / khu dÃ¢n cÆ°',
      settingHints: ['quáº§y nháº­n Ä‘á»“ cá»§a tiá»‡m giáº·t', 'ká»‡ Ã¡o tráº£ khÃ¡ch', 'khu dÃ¢n cÆ° trÆ°á»›c tiá»‡m giáº·t'],
      conflictHints: ['tháº» giáº·t bá»‹ ghim láº¡i Ä‘á»ƒ Ä‘á»• lá»—i cho ná»¯ chÃ­nh'],
      forbiddenMeanings: ['tháº» phÃ²ng', 'tháº» tá»§ Ä‘á»“'],
      confidence: 0.94,
      reason: 'matched laundry-tag semantics',
    })
  }

  if (hasPhrase(text, ['soi chi', 'khuy ao', 'chi con mac', 'mui khau', 'cuon chi'])) {
    return makeSemantic({
      semanticType: 'sewing_thread_button',
      title: 'Sá»£i Chá»‰ á»ž Khuy Ão',
      titleVariants: ['Sá»£i Chá»‰ CÃ²n Máº¯c á»ž Khuy Ão', 'Chiáº¿c Khuy Ão CÃ³ Sá»£i Chá»‰ Láº¡'],
      worldLabel: 'xÆ°á»Ÿng may / phÃ²ng thá»­ Ä‘á»“ / Ã¡o bá»‹ sá»­a',
      settingHints: ['phÃ²ng thá»­ Ä‘á»“ cá»§a xÆ°á»Ÿng may', 'tiá»‡m sá»­a Ä‘á»“', 'khu tá»§ Ä‘á»“ cÃ³ Ã¡o bá»‹ treo nháº§m'],
      conflictHints: ['sá»£i chá»‰ láº¡ trÃªn khuy Ã¡o bá»‹ dÃ¹ng lÃ m báº±ng chá»©ng giáº£'],
      forbiddenMeanings: ['vÃ© Äƒn', 'tháº» phÃ²ng'],
      confidence: 0.95,
      reason: 'matched sewing thread/button semantics',
    })
  }

  if (hasPhrase(text, ['nhan chau', 'chau cay', 'chau hoa', 'tem kim loai tren chau', 'cua hang cay'])) {
    return makeSemantic({
      semanticType: 'plant_pot_label',
      title: 'Cháº­u CÃ¢y Bá»‹ Cáº¯m Sai NhÃ£n',
      titleVariants: ['Táº¥m NhÃ£n TrÃªn Cháº­u CÃ¢y', 'Chiáº¿c NhÃ£n TrÃªn Cháº­u CÃ¢y'],
      worldLabel: 'nhÃ  tráº» / cháº­u cÃ¢y / phá»¥ huynh / cá»­a hÃ ng cÃ¢y',
      settingHints: ['cá»•ng nhÃ  tráº» cáº¡nh khu nháº­n quÃ ', 'cá»­a hÃ ng cÃ¢y', 'lá»›p há»c cÃ³ cháº­u cÃ¢y táº·ng tráº»'],
      conflictHints: ['nhÃ£n cháº­u cÃ¢y bá»‹ Ä‘á»•i Ä‘á»ƒ vu ná»¯ chÃ­nh'],
      forbiddenMeanings: ['nhÃ£n há»“ sÆ¡', 'tháº» phÃ²ng'],
      confidence: 0.94,
      reason: 'matched plant-pot-label semantics',
    })
  }

  if (hasPhrase(text, ['nap chai', 'vet xuoc tren nap', 'nap chai co vet xuoc'])) {
    return makeSemantic({
      semanticType: 'bottle_cap_scratch',
      title: 'Náº¯p Chai CÃ³ Váº¿t XÆ°á»›c',
      titleVariants: ['Váº¿t XÆ°á»›c TrÃªn Náº¯p Chai', 'Dáº¥u MÃ u TrÃªn Náº¯p Chai'],
      worldLabel: 'Ä‘á»i sá»‘ng sá»± kiá»‡n / bÃ n nÆ°á»›c / studio gia Ä‘Ã¬nh',
      settingHints: ['bÃ n nÆ°á»›c trong studio', 'khu bÃ£i xe sau sá»± kiá»‡n', 'gÃ³c quáº§y nÆ°á»›c'],
      conflictHints: ['náº¯p chai bá»‹ trÃ¡o vá»‹ trÃ­ Ä‘á»ƒ dá»±ng chuyá»‡n'],
      forbiddenMeanings: ['tháº» phÃ²ng', 'vÃ© Äƒn'],
      confidence: 0.9,
      reason: 'matched bottle cap/scratch semantics',
    })
  }

  if (hasPhrase(text, ['hat vong', 'vong tay', 'vong su kien', 'hat vong bi dut'])) {
    return makeSemantic({
      semanticType: 'bracelet_bead',
      title: hasPhrase(text, ['hat vong']) ? 'Háº¡t VÃ²ng Sai Chá»—' : 'VÃ²ng Tay Sá»± Kiá»‡n Bá»‹ Äá»•i MÃ u',
      titleVariants: ['Háº¡t VÃ²ng CÃ²n Máº¯c Trong Khe Gháº¿', 'VÃ²ng Tay Sá»± Kiá»‡n Bá»‹ Äá»•i MÃ u'],
      worldLabel: 'trÆ°á»ng há»c / sá»± kiá»‡n tráº» em / Ä‘á»“ cÃ¡ nhÃ¢n',
      settingHints: ['khu gá»­i Ä‘á»“ cá»§a sá»± kiá»‡n tráº» em', 'bÃ n phÃ¡t vÃ²ng tay', 'hÃ ng gháº¿ cá»§a phá»¥ huynh'],
      conflictHints: ['háº¡t vÃ²ng Ä‘áº·t sai chá»— bá»‹ dÃ¹ng Ä‘á»ƒ Ä‘á»• lá»—i cho ná»¯ chÃ­nh'],
      forbiddenMeanings: ['tÃ­n váº­t gia tá»™c', 'trang sá»©c hÃ o mÃ´n'],
      confidence: 0.9,
      reason: 'matched bracelet/bead event semantics',
    })
  }

  if (hasPhrase(text, ['goc anh', 'anh cu', 'ruy bang', 'bo hoa co goc anh'])) {
    return makeSemantic({
      semanticType: 'photo_ribbon',
      title: 'GÃ³c áº¢nh TrÃªn Dáº£i Ruy-BÄƒng',
      titleVariants: ['Máº£nh áº¢nh Bá»‹ Ghim TrÃªn BÃ³ Hoa', 'BÃ³ Hoa CÃ³ GÃ³c áº¢nh CÅ©'],
      worldLabel: 'bÃ³ hoa / áº£nh cÅ© / kÃ½ á»©c bá»‹ cáº¯t',
      settingHints: ['tiá»‡m hoa', 'sáº£nh sá»± kiá»‡n', 'bÃ n nháº­n hoa'],
      conflictHints: ['gÃ³c áº£nh bá»‹ cáº¯t thiáº¿u hÃ© lá»™ ngÆ°á»i tháº­t sá»± cÃ³ máº·t'],
      forbiddenMeanings: ['camera phÃ¡p lÃ½', 'há»“ sÆ¡ bá»‡nh Ã¡n'],
      confidence: 0.88,
      reason: 'matched photo/ribbon semantics',
    })
  }

  if (hasPhrase(text, ['khan tay', 'theu chu', 'net theu'])) {
    return makeSemantic({
      semanticType: 'towel_embroidery',
      title: 'Chiáº¿c KhÄƒn Tay ThÃªu Chá»¯ Nhá»',
      titleVariants: ['NÃ©t ThÃªu TrÃªn KhÄƒn Tay', 'Dáº¥u Chá»‰ TrÃªn KhÄƒn Tay'],
      worldLabel: 'khÄƒn tay / thÃªu chá»¯ / váº­t riÃªng tÆ°',
      settingHints: ['phÃ²ng chá»', 'tiá»‡m may', 'bÃ n Ä‘á»“ cÃ¡ nhÃ¢n'],
      conflictHints: ['nÃ©t thÃªu nhá» lÃ m lá»™ ngÆ°á»i Ä‘Ã£ cáº§m khÄƒn'],
      forbiddenMeanings: ['giáº¥y tá» phÃ¡p lÃ½'],
      confidence: 0.86,
      reason: 'matched towel embroidery semantics',
    })
  }

  if (hasPhrase(text, ['mau ghi chu', 'ghi chu', 'to giay', 'mau giay'])) {
    return makeSemantic({
      semanticType: 'note_piece',
      title: 'Máº©u Ghi ChÃº Bá»‹ Äá»•i Sá»‘',
      titleVariants: ['Tá» Giáº¥y TrÆ°á»›c Thang MÃ¡y', 'Ghi ChÃº Lá»‡ch á»ž Sáº£nh Chung CÆ°'],
      worldLabel: 'ghi chÃº Ä‘á»i thÆ°á»ng / giáº¥y nhá» / hiá»ƒu láº§m cÃ´ng khai',
      settingHints: ['sáº£nh chung cÆ°', 'quáº§y lá»… tÃ¢n', 'bÃ n nháº­n Ä‘á»“'],
      conflictHints: ['máº©u ghi chÃº bá»‹ sá»­a sá»‘ Ä‘á»ƒ gÃ¡n lá»—i cho ná»¯ chÃ­nh'],
      forbiddenMeanings: ['há»“ sÆ¡ máº­t', 'mÃ£ QR'],
      confidence: 0.8,
      reason: 'matched note/paper semantics',
    })
  }

  return makeSemantic({
    semanticType: 'unknown',
    title: 'Chi Tiáº¿t Bá»‹ Äáº·t Sai',
    titleVariants: ['Váº­t Chá»©ng Bá»‹ Äáº·t Sai Chá»—'],
    worldLabel: 'Ä‘á»i sá»‘ng Ä‘Ã´ thá»‹ / váº­t chá»©ng cá»¥ thá»ƒ',
    settingHints: ['má»™t khÃ´ng gian Ä‘á»i sá»‘ng cá»¥ thá»ƒ cÃ³ ngÆ°á»i chá»©ng kiáº¿n'],
    conflictHints: ['má»™t váº­t chá»©ng nhá» bá»‹ Ä‘áº·t sai chá»— Ä‘á»ƒ táº¡o hiá»ƒu láº§m'],
    forbiddenMeanings: ['mÃ£ QR', 'há»“ sÆ¡ máº­t chung chung'],
    confidence: 0.35,
    reason: 'no strong semantic evidence match',
  })
}

