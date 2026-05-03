import {
  findLabel,
  type AIFormState,
  type Option,
  type StoryLite,
} from '@/components/admin/ai/aiWriterOptions'

type BuildCoverPromptArgs = {
  selectedStory: StoryLite | null
  preview: string
  aiForm: AIFormState
  categoryOptions: Option[]
}

type StoryVisualType =
  | 'marriage-betrayal'
  | 'corporate-war'
  | 'wealthy-family'
  | 'divorce-face-slap'
  | 'mother-child-family'
  | 'general-drama'

type HeroArchetype =
  | 'betrayed-bride'
  | 'corporate-queen'
  | 'reborn-ex-wife'
  | 'protective-mother'
  | 'wealthy-family-daughter'
  | 'cold-revenge-heroine'
  | 'general-heroine'

function cleanText(value?: string | null) {
  if (!value) return ''
  return value.replace(/\s+/g, ' ').trim()
}

function hasAny(text: string, keywords: string[]) {
  const source = text.toLowerCase()
  return keywords.some((keyword) => source.includes(keyword.toLowerCase()))
}

function extractReaderPart(preview: string) {
  if (!preview?.trim()) return ''

  const readerPart = preview.split('---')[0] || preview

  return readerPart
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.includes('BẢN ĐỌC CHO ĐỘC GIẢ'))
    .filter((line) => !line.includes('BẢN PHÂN TÍCH KỸ THUẬT'))
    .join('\n')
    .trim()
}

function extractUsefulLines(text: string, limit = 6) {
  if (!text?.trim()) return []

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith('#'))
    .filter((line) => !line.includes('BẢN ĐỌC CHO ĐỘC GIẢ'))
    .filter((line) => !line.includes('BẢN PHÂN TÍCH KỸ THUẬT'))
    .slice(0, limit)
}

function pickStorySummary({
  selectedStory,
  preview,
  aiForm,
}: {
  selectedStory: StoryLite | null
  preview: string
  aiForm: AIFormState
}) {
  const description = cleanText((selectedStory as any)?.description)

  if (description && description.length > 40) {
    return description
  }

  const readerPart = extractReaderPart(preview)
  const lines = extractUsefulLines(readerPart, 5)
  const joined = cleanText(lines.join(' '))

  if (joined && joined.length > 40) {
    return joined.length > 520 ? `${joined.slice(0, 517)}...` : joined
  }

  const idea = cleanText(aiForm.promptIdea)

  if (idea) return idea

  return 'Một câu chuyện drama giàu cảm xúc với phản bội, đối đầu và màn phản công của nữ chính.'
}

