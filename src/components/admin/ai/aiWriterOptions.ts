export type Option = {
  value: string
  label: string
}

export type StoryLite = {
  id: string | number
  title: string
  slug: string
  author?: string | null
  status?: string | null
  description?: string | null
  cover_image?: string | null
}

export type AIFormState = {
  provider: 'mock' | 'openai'
  mode: 'chapter' | 'story-plan'
  modelKey: 'economy' | 'premium' | 'auto'
  moduleId: string
  category: string
  mainCharacterStyle: string
  chapterLength: string
  cliffhangerType: string
  coverStyle: string
  colorTheme: string
  characterVibe: string
  promptIdea: string
  humiliationLevel: number
  revengeIntensity: number
}

export const fallbackCategories: Option[] = [
  { value: 'hon-nhan-phan-boi-ngoai-tinh', label: 'Hôn nhân phản bội / ngoại tình' },
  { value: 'ly-hon-va-mat-chong-cu-hoi-han', label: 'Ly hôn vả mặt / chồng cũ hối hận' },
  { value: 'hao-mon-lien-hon-gia-toc', label: 'Hào môn / liên hôn / gia tộc' },
  { value: 'cong-so-thuong-chien-nu-cuong', label: 'Công sở thương chiến / nữ cường' },
  { value: 'tra-thu-do-thi', label: 'Trả thù đô thị' },
  { value: 'hot-search-showbiz-pr-scandal', label: 'Hot search / showbiz / PR scandal' },
  { value: 'me-con-gia-dinh-bao-ve-con', label: 'Mẹ con / gia đình / bảo vệ con' },
  { value: 'ban-than-phan-boi-tieu-tam', label: 'Bạn thân phản bội / tiểu tam' },
  { value: 'cuoi-truoc-yeu-sau-hop-dong-hon-nhan', label: 'Cưới trước yêu sau / hợp đồng hôn nhân' },
  { value: 'nu-chinh-tai-sinh-lam-lai-cuoc-doi', label: 'Nữ chính tái sinh / làm lại cuộc đời' },
  { value: 'bi-an-gia-dinh-than-the', label: 'Bí ẩn gia đình / thân thế' },
  { value: 'tong-tai-nguoc-luyen-hoi-han', label: 'Tổng tài ngược luyến / hối hận' },
  { value: 'gia-dau-me-chong-nha-chong', label: 'Gia đấu / mẹ chồng / nhà chồng' },
  { value: 'nu-cuong-phap-ly-luat-su', label: 'Nữ cường pháp lý / luật sư' },
  { value: 'doi-tra-danh-phan-hao-mon', label: 'Đổi tráo danh phận / hào môn' },
]

export const modeOptions: Option[] = [
  { value: 'chapter', label: 'Tạo chương truyện' },
  { value: 'story-plan', label: 'Tạo dàn ý truyện' },
]

export const providerOptions: Option[] = [
  { value: 'mock', label: 'Mock' },
  { value: 'openai', label: 'OpenAI API' },
]

export const modelTierOptions: Option[] = [
  {
    value: 'draft',
    label: 'Tiết kiệm — Draft hàng loạt',
  },
  {
    value: 'premium',
    label: 'Cao cấp — Chương quan trọng',
  },
  {
    value: 'auto',
    label: 'Tự động — AI chọn theo độ quan trọng',
  },
]

export const modelKeyOptions: Option[] = [
  {
    value: 'economy',
    label: 'Tiết kiệm — gpt-4.1-mini',
  },
  {
    value: 'premium',
    label: 'Cao cấp — model tốt hơn khi cần',
  },
  {
    value: 'auto',
    label: 'Tự động — AI chọn theo độ quan trọng',
  },
]

export const moduleOptions: Option[] = [
  { value: 'female-urban-viral', label: 'Nữ tần đô thị viral Trung Quốc' },
]

