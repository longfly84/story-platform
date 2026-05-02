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
}

export type AIFormState = {
  mode: 'chapter' | 'story-plan'
  provider: 'mock' | 'openai'
  moduleId: 'female-urban-viral'
  category: string
  mainCharacterStyle: string
  chapterLength: 'short' | 'medium' | 'long'
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
  {
    value: 'cong-so-va-mat-nu-cuong-thuong-chien',
    label: 'Công sở vả mặt / nữ cường thương chiến',
  },
  {
    value: 'hon-nhan-phan-boi-huy-hon-chong-cu-hoi-han',
    label: 'Hôn nhân phản bội / hủy hôn / chồng cũ hối hận',
  },
  { value: 'hao-mon-lien-hon', label: 'Hào môn liên hôn' },
  { value: 'tra-thu-do-thi', label: 'Trả thù đô thị' },
]

export const modeOptions: Option[] = [
  { value: 'chapter', label: 'Tạo chương truyện' },
  { value: 'story-plan', label: 'Tạo dàn ý truyện' },
]

export const providerOptions: Option[] = [
  { value: 'mock', label: 'Mock' },
  { value: 'openai', label: 'OpenAI API' },
]

export const moduleOptions: Option[] = [
  { value: 'female-urban-viral', label: 'Nữ tần đô thị viral Trung Quốc' },
]

export const mainCharacterOptions: Option[] = [
  { value: 'patient-counterattack', label: 'Nhẫn nhịn rồi phản công' },
  { value: 'cold-sharp', label: 'Lạnh lùng sắc bén' },
  { value: 'business-queen', label: 'Nữ cường thương chiến' },
  { value: 'hidden-heiress', label: 'Giàu ngầm / thân phận ẩn' },
  { value: 'betrayed-bride', label: 'Cô dâu bị phản bội' },
]

export const chapterLengthOptions: Option[] = [
  { value: 'short', label: 'Ngắn 1.800–2.500 ký tự' },
  { value: 'medium', label: 'Vừa 2.500–3.500 ký tự' },
  { value: 'long', label: 'Dài 3.500–4.500 ký tự' },
]

export const cliffhangerOptions: Option[] = [
  { value: 'new-evidence', label: 'Bằng chứng mới xuất hiện' },
  { value: 'villain-counterattack', label: 'Phản diện phản công' },
  { value: 'hot-search', label: 'Hot search bùng nổ' },
  { value: 'key-character', label: 'Nhân vật quan trọng xuất hiện' },
  { value: 'face-slap-line', label: 'Nữ chính tung câu vả mặt' },
  { value: 'secret-message-camera', label: 'Tin nhắn / camera bí mật' },
  { value: 'legal-reversal', label: 'Hợp đồng / pháp lý đảo chiều' },
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