function inferStoryType(text: string): StoryVisualType {
  const source = text.toLowerCase()

  const scores: Record<StoryVisualType, number> = {
    'marriage-betrayal': 0,
    'corporate-war': 0,
    'wealthy-family': 0,
    'divorce-face-slap': 0,
    'mother-child-family': 0,
    'general-drama': 1,
  }

  const addScore = (type: StoryVisualType, keywords: string[], score = 1) => {
    keywords.forEach((keyword) => {
      if (source.includes(keyword.toLowerCase())) {
        scores[type] += score
      }
    })
  }

  addScore(
    'marriage-betrayal',
    [
      'phản bội',
      'ngoại tình',
      'tiểu tam',
      'cô dâu',
      'hôn lễ',
      'đính hôn',
      'váy cưới',
      'chồng',
      'vợ chồng',
      'hôn nhân',
      'ngủ với chồng',
      'người thứ ba',
      'hủy hôn',
    ],
    2
  )

  addScore(
    'corporate-war',
    [
      'công sở',
      'thương chiến',
      'tập đoàn',
      'hội đồng quản trị',
      'hợp đồng',
      'cổ phần',
      'pháp vụ',
      'tổng giám đốc',
      'giám đốc',
      'dự án',
      'công ty',
      'boardroom',
      'doanh nghiệp',
      'đầu tư',
      'thư ký',
      'hội sở',
      'pr',
    ],
    2
  )

  addScore(
    'wealthy-family',
    [
      'hào môn',
      'gia tộc',
      'nhà họ',
      'phu nhân',
      'lão phu nhân',
      'danh môn',
      'thượng lưu',
      'tài phiệt',
      'nhà giàu',
      'giới thượng lưu',
      'hào môn thế gia',
      'liên hôn',
    ],
    2
  )

  addScore(
    'divorce-face-slap',
    [
      'ly hôn',
      'đơn ly hôn',
      'ký đơn',
      'chồng cũ',
      'vả mặt',
      'hối hận',
      'hậu ly hôn',
      'ly dị',
      'ra đi',
      'quỳ xin lỗi',
      'vợ cũ',
    ],
    2
  )

  addScore(
    'mother-child-family',
    [
      'mẹ con',
      'con tôi',
      'nuôi con',
      'mang thai',
      'thai',
      'em bé',
      'đứa bé',
      'gia đình',
      'con trai',
      'con gái',
      'bố mẹ',
      'con nhỏ',
      'đứa trẻ',
      'mẹ đơn thân',
    ],
    2
  )

  if (
    hasAny(source, ['ly hôn', 'đơn ly hôn', 'chồng cũ', 'vợ cũ']) &&
    hasAny(source, ['vả mặt', 'hối hận', 'quỳ xin lỗi', 'comeback'])
  ) {
    scores['divorce-face-slap'] += 4
  }

  if (
    hasAny(source, ['hôn lễ', 'đính hôn', 'cô dâu', 'váy cưới']) &&
    hasAny(source, ['phản bội', 'ngoại tình', 'người thứ ba', 'tiểu tam'])
  ) {
    scores['marriage-betrayal'] += 4
  }

  if (
    hasAny(source, ['tập đoàn', 'hội đồng quản trị', 'cổ phần', 'hợp đồng']) &&
    hasAny(source, ['trả thù', 'vả mặt', 'phản công', 'thương chiến'])
  ) {
    scores['corporate-war'] += 4
  }

  if (
    hasAny(source, ['hào môn', 'gia tộc', 'nhà họ', 'phu nhân', 'liên hôn']) &&
    hasAny(source, ['áp lực', 'ép cưới', 'thể diện', 'danh dự', 'hôn ước'])
  ) {
    scores['wealthy-family'] += 4
  }

  if (
    hasAny(source, ['mẹ con', 'nuôi con', 'mang thai', 'đứa bé', 'con nhỏ', 'mẹ đơn thân']) &&
    hasAny(source, ['gia đình', 'bảo vệ', 'tranh giành', 'ly hôn', 'phản bội'])
  ) {
    scores['mother-child-family'] += 4
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])

  return (sorted[0]?.[0] as StoryVisualType) || 'general-drama'
}

function inferHeroArchetype(text: string, storyType: StoryVisualType): HeroArchetype {
  const source = text.toLowerCase()

  if (
    hasAny(source, ['cô dâu', 'váy cưới', 'hôn lễ', 'đính hôn', 'hủy hôn']) &&
    hasAny(source, ['phản bội', 'ngoại tình', 'tiểu tam', 'người thứ ba'])
  ) {
    return 'betrayed-bride'
  }

  if (
    storyType === 'corporate-war' ||
    hasAny(source, ['nữ cường', 'thương chiến', 'tập đoàn', 'cổ phần', 'hội đồng quản trị'])
  ) {
    return 'corporate-queen'
  }

  if (
    storyType === 'divorce-face-slap' ||
    hasAny(source, ['ly hôn', 'chồng cũ', 'vợ cũ', 'đơn ly hôn', 'hậu ly hôn'])
  ) {
    return 'reborn-ex-wife'
  }

  if (
    storyType === 'mother-child-family' ||
    hasAny(source, ['mẹ con', 'mẹ đơn thân', 'con tôi', 'nuôi con', 'đứa bé', 'con nhỏ'])
  ) {
    return 'protective-mother'
  }

  if (
    storyType === 'wealthy-family' ||
    hasAny(source, ['thiên kim', 'hào môn', 'liên hôn', 'gia tộc', 'phu nhân'])
  ) {
    return 'wealthy-family-daughter'
  }

  if (hasAny(source, ['trả thù', 'phản công', 'vả mặt', 'bằng chứng', 'hot search'])) {
    return 'cold-revenge-heroine'
  }

  return 'general-heroine'
}