export const mainCharacterOptions: Option[] = [
  {
    value: 'endure-then-counter',
    label: 'Nhẫn nhịn rồi phản công',
  },
  {
    value: 'cold-revenge',
    label: 'Lạnh lùng trả thù',
  },
  {
    value: 'soft-outside-hard-inside',
    label: 'Ngoài mềm trong cứng',
  },
  {
    value: 'legal-minded',
    label: 'Lý trí, giỏi pháp lý',
  },
  {
    value: 'business-queen',
    label: 'Nữ cường thương chiến',
  },
  {
    value: 'reborn-calculator',
    label: 'Tái sinh, đi trước một bước',
  },
  {
    value: 'protective-mother',
    label: 'Người mẹ bảo vệ con',
  },
  {
    value: 'wealthy-family-daughter',
    label: 'Thiên kim hào môn bị xem thường',
  },
  {
    value: 'silent-evidence-collector',
    label: 'Im lặng gom bằng chứng',
  },
  {
    value: 'public-face-slapper',
    label: 'Vả mặt công khai cực gắt',
  },
  {
    value: 'broken-heart-to-power',
    label: 'Từ đau khổ thành kiểm soát thế cục',
  },
]

export const chapterLengthOptions: Option[] = [
  { value: 'short', label: 'Ngắn 1.800–2.500 ký tự' },
  { value: 'medium', label: 'Vừa 2.500–3.500 ký tự' },
  { value: 'long', label: 'Dài 3.500–4.500 ký tự' },
]

export const cliffhangerOptions: Option[] = [
  {
    value: 'auto',
    label: 'Mặc định — AI tự chọn theo mạch truyện',
  },
  {
    value: 'villain-counterattack',
    label: 'Phản diện phản công cuối chương',
  },
  {
    value: 'new-evidence',
    label: 'Bằng chứng mới xuất hiện',
  },
  {
    value: 'secret-message-camera',
    label: 'Tin nhắn / camera / file bí mật',
  },
  {
    value: 'hot-search-reversal',
    label: 'Hot search đảo chiều',
  },
  {
    value: 'face-slap-line',
    label: 'Nữ chính tung câu vả mặt',
  },
  {
    value: 'legal-reversal',
    label: 'Luật sư / hợp đồng / pháp lý đảo chiều',
  },
  {
    value: 'family-pressure',
    label: 'Gia tộc ép đến đường cùng',
  },
  {
    value: 'identity-crack',
    label: 'Thân phận thật giả lộ sơ hở',
  },
  {
    value: 'romance-crack',
    label: 'Nam chính bắt đầu dao động / nghi ngờ',
  },
  {
    value: 'child-danger',
    label: 'Con nhỏ / người thân gặp nguy',
  },
  {
    value: 'public-banquet-face-slap',
    label: 'Vả mặt công khai ở tiệc / họp / truyền thông',
  },
  {
    value: 'final-payoff',
    label: 'Cao trào / kết liễu phản diện',
  },
]

export const coverStyleOptions: Option[] = [
  { value: 'minimal-portrait', label: 'Minimal Portrait' },
  { value: 'anime-drama', label: 'Anime Drama' },
  { value: 'luxury-wedding', label: 'Luxury Wedding' },
  { value: 'corporate-queen', label: 'Corporate Queen' },
  { value: 'revenge-poster', label: 'Revenge Poster' },
]

export const colorThemeOptions: Option[] = [
  { value: 'warm-gold', label: 'Warm Gold' },
  { value: 'dark-luxury', label: 'Dark Luxury' },
  { value: 'cold-blue', label: 'Cold Blue' },
  { value: 'red-drama', label: 'Red Drama' },
  { value: 'black-amber', label: 'Black Amber' },
]

export const characterVibeOptions: Option[] = [
  { value: 'stoic', label: 'Stoic' },
  { value: 'cold-queen', label: 'Cold Queen' },
  { value: 'broken-bride', label: 'Broken Bride' },
  { value: 'elegant-revenge', label: 'Elegant Revenge' },
  { value: 'soft-dangerous', label: 'Soft but Dangerous' },
]

export function findLabel(options: Option[], value: string) {
  return options.find((item) => item.value === value)?.label || value
}

export function makeSlug(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}