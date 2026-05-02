// Minimal, safe, mock implementation of a "Nữ tần đô thị viral" module.
// This file provides compact rules, defaults and builder functions used by the admin UI
// to produce mock story plans and mock chapters without calling any external API.

export const FEMALE_URBAN_VIRAL_CORE_RULES = [
  'Ngôi thứ nhất, nữ chính xưng tôi',
  'Bối cảnh Trung Quốc hiện đại (Thượng Hải/Bắc Kinh/Thâm Quyến/Hàng Châu/Quảng Châu)',
  'Tone: nhanh, drama, vả mặt, dopamine, addictive',
  'Tiền tệ: RMB; Mạng xã hội: Weibo/Douyin/hot search',
  'Không lộ prompt/module/rule/version trong bản đọc',
  'Không xả bằng chứng chí mạng quá sớm; không để nhân vật phụ thắng thay nữ chính',
  'Tránh cliffhanger giả',
]

export const FEMALE_URBAN_DEFAULT_SETTINGS = {
  locale: 'zh-CN',
  countryVibe: 'Trung Quốc hiện đại',
  pov: 'first',
  protagonistPronoun: 'tôi',
  tone: 'nhanh, drama, vả mặt, dopamine, addictive',
  cities: ['Thượng Hải', 'Bắc Kinh', 'Thâm Quyến', 'Hàng Châu', 'Quảng Châu'],
  currency: 'RMB',
  socials: ['Weibo', 'Douyin', 'hot search'],
}

// Simplified output schemas (rút gọn)
export const STORY_PLAN_OUTPUT_SCHEMA = {
  title: 'string',
  logline: 'string',
  beats: [{ beat: 'string', notes: 'string' }],
}

export const CHAPTER_OUTPUT_SCHEMA = {
  reader: 'string', // BẢN ĐỌC CHO ĐỘC GIẢ
  technical: 'string', // BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG
  meta: { title: 'string', dnaSummary: 'string' },
}

export const CLEAN_READER_OUTPUT_RULES = [
  'Không chèn meta nội bộ, prompt, module hoặc version vào phần đọc cho độc giả',
  'Giữ ngôn ngữ thuần Việt, tự nhiên; không hiển thị dấu ngoặc nhắc nhở nội bộ',
]

export const EVIDENCE_PACING_RULES = [
  'Giữ lại bằng chứng quan trọng nhưng tiết chế; không reveal quá sớm',
  'Tăng dần mức căng thẳng và bằng chứng dẫn tới climax',
]

export const SELF_CHECK_RULES = [
  'Không để nhân vật phụ giải quyết vấn đề chính của nữ chính',
  'Phản diện không sụp quá sớm',
  'Tránh cliffhanger mà không có payoff',
]

type PlanInput = { prompt?: string; settings?: any; dna?: any; length?: string }
type ChapterInput = { prompt?: string; settings?: any; dna?: any; length?: string }

export function buildFemaleUrbanStoryPlanPrompt(input: PlanInput) {
  const settings = { ...FEMALE_URBAN_DEFAULT_SETTINGS, ...(input.settings || {}) }
  const base = input.prompt ? String(input.prompt).trim() : 'Một ý tưởng dựa trên preset nữ tần đô thị viral.'

  const title = (() => {
    const s = base.split(/[\.\!\?\n]/)[0].slice(0, 60).trim()
    return s || 'Dàn ý: Nữ tần đô thị viral'
  })()

  const logline = `Tập trung vào nữ chính (ngôi thứ nhất). Bối cảnh ${settings.cities[0]} — xung đột nhanh, cao trào có tính viral.`

  const beats = [
    { beat: 'Hook mở đầu', notes: 'Cảnh mở mạnh, humiliation nhẹ để thu hút. Giữ bằng chứng chính kín đáo.' },
    { beat: 'Tăng nhiệt', notes: 'Những vụ lùm xùm trên mạng xã hội, nhân vật phụ gây rắc rối.' },
    { beat: 'Đòn phản', notes: 'Nữ chính học được thông tin quan trọng, bắt đầu chủ động.' },
    { beat: 'Climax', notes: 'Đối đầu trực diện, bằng chứng hé lộ đúng lúc để tối đa hóa dopamine.' },
    { beat: 'Kết thúc/Hook tiếp', notes: 'Kết thúc gây thèm — nhưng không cliffhanger giả, để lại payoff nhỏ.' },
  ]

  return { title, logline, beats }
}

export function buildFemaleUrbanChapterPrompt(input: ChapterInput) {
  const settings = { ...FEMALE_URBAN_DEFAULT_SETTINGS, ...(input.settings || {}) }
  const prompt = input.prompt ? String(input.prompt).trim() : ''
  const dnaSummary = input.dna?.shortSummary || 'Nữ tần đô thị viral — nữ chính mạnh mẽ, trả thù tinh tế.'

  // Build a compact reader-facing text (no internal prompts)
  const reader = (() => {
    const firstLine = prompt ? `${prompt.split('\n')[0].slice(0, 120)}` : ''
    const paragraphs = [] as string[]
    if (firstLine) paragraphs.push(firstLine)
    paragraphs.push(`Tôi không ngờ chuyện lại leo thang nhanh đến vậy. Một chiếc bài đăng trên ${settings.socials[0]} khiến cả thành phố xôn xao.`)
    paragraphs.push('Lúc đó, tôi đã nhận ra mình không thể im lặng nữa — phải phản công, nhưng theo cách của riêng tôi.')
    paragraphs.push('Kịch tính tăng dần: bằng chứng hé lộ vừa đủ để giữ độc giả muốn đọc tiếp; đòn cuối khiến kẻ phản diện chột dạ nhưng chưa sụp hẳn.')
    return paragraphs.join('\n\n')
  })()

  const technical = (() => {
    const parts = [] as string[]
    parts.push('[Technical notes] Mục tiêu: gây dopamine, giữ pace nhanh, sử dụng mạng xã hội như catalyst.')
    parts.push(`- POV: ${settings.pov}. Tone: ${settings.tone}.`) 
    parts.push('- Pacing: mở mạnh, 2-3 beat tăng nhiệt, 1 beat reveal nhỏ, không reveal bằng chứng chí mạng quá sớm.')
    parts.push('- Character arcs: nữ chính chủ động, nhân vật phụ hỗ trợ nhưng không giải quyết conflict chính.')
    parts.push('- Social triggers: tin tức nóng, hot search, comment war — dùng để đẩy momentum.')
    return parts.join('\n')
  })()

  const meta = { title: prompt ? (prompt.split('\n')[0].slice(0, 120) || 'Chương mới') : 'Chương mới', dnaSummary }

  return { reader, technical, meta }
}

const femaleUrbanViralModule = {
  id: 'female-urban-viral',
  label: 'Nữ tần đô thị viral Trung Quốc',
  coreRules: FEMALE_URBAN_VIRAL_CORE_RULES,
  defaultSettings: FEMALE_URBAN_DEFAULT_SETTINGS,
  buildStoryPlan: buildFemaleUrbanStoryPlanPrompt,
  buildChapter: buildFemaleUrbanChapterPrompt,
}

export default femaleUrbanViralModule