function getStoryTypeLabel(type: StoryVisualType) {
  switch (type) {
    case 'marriage-betrayal':
      return 'Phản bội hôn nhân'
    case 'corporate-war':
      return 'Công sở thương chiến'
    case 'wealthy-family':
      return 'Hào môn'
    case 'divorce-face-slap':
      return 'Ly hôn vả mặt'
    case 'mother-child-family':
      return 'Mẹ con / gia đình'
    default:
      return 'Drama hiện đại'
  }
}

function getHeroArchetypeLabel(type: HeroArchetype) {
  switch (type) {
    case 'betrayed-bride':
      return 'Cô dâu bị phản bội'
    case 'corporate-queen':
      return 'Nữ cường thương chiến'
    case 'reborn-ex-wife':
      return 'Vợ cũ phản công'
    case 'protective-mother':
      return 'Người mẹ bảo vệ con'
    case 'wealthy-family-daughter':
      return 'Thiên kim / hào môn bị ép'
    case 'cold-revenge-heroine':
      return 'Nữ chính trả thù lạnh và sắc'
    default:
      return 'Nữ chính drama hiện đại'
  }
}

function getStoryTypeSetting(type: StoryVisualType) {
  switch (type) {
    case 'marriage-betrayal':
      return 'luxury engagement or wedding setting, glamorous hotel ballroom, elegant banquet atmosphere, public humiliation tension'
    case 'corporate-war':
      return 'modern Chinese urban business setting, luxury office tower, boardroom glass, skyline, elite corporate environment'
    case 'wealthy-family':
      return 'wealthy family environment, grand mansion or luxury banquet hall, elite household pressure, aristocratic social atmosphere'
    case 'divorce-face-slap':
      return 'modern upscale urban environment, legal and emotional separation atmosphere, luxury residence or refined office, cold aftermath of betrayal'
    case 'mother-child-family':
      return 'modern emotional family setting, upscale apartment or refined domestic environment, soft but tense atmosphere, protective family mood'
    default:
      return 'modern Chinese urban drama environment with elegant tension'
  }
}

function getHeroOutfit(type: HeroArchetype) {
  switch (type) {
    case 'betrayed-bride':
      return 'elegant white or champagne formal dress with subtle bridal elements, slightly disordered detail such as loose ribbon, veil edge, or one fallen earring, but still graceful and expensive'
    case 'corporate-queen':
      return 'luxury tailored suit or elegant business dress, sharp silhouette, refined jewelry, high-status corporate styling'
    case 'reborn-ex-wife':
      return 'elegant dark dress or refined coat, mature and independent styling, no longer submissive, subtle luxury accessories'
    case 'protective-mother':
      return 'soft elegant dress or refined casual luxury outfit, warm but strong styling, protective and emotionally grounded'
    case 'wealthy-family-daughter':
      return 'high-society formal dress, pearl or gold detail, elegant old-money styling, restrained luxury'
    case 'cold-revenge-heroine':
      return 'dark elegant dress or dramatic premium outfit, controlled and sharp, refined but dangerous'
    default:
      return 'beautiful premium modern outfit, elegant and story-appropriate'
  }
}

function getHeroExpression(type: HeroArchetype) {
  switch (type) {
    case 'betrayed-bride':
      return 'eyes hurt but not broken, lips restrained, the expression of someone betrayed in public but refusing to collapse'
    case 'corporate-queen':
      return 'calm sharp eyes, controlled expression, intelligent and unreadable, like she is already three steps ahead'
    case 'reborn-ex-wife':
      return 'quietly detached expression, pain already turned cold, a sense of rebirth and no-return decision'
    case 'protective-mother':
      return 'gentle but firm eyes, warmth mixed with vigilance, protective strength without weakness'
    case 'wealthy-family-daughter':
      return 'dignified and pressured expression, proud restraint, elegant pain under social pressure'
    case 'cold-revenge-heroine':
      return 'cold composed eyes, restrained emotion, elegant danger, silent revenge energy'
    default:
      return 'emotionally layered expression, beautiful but tense, memorable and dramatic'
  }
}

function getHeroPose(type: HeroArchetype) {
  switch (type) {
    case 'betrayed-bride':
      return 'standing alone in the foreground, shoulders straight, one hand holding a phone or a torn invitation, refusing to look defeated'
    case 'corporate-queen':
      return 'standing or sitting confidently in the foreground, one hand near a contract or phone, posture controlled and commanding'
    case 'reborn-ex-wife':
      return 'turning away from the past, holding divorce papers or a phone, posture calm and final'
    case 'protective-mother':
      return 'standing protectively, body slightly angled as if shielding someone important, strong but tender'
    case 'wealthy-family-daughter':
      return 'standing still under pressure, graceful posture, chin slightly lifted, surrounded by cold luxury'
    case 'cold-revenge-heroine':
      return 'standing in controlled silence, direct gaze, one subtle object of evidence in hand or near her'
    default:
      return 'heroine centered in the foreground with a strong emotional presence'
  }
}

function getObjectMotifs(type: HeroArchetype, storyText: string) {
  const source = storyText.toLowerCase()
  const motifs: string[] = []

  if (hasAny(source, ['weibo', 'hot search', 'hashtag', 'bài đăng'])) {
    motifs.push('phone screen glow suggesting a viral Weibo scandal')
  }

  if (hasAny(source, ['hợp đồng', 'cổ phần', 'phụ lục', 'pháp vụ', 'đơn ly hôn'])) {
    motifs.push('contract pages, legal papers, or a stamped document as subtle evidence')
  }

  if (hasAny(source, ['camera', 'video', 'ghi âm', 'email', 'bằng chứng'])) {
    motifs.push('hidden evidence motif, such as a file folder, recording device, camera reflection, or locked email')
  }

  if (type === 'betrayed-bride') {
    motifs.push('wedding invitation, engagement ring, bouquet, veil edge, or banquet chandelier')
  }

  if (type === 'corporate-queen') {
    motifs.push('boardroom table, city skyline, glass wall reflections, stock/corporate atmosphere')
  }

  if (type === 'reborn-ex-wife') {
    motifs.push('divorce papers, suitcase, torn couple photo, or a door opening to a new life')
  }

  if (type === 'protective-mother') {
    motifs.push('small child silhouette, family photo, child toy, or warm domestic light only if relevant')
  }

  if (type === 'wealthy-family-daughter') {
    motifs.push('mansion staircase, banquet lights, pearl jewelry, old-money interior, matriarch silhouette')
  }

  return Array.from(new Set(motifs)).slice(0, 6)
}

function getSecondaryCharacterDirection(type: HeroArchetype, storyType: StoryVisualType) {
  if (type === 'betrayed-bride') {
    return 'Secondary characters may appear blurred in the background: the male betrayer and another woman standing close together, but they must not steal focus from the heroine.'
  }

  if (type === 'corporate-queen') {
    return 'Secondary characters may appear as blurred board members, a male antagonist, or a rival woman in the background, framed by glass and city lights.'
  }

  if (type === 'reborn-ex-wife') {
    return 'The ex-husband may appear as a distant or blurred figure behind her, regretful or controlling, while the heroine visually moves beyond him.'
  }

  if (type === 'protective-mother') {
    return 'A child may appear only if the story clearly supports it, placed close to the heroine as an emotional anchor, not as a random cute prop.'
  }

  if (type === 'wealthy-family-daughter' || storyType === 'wealthy-family') {
    return 'Secondary characters may appear as cold elite family silhouettes, a matriarch, or distant guests, emphasizing social pressure.'
  }

  return 'Secondary figures can be used sparingly in the background to suggest betrayal or conflict, but the heroine must remain the visual center.'
}

function getStoryTypeComposition(type: StoryVisualType, heroType: HeroArchetype) {
  const pose = getHeroPose(heroType)
  const secondary = getSecondaryCharacterDirection(heroType, type)

  switch (type) {
    case 'marriage-betrayal':
      return `${pose}. Use a luxury wedding or engagement setting if relevant. ${secondary} The composition should show public humiliation and the heroine's refusal to break.`
    case 'corporate-war':
      return `${pose}. Use boardroom, office tower, city skyline, contracts, and cold glass reflections. ${secondary} The composition should feel strategic and high-status.`
    case 'wealthy-family':
      return `${pose}. Use mansion, banquet hall, or old-money luxury atmosphere. ${secondary} The composition should show elite family pressure and cold dignity.`
    case 'divorce-face-slap':
      return `${pose}. Use legal papers, urban luxury setting, or emotional separation motifs. ${secondary} The composition should show that the heroine has crossed a point of no return.`
    case 'mother-child-family':
      return `${pose}. Use warm but tense family atmosphere. ${secondary} The composition should feel protective, emotional, and story-driven, not randomly cute.`
    default:
      return `${pose}. Use the background to hint at betrayal, status conflict, and hidden danger without overcrowding the scene. ${secondary}`
  }
}

function getStoryTypeMood(type: StoryVisualType, heroType: HeroArchetype) {
  if (heroType === 'betrayed-bride') {
    return 'public betrayal, heartbreak, humiliation, restrained pride, and the first spark of revenge'
  }

  if (heroType === 'corporate-queen') {
    return 'cold ambition, intelligent retaliation, corporate pressure, elegant hostility, and controlled power'
  }

  if (heroType === 'reborn-ex-wife') {
    return 'detachment after betrayal, rebirth, comeback energy, quiet revenge, and emotional finality'
  }

  if (heroType === 'protective-mother') {
    return 'protective love, hidden pain, family pressure, tenderness mixed with steel, and emotional resilience'
  }

  if (heroType === 'wealthy-family-daughter') {
    return 'luxury oppression, family control, social pressure, proud restraint, and quiet resistance'
  }

  switch (type) {
    case 'marriage-betrayal':
      return 'betrayal, heartbreak, public humiliation, emotional tension, wounded pride turning into revenge'
    case 'corporate-war':
      return 'cold ambition, elegant hostility, pressure, power struggle, controlled retaliation'
    case 'wealthy-family':
      return 'luxury oppression, family pressure, high-society tension, emotional restraint, sharp pride'
    case 'divorce-face-slap':
      return 'detachment after betrayal, rising confidence, humiliation turning into comeback, revenge with elegance'
    case 'mother-child-family':
      return 'protective love, emotional pressure, hidden pain, maternal strength, family-centered drama'
    default:
      return 'emotional drama, betrayal, conflict, tension, and female-centered revenge energy'
  }
}

function getStoryTypeVisualRules(type: StoryVisualType, heroType: HeroArchetype) {
  const rules: string[] = []

  switch (type) {
    case 'marriage-betrayal':
      rules.push(
        'Wedding or engagement elements are welcome only if they clearly support the story.',
        'The cheating couple or betrayal hint should stay in the background, not dominate the cover.',
        'The heroine must look wounded but proud, not helpless.'
      )
      break
    case 'corporate-war':
      rules.push(
        'Prioritize a strong businesswoman or female lead image.',
        'Use office, contract, skyline, or boardroom cues instead of random romantic background.',
        'Keep the image sharp, premium, strategic, and status-heavy.'
      )
      break
    case 'wealthy-family':
      rules.push(
        'Show elite family power and cold luxury.',
        'Use manor, banquet, matriarch pressure, or old-money cues when relevant.',
        'Keep the heroine graceful and dignified rather than generic.'
      )
      break
    case 'divorce-face-slap':
      rules.push(
        'Avoid overly bridal composition unless the story explicitly says so.',
        'The heroine should feel like she has walked through betrayal and is about to turn the table.',
        'Background may hint at ex-husband regret, legal split, or social comeback.'
      )
      break
    case 'mother-child-family':
      rules.push(
        'Only include a child if the story clearly revolves around mother-child or family stakes.',
        'The child must support the emotional narrative, not become a random cute prop.',
        'Keep the heroine as the main focus, with protective strength and emotional depth.'
      )
      break
    default:
      rules.push(
        'Keep the cover story-specific, elegant, dramatic, and premium.',
        'Avoid random background clutter.',
        'The heroine must remain dominant and memorable.'
      )
  }

  if (heroType === 'betrayed-bride') {
    rules.push('Use bridal or formalwear details subtly; do not make the image look like a happy wedding cover.')
  }

  if (heroType === 'corporate-queen') {
    rules.push('The heroine should look capable and strategic, not simply glamorous.')
  }

  if (heroType === 'protective-mother') {
    rules.push('If a child is included, keep it emotionally meaningful and secondary.')
  }

  return rules
}

function inferExtraVisualHints(text: string) {
  const source = text.toLowerCase()
  const hints: string[] = []

  if (source.includes('weibo') || source.includes('hot search')) {
    hints.push('subtle social media scandal atmosphere, phone screen glow, trending-topic tension')
  }

  if (
    source.includes('hợp đồng') ||
    source.includes('cổ phần') ||
    source.includes('pháp vụ') ||
    source.includes('đơn ly hôn')
  ) {
    hints.push('documents, contract undertone, legal or financial stakes suggested subtly in the scene')
  }

  if (
    source.includes('camera') ||
    source.includes('video') ||
    source.includes('ghi âm') ||
    source.includes('bằng chứng') ||
    source.includes('email')
  ) {
    hints.push('hidden evidence undertone, secret truth about to be exposed, suspense detail')
  }

  if (
    source.includes('khách sạn') ||
    source.includes('sảnh tiệc') ||
    source.includes('banquet') ||
    source.includes('yến tiệc')
  ) {
    hints.push('luxury chandeliers, premium event lighting, glamorous elite atmosphere')
  }

  if (
    source.includes('mẹ con') ||
    source.includes('con tôi') ||
    source.includes('nuôi con') ||
    source.includes('con nhỏ')
  ) {
    hints.push('protective maternal undertone, emotional family stake, child-related emotional anchor')
  }

  return hints
}

function buildColorDirection(colorThemeLabel: string, storyType: StoryVisualType) {
  const raw = colorThemeLabel.toLowerCase()

  if (raw.includes('dark') || raw.includes('luxury') || raw.includes('đen')) {
    return 'dark luxury palette with black, charcoal, subtle gold, deep shadows, and premium highlights'
  }

  if (raw.includes('warm') || raw.includes('gold') || raw.includes('amber')) {
    return 'warm premium palette with champagne gold, amber light, soft shadow, and rich cinematic glow'
  }

  if (raw.includes('red') || raw.includes('rose')) {
    return 'dramatic palette with crimson, wine red, rose highlights, and dark elegant contrast'
  }

  if (storyType === 'mother-child-family') {
    return 'soft emotional palette with warm beige, muted gold, gentle brown or dusty rose, while still keeping a premium dramatic finish'
  }

  if (storyType === 'corporate-war') {
    return 'luxury corporate palette with charcoal, steel grey, black, subtle gold, and cool city-light accents'
  }

  return 'premium dramatic palette with elegant contrast, controlled highlights, and cinematic atmosphere'
}

export function buildFullCoverPrompt({
  selectedStory,
  preview,
  aiForm,
  categoryOptions,
}: BuildCoverPromptArgs) {
  const storyTitle = cleanText(selectedStory?.title) || 'Truyện mới'
  const categoryLabel = findLabel(categoryOptions, aiForm.category) || 'Drama hiện đại'
  const coverStyleLabel = cleanText(aiForm.coverStyle) || 'anime drama'
  const colorThemeLabel = cleanText(aiForm.colorTheme) || 'dark luxury'
  const vibeLabel = cleanText(aiForm.characterVibe) || 'emotional female lead'
  const mainStyleLabel = cleanText(aiForm.mainCharacterStyle) || ''
  const summary = pickStorySummary({ selectedStory, preview, aiForm })

  const readerPart = extractReaderPart(preview)
  const previewLines = extractUsefulLines(readerPart, 6)
  const previewExcerpt = cleanText(previewLines.join(' '))

  const fullStorySignal = [
    storyTitle,
    categoryLabel,
    summary,
    previewExcerpt,
    mainStyleLabel,
    vibeLabel,
  ].join('\n')

  const storyType = inferStoryType(fullStorySignal)
  const heroType = inferHeroArchetype(fullStorySignal, storyType)

  const storyTypeLabel = getStoryTypeLabel(storyType)
  const heroTypeLabel = getHeroArchetypeLabel(heroType)
  const setting = getStoryTypeSetting(storyType)
  const composition = getStoryTypeComposition(storyType, heroType)
  const mood = getStoryTypeMood(storyType, heroType)
  const visualRules = getStoryTypeVisualRules(storyType, heroType)
  const outfit = getHeroOutfit(heroType)
  const expression = getHeroExpression(heroType)
  const pose = getHeroPose(heroType)
  const objectMotifs = getObjectMotifs(heroType, fullStorySignal)
  const secondaryDirection = getSecondaryCharacterDirection(heroType, storyType)
  const extraHints = inferExtraVisualHints(`${summary}\n${previewExcerpt}`)
  const colorDirection = buildColorDirection(colorThemeLabel, storyType)

  const visualRulesBlock = visualRules.map((item) => `- ${item}`).join('\n')
  const objectMotifsBlock = objectMotifs.length
    ? objectMotifs.map((item) => `- ${item}`).join('\n')
    : '- story-relevant symbolic object, but only if it supports the narrative'

  const extraHintsBlock = extraHints.length
    ? extraHints.map((item) => `- ${item}`).join('\n')
    : '- keep visual details story-specific and relevant to the narrative'

  return `
Create a premium vertical web-novel cover illustration that accurately reflects the actual story content.

Format:
2:3 vertical book cover, polished digital illustration, highly detailed, cinematic, premium, commercial-quality cover art.

IMPORTANT PRIORITY RULE:
Use the actual story content first.
Priority order:
1. Story title
2. Story summary
3. Story excerpt / preview
4. Detected story type
5. Detected heroine archetype
6. Visual tags such as cover style, color theme, character vibe

If there is any conflict, follow the actual story content, not the generic tag.

Story title:
"${storyTitle}"

Story genre:
${categoryLabel}

Detected story type:
${storyTypeLabel}

Detected heroine archetype:
${heroTypeLabel}

Story summary:
${summary}

Story excerpt / atmosphere reference:
${previewExcerpt || 'No extra excerpt available.'}

Visual style:
high-detail anime web-novel cover illustration, polished, dramatic, emotional, premium, highly clickable web-novel cover quality

Selected visual tags:
- Cover style: ${coverStyleLabel}
- Color theme: ${colorThemeLabel}
- Character vibe: ${vibeLabel}

Main subject:
A beautiful female protagonist must be the absolute main focus of the cover.
She should visually match the detected heroine archetype: ${heroTypeLabel}.

Heroine outfit:
${outfit}

Heroine expression:
${expression}

Heroine pose:
${pose}

Setting:
${setting}

Color direction:
${colorDirection}

Composition:
${composition}

Secondary characters:
${secondaryDirection}

Object motifs:
${objectMotifsBlock}

Mood:
${mood}

Story-type specific visual rules:
${visualRulesBlock}

Extra story-specific hints:
${extraHintsBlock}

Accuracy rules:
- The cover must visually belong to this exact story.
- Do not create a random generic anime girl cover.
- Do not mix in visual elements from unrelated genres.
- If the story is mainly corporate-war, do not force a wedding composition unless the story summary clearly includes one.
- If the story is mainly mother-child/family, only include a child when it is truly central to the story.
- If the story is mainly divorce face-slap, lean into emotional separation, comeback energy, and reversal rather than generic romance.
- If the story is mainly wealthy-family conflict, show elite status pressure and cold luxury.
- If the story is mainly marriage betrayal, show betrayal atmosphere clearly but keep the heroine dominant.
- The heroine’s clothing, expression, pose, and background must all support the same story concept.

Quality rules:
- No text, no logo, no watermark.
- No random letters or fake typography.
- No distorted anatomy.
- No extra fingers.
- No blurry low-detail rendering.
- Highly detailed face, elegant pose, strong lighting, premium finish.
- The heroine must be dominant, memorable, and emotionally expressive.
- Keep the cover clean and readable at mobile thumbnail size.

Final goal:
Make it look like a premium anime-style web novel cover that clearly matches this exact story type, exact heroine archetype, and exact story content.
`.trim()
}