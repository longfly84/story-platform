import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Option = {
  value: string
  label: string
}

type StoryLite = {
  id: string | number
  title: string
  slug: string
  author?: string | null
  status?: string | null
  description?: string | null
}

type AIFormState = {
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

const fallbackCategories: Option[] = [
  { value: 'hon-nhan-phan-boi-ngoai-tinh', label: 'HÃ´n nhÃ¢n pháº£n bá»™i / ngoáº¡i tÃ¬nh' },
  { value: 'cong-so-va-mat-nu-cuong-thuong-chien', label: 'CÃ´ng sá»Ÿ váº£ máº·t / ná»¯ cÆ°á»ng thÆ°Æ¡ng chiáº¿n' },
  { value: 'hon-nhan-phan-boi-huy-hon-chong-cu-hoi-han', label: 'HÃ´n nhÃ¢n pháº£n bá»™i / há»§y hÃ´n / chá»“ng cÅ© há»‘i háº­n' },
  { value: 'hao-mon-lien-hon', label: 'HÃ o mÃ´n liÃªn hÃ´n' },
  { value: 'tra-thu-do-thi', label: 'Tráº£ thÃ¹ Ä‘Ã´ thá»‹' },
]

const modeOptions: Option[] = [
  { value: 'chapter', label: 'Táº¡o chÆ°Æ¡ng truyá»‡n' },
  { value: 'story-plan', label: 'Táº¡o dÃ n Ã½ truyá»‡n' },
]

const providerOptions: Option[] = [
  { value: 'mock', label: 'Mock' },
  { value: 'openai', label: 'OpenAI API' },
]

const moduleOptions: Option[] = [
  { value: 'female-urban-viral', label: 'Ná»¯ táº§n Ä‘Ã´ thá»‹ viral Trung Quá»‘c' },
]

const mainCharacterOptions: Option[] = [
  { value: 'patient-counterattack', label: 'Nháº«n nhá»‹n rá»“i pháº£n cÃ´ng' },
  { value: 'cold-sharp', label: 'Láº¡nh lÃ¹ng sáº¯c bÃ©n' },
  { value: 'business-queen', label: 'Ná»¯ cÆ°á»ng thÆ°Æ¡ng chiáº¿n' },
  { value: 'hidden-heiress', label: 'GiÃ u ngáº§m / thÃ¢n pháº­n áº©n' },
  { value: 'betrayed-bride', label: 'CÃ´ dÃ¢u bá»‹ pháº£n bá»™i' },
]

const chapterLengthOptions: Option[] = [
  { value: 'short', label: 'Ngáº¯n 1.800â€“2.500 kÃ½ tá»±' },
  { value: 'medium', label: 'Vá»«a 2.500â€“3.500 kÃ½ tá»±' },
  { value: 'long', label: 'DÃ i 3.500â€“4.500 kÃ½ tá»±' },
]

const cliffhangerOptions: Option[] = [
  { value: 'new-evidence', label: 'Báº±ng chá»©ng má»›i xuáº¥t hiá»‡n' },
  { value: 'villain-counterattack', label: 'Pháº£n diá»‡n pháº£n cÃ´ng' },
  { value: 'hot-search', label: 'Hot search bÃ¹ng ná»•' },
  { value: 'key-character', label: 'NhÃ¢n váº­t quan trá»ng xuáº¥t hiá»‡n' },
  { value: 'face-slap-line', label: 'Ná»¯ chÃ­nh tung cÃ¢u váº£ máº·t' },
  { value: 'secret-message-camera', label: 'Tin nháº¯n / camera bÃ­ máº­t' },
  { value: 'legal-reversal', label: 'Há»£p Ä‘á»“ng / phÃ¡p lÃ½ Ä‘áº£o chiá»u' },
]

const coverStyleOptions: Option[] = [
  { value: 'minimal-portrait', label: 'Minimal Portrait' },
  { value: 'anime-drama', label: 'Anime Drama' },
  { value: 'luxury-wedding', label: 'Luxury Wedding' },
  { value: 'corporate-queen', label: 'Corporate Queen' },
  { value: 'revenge-poster', label: 'Revenge Poster' },
]

const colorThemeOptions: Option[] = [
  { value: 'warm-gold', label: 'Warm Gold' },
  { value: 'dark-luxury', label: 'Dark Luxury' },
  { value: 'cold-blue', label: 'Cold Blue' },
  { value: 'red-drama', label: 'Red Drama' },
  { value: 'black-amber', label: 'Black Amber' },
]

const characterVibeOptions: Option[] = [
  { value: 'stoic', label: 'Stoic' },
  { value: 'cold-queen', label: 'Cold Queen' },
  { value: 'broken-bride', label: 'Broken Bride' },
  { value: 'elegant-revenge', label: 'Elegant Revenge' },
  { value: 'soft-dangerous', label: 'Soft but Dangerous' },
]

function findLabel(options: Option[], value: string) {
  return options.find((item) => item.value === value)?.label || value
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1 text-xs text-zinc-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm font-medium text-zinc-100 outline-none focus:border-amber-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function buildStoryPlanMock({
  form,
  selectedStory,
  categoryOptions,
}: {
  form: AIFormState
  selectedStory: StoryLite | null
  categoryOptions: Option[]
}) {
  const idea =
    form.promptIdea.trim() ||
    selectedStory?.title ||
    'Má»™t ná»¯ chÃ­nh bá»‹ pháº£n bá»™i trong hÃ´n lá»… vÃ  báº¯t Ä‘áº§u pháº£n cÃ´ng.'

  const categoryLabel = findLabel(categoryOptions, form.category)
  const styleLabel = findLabel(mainCharacterOptions, form.mainCharacterStyle)
  const lengthLabel = findLabel(chapterLengthOptions, form.chapterLength)
  const cliffLabel = findLabel(cliffhangerOptions, form.cliffhangerType)

  return `# STORY PLAN

## TÃªn truyá»‡n
${selectedStory?.title || 'Sau Khi Bá»‹ Pháº£n Bá»™i, TÃ´i Khiáº¿n Cáº£ NhÃ  Há» Quá»³ Xin Lá»—i'}

## CÃ´ng thá»©c viáº¿t
Ná»¯ táº§n Ä‘Ã´ thá»‹ viral Trung Quá»‘c

## Thá»ƒ loáº¡i
${categoryLabel}

## Bá»‘i cáº£nh
Trung Quá»‘c hiá»‡n Ä‘áº¡i, táº­p Ä‘oÃ n, hÃ o mÃ´n, Weibo/Douyin/hot search, tiá»n tá»‡ tá»‡/RMB.

## Ã tÆ°á»Ÿng chÃ­nh
${idea}

## Hook
Ngay trong khoáº£nh kháº¯c tÃ´i bá»‹ Ã©p cÃºi Ä‘áº§u nháº­n lá»—i, má»™t Ä‘oáº¡n báº±ng chá»©ng chÆ°a tá»«ng cÃ´ng bá»‘ báº¯t Ä‘áº§u Ä‘Æ°á»£c gá»­i tá»›i Ä‘iá»‡n thoáº¡i cá»§a tá»«ng ngÆ°á»i trong phÃ²ng.

## TÃ³m táº¯t
Ná»¯ chÃ­nh thuá»™c kiá»ƒu "${styleLabel}", ban Ä‘áº§u bá»‹ pháº£n bá»™i, bá»‹ gaslight vÃ  bá»‹ Ä‘áº©y vÃ o tháº¿ máº¥t máº·t cÃ´ng khai. NhÆ°ng cÃ´ khÃ´ng tung toÃ n bá»™ báº±ng chá»©ng ngay. CÃ´ giá»¯ láº¡i Ä‘Ã²n chÃ­ máº¡ng, Ä‘á»ƒ pháº£n diá»‡n tá»± Ä‘Ã o há»‘ qua tá»«ng chÆ°Æ¡ng.

## NhÃ¢n váº­t
- Ná»¯ chÃ­nh: xÆ°ng tÃ´i, ${styleLabel}, cÃ ng vá» sau cÃ ng láº¡nh vÃ  kiá»ƒm soÃ¡t tháº¿ cá»¥c.
- Pháº£n diá»‡n chÃ­nh: ngÆ°á»i pháº£n bá»™i/táº­p Ä‘oÃ n/hÃ o mÃ´n Ä‘ang cá»‘ dÃ¹ng quyá»n lá»±c vÃ  dÆ° luáº­n Ã©p ná»¯ chÃ­nh im láº·ng.
- NhÃ¢n váº­t há»— trá»£: chá»‰ há»— trá»£ thÃ´ng tin/phÃ¡p lÃ½, khÃ´ng tháº¯ng thay ná»¯ chÃ­nh.

## MÃ¢u thuáº«n cá»‘t lÃµi
Danh dá»±, tÃ i sáº£n, cá»• pháº§n/há»£p Ä‘á»“ng vÃ  sá»± pháº£n bá»™i cÃ´ng khai.

## Revenge Weapon
Camera, ghi Ã¢m, há»£p Ä‘á»“ng, Ä‘iá»u khoáº£n phÃ¡p lÃ½, hot search Weibo vÃ  má»™t nhÃ¢n chá»©ng chÆ°a lá»™ máº·t.

## Evidence Pacing
- 0â€“25%: chá»‰ cÃ i dáº¥u hiá»‡u.
- 25â€“50%: tháº¯ng nhá», hÃ© báº±ng chá»©ng phá»¥.
- 50â€“75%: pháº£n diá»‡n pháº£n cÃ´ng, báº±ng chá»©ng máº¡nh xuáº¥t hiá»‡n má»™t pháº§n.
- 75â€“90%: váº£ máº·t cÃ´ng khai.
- 90â€“100%: payoff cuá»‘i, pháº£n diá»‡n tráº£ giÃ¡.

## Äá»™ dÃ i chÆ°Æ¡ng má»¥c tiÃªu
${lengthLabel}

## Kiá»ƒu káº¿t chÆ°Æ¡ng Æ°u tiÃªn
${cliffLabel}

## Má»©c uáº¥t á»©c
${form.humiliationLevel}/5

## Má»©c tráº£ thÃ¹
${form.revengeIntensity}/5

## Outline 6 chÆ°Æ¡ng
ChÆ°Æ¡ng 1: Opening Shock â€” ná»¯ chÃ­nh bá»‹ pháº£n bá»™i cÃ´ng khai, giá»¯ láº¡i báº±ng chá»©ng Ä‘áº§u tiÃªn.
ChÆ°Æ¡ng 2: Gaslighting â€” pháº£n diá»‡n Ã©p ná»¯ chÃ­nh nháº­n lá»—i, dÆ° luáº­n báº¯t Ä‘áº§u nghiÃªng sai hÆ°á»›ng.
ChÆ°Æ¡ng 3: First Counterattack â€” ná»¯ chÃ­nh tung má»™t máº£nh báº±ng chá»©ng nhá», pháº£n diá»‡n chÆ°a sá»¥p.
ChÆ°Æ¡ng 4: Escalation â€” pháº£n diá»‡n pháº£n cÃ´ng báº±ng truyá»n thÃ´ng báº©n/há»£p Ä‘á»“ng giáº£.
ChÆ°Æ¡ng 5: Public Face-Slap â€” báº±ng chá»©ng máº¡nh lÃªn hot search, Ä‘á»“ng minh pháº£n diá»‡n dao Ä‘á»™ng.
ChÆ°Æ¡ng 6: Final Payoff â€” ná»¯ chÃ­nh tung Ä‘Ã²n cuá»‘i, pháº£n diá»‡n máº¥t danh dá»±/tÃ i sáº£n/quyá»n lá»±c.`
}

function buildChapterMock({
  form,
  selectedStory,
  categoryOptions,
}: {
  form: AIFormState
  selectedStory: StoryLite | null
  categoryOptions: Option[]
}) {
  const idea =
    form.promptIdea.trim() ||
    selectedStory?.title ||
    'Má»™t ná»¯ chÃ­nh bá»‹ pháº£n bá»™i trong hÃ´n lá»… vÃ  báº¯t Ä‘áº§u pháº£n cÃ´ng.'

  const categoryLabel = findLabel(categoryOptions, form.category)
  const styleLabel = findLabel(mainCharacterOptions, form.mainCharacterStyle)
  const lengthLabel = findLabel(chapterLengthOptions, form.chapterLength)
  const cliffLabel = findLabel(cliffhangerOptions, form.cliffhangerType)

  const baseScene = `TÃ´i Ä‘á»©ng giá»¯a sáº£nh tiá»‡c khÃ¡ch sáº¡n nÄƒm sao á»Ÿ ThÆ°á»£ng Háº£i, vÃ¡y cÆ°á»›i cÃ²n chÆ°a ká»‹p thay, Ä‘Ã£ nghe Lá»¥c ThÃ nh nÃ³i trÆ°á»›c máº·t hÆ¡n ba trÄƒm khÃ¡ch má»i:

â€œLÃ¢m An NhiÃªn, cÃ´ Ä‘á»«ng lÃ m loáº¡n ná»¯a. NgÆ°á»i tÃ´i yÃªu tháº­t sá»± khÃ´ng pháº£i cÃ´.â€

Cáº£ sáº£nh im phÄƒng pháº¯c.

MÃ n hÃ¬nh lá»›n sau lÆ°ng anh ta váº«n Ä‘ang chiáº¿u áº£nh cÆ°á»›i cá»§a chÃºng tÃ´i. CÃ²n ngÆ°á»i phá»¥ ná»¯ Ä‘Æ°á»£c anh ta náº¯m tay kÃ©o lÃªn sÃ¢n kháº¥u láº¡i chÃ­nh lÃ  Háº¡ Máº¡n Nhi, cÃ´ em gÃ¡i nuÃ´i mÃ  máº¹ tÃ´i tá»«ng báº¯t tÃ´i nhÆ°á»ng phÃ²ng, nhÆ°á»ng vÃ¡y, nhÆ°á»ng cáº£ suáº¥t du há»c.

CÃ´ ta cÃºi Ä‘áº§u, nÆ°á»›c máº¯t rÆ¡i Ä‘Ãºng lÃºc.

â€œChá»‹, em xin lá»—i. NhÆ°ng tÃ¬nh yÃªu khÃ´ng thá»ƒ Ã©p buá»™c.â€

Má»™t cÃ¢u nháº¹ tÃªnh, láº¡i Ä‘á»§ biáº¿n tÃ´i thÃ nh ngÆ°á»i thá»© ba trong chÃ­nh lá»… Ä‘Ã­nh hÃ´n cá»§a mÃ¬nh.

DÆ°á»›i sÃ¢n kháº¥u, Lá»¥c phu nhÃ¢n láº¡nh máº·t Ä‘áº·t chÃ©n trÃ  xuá»‘ng.

â€œAn NhiÃªn, nhÃ  há» Lá»¥c cáº§n thá»ƒ diá»‡n. Náº¿u cÃ´ cÃ²n hiá»ƒu chuyá»‡n, hÃ£y tá»± bÆ°á»›c xuá»‘ng.â€

TÃ´i nhÃ¬n tá»«ng gÆ°Æ¡ng máº·t quen thuá»™c.

NgÆ°á»i tá»«ng nÃ³i tÃ´i lÃ  con dÃ¢u duy nháº¥t cá»§a nhÃ  há» Lá»¥c, giá» trÃ¡nh Ã¡nh máº¯t tÃ´i.

NgÆ°á»i tá»«ng nháº­n cá»• pháº§n há»“i mÃ´n cá»§a tÃ´i, giá» báº£o tÃ´i Ä‘á»«ng lÃ m máº¥t máº·t gia tá»™c.

TÃ´i chá»£t báº­t cÆ°á»i.

KhÃ´ng lá»›n.

NhÆ°ng Ä‘á»§ Ä‘á»ƒ micro trÆ°á»›c máº·t thu láº¡i.

Lá»¥c ThÃ nh nhÃ­u mÃ y. â€œCÃ´ cÆ°á»i cÃ¡i gÃ¬?â€

TÃ´i rÃºt Ä‘iá»‡n thoáº¡i khá»i tÃºi xÃ¡ch, má»Ÿ tin nháº¯n vá»«a nháº­n Ä‘Æ°á»£c tá»« phÃ²ng phÃ¡p vá»¥ Váº¡n Thá»‹nh.

Trong Ä‘Ã³ cÃ³ má»™t dÃ²ng ngáº¯n:

â€œHá»£p Ä‘á»“ng liÃªn minh giá»¯a Lá»¥c thá»‹ vÃ  Váº¡n Thá»‹nh cÃ³ Ä‘iá»u khoáº£n há»§y ngang náº¿u bÃªn Lá»¥c thá»‹ vi pháº¡m Ä‘áº¡o Ä‘á»©c thÆ°Æ¡ng nghiá»‡p trong sá»± kiá»‡n cÃ´ng khai.â€

TÃ´i chÆ°a báº¥m gá»­i.

ChÆ°a pháº£i lÃºc.

Má»™t con bÃ i Ä‘á»§ lÃ m há» cháº£y mÃ¡u, nhÆ°ng chÆ°a Ä‘á»§ Ä‘á»ƒ káº¿t thÃºc.

TÃ´i ngáº©ng Ä‘áº§u nhÃ¬n Háº¡ Máº¡n Nhi.

â€œCÃ´ cháº¯c hÃ´m nay muá»‘n Ä‘á»©ng trÃªn sÃ¢n kháº¥u nÃ y?â€

Máº·t cÃ´ ta tráº¯ng Ä‘i trong má»™t thoÃ¡ng.

Ráº¥t nhanh thÃ´i.

Nhanh Ä‘áº¿n má»©c ngÆ°á»i khÃ¡c khÃ´ng nháº­n ra.

NhÆ°ng tÃ´i nháº­n ra.

VÃ¬ ngÆ°á»i Ä‘ang nÃ³i dá»‘i luÃ´n sá»£ ngÆ°á»i khÃ¡c há»i Ä‘Ãºng chá»— Ä‘au.

Lá»¥c ThÃ nh bÆ°á»›c cháº¯n trÆ°á»›c máº·t cÃ´ ta.

â€œÄá»§ rá»“i. Náº¿u cÃ´ cÃ²n lÃ m loáº¡n, tÃ´i sáº½ yÃªu cáº§u báº£o vá»‡ Ä‘Æ°a cÃ´ ra ngoÃ i.â€

TÃ´i gáº­t Ä‘áº§u.

â€œÄÆ°á»£c.â€

Rá»“i tÃ´i cáº§m micro, nhÃ¬n tháº³ng vá» phÃ­a camera livestream cá»§a khÃ¡ch sáº¡n.

â€œVáº­y trÆ°á»›c khi tÃ´i ra ngoÃ i, tÃ´i chá»‰ há»i má»™t cÃ¢u.â€

TÃ´i dá»«ng láº¡i, nhÃ¬n cáº£ nhÃ  há» Lá»¥c.

â€œÄoáº¡n camera háº­u trÆ°á»ng lÃºc 19 giá» 42 phÃºt, cÃ¡c ngÆ°á»i muá»‘n tá»± cÃ´ng bá»‘, hay Ä‘á»ƒ tÃ´i cÃ´ng bá»‘?â€`

  const extraMedium = `

KhÃ´ng khÃ­ trong sáº£nh tiá»‡c Ä‘Ã´ng cá»©ng.

Lá»¥c ThÃ nh vá»‘n Ä‘ang Ä‘á»‹nh giáº­t micro khá»i tay tÃ´i, bá»—ng khá»±ng láº¡i.

Háº¡ Máº¡n Nhi náº¯m cháº·t tay Ã¡o anh ta. MÃ³ng tay cÃ´ ta báº¥m Ä‘áº¿n tráº¯ng bá»‡ch, nhÆ°ng giá»ng váº«n má»m nhÆ° nÆ°á»›c.

â€œChá»‹, chá»‹ Ä‘ang nÃ³i gÃ¬ váº­y? Em khÃ´ng hiá»ƒu.â€

TÃ´i nhÃ¬n cÃ´ ta.

â€œKhÃ´ng hiá»ƒu cÅ©ng khÃ´ng sao. Camera hiá»ƒu.â€

Tiáº¿ng bÃ n tÃ¡n báº¯t Ä‘áº§u ná»•i lÃªn nhÆ° sÃ³ng.

â€œCamera gÃ¬?â€

â€œHáº­u trÆ°á»ng lÃºc 19 giá» 42 phÃºt cháº³ng pháº£i lÃ  lÃºc cÃ´ Háº¡ máº¥t tÃ­ch sao?â€

â€œCÃ³ pháº£i cÃ²n chuyá»‡n khÃ¡c khÃ´ng?â€

Lá»¥c phu nhÃ¢n láº­p tá»©c Ä‘á»©ng dáº­y.

â€œLÃ¢m An NhiÃªn, cÃ´ muá»‘n há»§y cáº£ buá»•i tiá»‡c sao?â€

TÃ´i quay sang bÃ  ta, bÃ¬nh tÄ©nh Ä‘áº¿n má»©c chÃ­nh tÃ´i cÅ©ng tháº¥y xa láº¡.

â€œKhÃ´ng pháº£i tÃ´i há»§y.â€

TÃ´i chá»‰ vÃ o mÃ n hÃ¬nh lá»›n phÃ­a sau.

â€œLÃ  cÃ¡c ngÆ°á»i tá»± dá»±ng sÃ¢n kháº¥u nÃ y lÃªn.â€`

  const extraLong = `

Má»™t nhÃ¢n viÃªn khÃ¡ch sáº¡n Ã´m mÃ¡y tÃ­nh cháº¡y tá»« phÃ­a sau cÃ¡nh gÃ  ra, máº·t tÃ¡i mÃ©t.

â€œLá»¥c tá»•ng, há»‡ thá»‘ng livestream bá»‹ ngÆ°á»i xem report quÃ¡ nhiá»u, phÃ²ng ká»¹ thuáº­t há»i cÃ³ cáº§n táº¯t khÃ´ng?â€

Táº¯t?

Muá»™n rá»“i.

TrÃªn Douyin, Ä‘oáº¡n Lá»¥c ThÃ nh náº¯m tay Háº¡ Máº¡n Nhi tuyÃªn bá»‘ há»§y hÃ´n Ä‘Ã£ bá»‹ cáº¯t thÃ nh hÃ ng chá»¥c video.

TrÃªn Weibo, hashtag #Lá»¥cThá»‹Há»§yHÃ´nTrÃªnSÃ¢nKháº¥u Ä‘ang leo lÃªn hot search khu vá»±c ThÆ°á»£ng Háº£i.

TÃ´i nhÃ¬n mÃ n hÃ¬nh Ä‘iá»‡n thoáº¡i.

BÃ¬nh luáº­n cháº¡y nhanh Ä‘áº¿n má»©c gáº§n nhÆ° khÃ´ng Ä‘á»c ká»‹p.

â€œÄáº¡i tiá»ƒu thÆ° bá»‹ cÆ°á»›p hÃ´n phu ngay trong lá»… Ä‘Ã­nh hÃ´n?â€

â€œEm gÃ¡i nuÃ´i? Láº¡i lÃ  em gÃ¡i nuÃ´i?â€

â€œCamera háº­u trÆ°á»ng lÃ  gÃ¬? Mau cÃ´ng bá»‘!â€

Lá»¥c ThÃ nh cuá»‘i cÃ¹ng cÅ©ng nháº­n ra chuyá»‡n khÃ´ng cÃ²n náº±m trong táº§m kiá»ƒm soÃ¡t.

Anh ta nghiáº¿n rÄƒng, háº¡ giá»ng chá»‰ Ä‘á»§ cho tÃ´i nghe.

â€œAn NhiÃªn, cÃ´ muá»‘n gÃ¬?â€

TÃ´i cÆ°á»i nháº¡t.

CÃ¢u nÃ y, Ä‘Ã¡ng láº½ anh ta pháº£i há»i sá»›m hÆ¡n.

TrÆ°á»›c khi dÃ¹ng tÃ i sáº£n há»“i mÃ´n cá»§a tÃ´i Ä‘á»ƒ Ä‘á»•i láº¥y dá»± Ã¡n Nam Cáº£ng.

TrÆ°á»›c khi Ä‘á»ƒ Háº¡ Máº¡n Nhi máº·c chiáº¿c vÃ¡y tÃ´i Ä‘áº·t riÃªng.

TrÆ°á»›c khi biáº¿n tÃ´i thÃ nh trÃ² cÆ°á»i trÆ°á»›c toÃ n bá»™ ThÆ°á»£ng Háº£i.

TÃ´i Ä‘áº·t Ä‘iá»‡n thoáº¡i xuá»‘ng cáº¡nh micro.

â€œLá»¥c ThÃ nh, tÃ´i tá»«ng muá»‘n má»™t lá»i giáº£i thÃ­ch.â€

TÃ´i nhÃ¬n anh ta, tá»«ng chá»¯ ráº¥t cháº­m.

â€œBÃ¢y giá» tÃ´i muá»‘n thanh toÃ¡n.â€`

  let body = baseScene

  if (form.chapterLength === 'medium') {
    body += extraMedium
  }

  if (form.chapterLength === 'long') {
    body += extraMedium + extraLong
  }

  return `# Báº¢N Äá»ŒC CHO Äá»˜C GIáº¢

# ChÆ°Æ¡ng â€” ${selectedStory?.title || 'CÃ´ DÃ¢u Bá»‹ Pháº£n Bá»™i'}

${body}

---

# Báº¢N PHÃ‚N TÃCH Ká»¸ THUáº¬T / KHÃ”NG ÄÄ‚NG

=== STORY PROGRESS CHECK ===
- Mode: ${form.mode}
- Ã tÆ°á»Ÿng: ${idea}
- Thá»ƒ loáº¡i: ${categoryLabel}
- Kiá»ƒu ná»¯ chÃ­nh: ${styleLabel}
- Äá»™ dÃ i chÆ°Æ¡ng: ${lengthLabel}
- Kiá»ƒu káº¿t chÆ°Æ¡ng: ${cliffLabel}
- Má»©c uáº¥t á»©c: ${form.humiliationLevel}/5
- Má»©c tráº£ thÃ¹: ${form.revengeIntensity}/5

=== STORY MEMORY ===
- Ná»¯ chÃ­nh bá»‹ há»§y hÃ´n cÃ´ng khai táº¡i khÃ¡ch sáº¡n nÄƒm sao á»Ÿ ThÆ°á»£ng Háº£i.
- Lá»¥c ThÃ nh cÃ´ng khai chá»n Háº¡ Máº¡n Nhi.
- Ná»¯ chÃ­nh giá»¯ láº¡i camera háº­u trÆ°á»ng lÃºc 19 giá» 42 phÃºt, chÆ°a tung toÃ n bá»™.

=== PAYOFF SETUP TRACKER ===
- Setup Ä‘Ã£ cÃ i: camera háº­u trÆ°á»ng, há»£p Ä‘á»“ng liÃªn minh Lá»¥c thá»‹ â€“ Váº¡n Thá»‹nh, hot search Weibo.
- Payoff chÆ°a thá»±c hiá»‡n: cÃ´ng bá»‘ toÃ n bá»™ camera, Ä‘iá»u khoáº£n há»§y há»£p Ä‘á»“ng, pháº£n diá»‡n máº¥t quyá»n/danh tiáº¿ng.

=== EVIDENCE PACING TRACKER ===
- Chá»‰ hÃ© báº±ng chá»©ng, chÆ°a tung Tier 4.
- Giá»¯ Ä‘áº¡n cuá»‘i cho giai Ä‘oáº¡n public face-slap/final payoff.

=== CONFLICT ESCALATION LEDGER ===
- Conflict tÄƒng tá»« pháº£n bá»™i cÃ¡ nhÃ¢n lÃªn scandal cÃ´ng khai + nguy cÆ¡ thÆ°Æ¡ng chiáº¿n.`
}

export default function AIGeneratePanel() {
  const [aiForm, setAiForm] = useState<AIFormState>({
    mode: 'chapter',
    provider: 'mock',
    moduleId: 'female-urban-viral',
    category: 'hon-nhan-phan-boi-ngoai-tinh',
    mainCharacterStyle: 'patient-counterattack',
    chapterLength: 'short',
    cliffhangerType: 'new-evidence',
    coverStyle: 'minimal-portrait',
    colorTheme: 'warm-gold',
    characterVibe: 'stoic',
    promptIdea: '',
    humiliationLevel: 3,
    revengeIntensity: 3,
  })

  const [selectedStory, setSelectedStory] = useState<StoryLite | null>(null)
  const [storyOptions, setStoryOptions] = useState<StoryLite[]>([])
  const [categories, setCategories] = useState<Option[]>([])
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const categoryOptions = useMemo(() => {
    return categories.length ? categories : fallbackCategories
  }, [categories])

  const previewStats = useMemo(() => {
    return {
      chars: preview.length,
      lines: preview ? preview.split('\n').length : 1,
    }
  }, [preview])

  useEffect(() => {
    let ignore = false

    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (!ignore) {
          const mapped =
            data?.map((item: any) => ({
              value: item.slug,
              label: item.name,
            })) || []

          setCategories(mapped)

          if (mapped.length) {
            setAiForm((prev) => {
              const exists = mapped.some((item) => item.value === prev.category)
              return exists ? prev : { ...prev, category: mapped[0].value }
            })
          }
        }
      } catch {
        if (!ignore) {
          setCategories([])
        }
      }
    }

    loadCategories()

    return () => {
      ignore = true
    }
  }, [])
  
  useEffect(() => {
    let ignore = false

    async function loadStoriesForDraft() {
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('id, title, slug, author, status, description')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (!ignore) {
          setStoryOptions(data || [])
        }
      } catch {
        if (!ignore) {
          setStoryOptions([])
          setMessage('KhÃ´ng load Ä‘Æ°á»£c danh sÃ¡ch truyá»‡n Ä‘á»ƒ lÆ°u draft.')
        }
      }
    }

    loadStoriesForDraft()

    return () => {
      ignore = true
    }
  }, [])
  
  function updateAiForm<K extends keyof AIFormState>(key: K, value: AIFormState[K]) {
    setAiForm((prev) => ({ ...prev, [key]: value }))
    setMessage(null)
  }
  
  async function handleGenerate() {
    setLoading(true)
    setMessage(null)

    try {
      if (aiForm.provider === 'mock') {
        window.setTimeout(() => {
          const output =
            aiForm.mode === 'story-plan'
              ? buildStoryPlanMock({ form: aiForm, selectedStory, categoryOptions })
              : buildChapterMock({ form: aiForm, selectedStory, categoryOptions })

          setPreview(output)
          setLoading(false)
        }, 350)

        return
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: aiForm.mode,
          moduleId: aiForm.moduleId,
          title: selectedStory?.title || '',
          storySummary: selectedStory?.description || '',
          promptIdea: aiForm.promptIdea,
          genreLabel: findLabel(categoryOptions, aiForm.category),
          mainCharacterStyleLabel: findLabel(mainCharacterOptions, aiForm.mainCharacterStyle),
          chapterLengthLabel: findLabel(chapterLengthOptions, aiForm.chapterLength),
          cliffhangerLabel: findLabel(cliffhangerOptions, aiForm.cliffhangerType),
          humiliationLevel: aiForm.humiliationLevel,
          revengeIntensity: aiForm.revengeIntensity,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'OpenAI API lá»—i.')
      }

      if (!data?.text) {
        throw new Error('OpenAI khÃ´ng tráº£ ná»™i dung.')
      }

      setPreview(data.text)
      setMessage(`ÄÃ£ generate báº±ng OpenAI API${data.model ? ` (${data.model})` : ''}.`)
    } catch (err: any) {
      setMessage(
        `Generate tháº¥t báº¡i: ${String(err?.message ?? err)}. Náº¿u Ä‘ang cháº¡y localhost báº±ng npm run dev thÃ¬ /api cÃ³ thá»ƒ chÆ°a cháº¡y; dÃ¹ng vercel dev hoáº·c deploy lÃªn Vercel Ä‘á»ƒ test API.`
      )
    } finally {
      setLoading(false)
    }
  }
  
  function handleClear() {
    setPreview('')
    setMessage(null)
  }

  async function copyText(text: string, successMessage: string) {
    if (!text.trim()) return

    await navigator.clipboard.writeText(text)
    setMessage(successMessage)
  }

  function getReaderOnly() {
    if (!preview) return ''
    return preview.split('\n---\n')[0] || preview
  }

  
  function makeSlug(input: string) {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  function getDraftTitle() {
    const readerOnly = getReaderOnly()

    const chapterLine =
      readerOnly
        .split('\n')
        .find((line) => line.trim().startsWith('# ChÆ°Æ¡ng')) ||
      selectedStory?.title ||
      'ChÆ°Æ¡ng nhÃ¡p AI'

    return chapterLine
      .replace(/^#+\s*/, '')
      .replace(/^ChÆ°Æ¡ng\s*[â€”-]\s*/i, '')
      .trim()
  }
  
  async function saveDraft(source: 'insert' | 'draft') {
    if (!preview.trim()) {
      setMessage('ChÆ°a cÃ³ ná»™i dung Ä‘á»ƒ lÆ°u.')
      return
    }

    const readerOnly = getReaderOnly()
    const title = getDraftTitle()
    const slugBase = makeSlug(title || 'chuong-nhap-ai')
    const slug = `${slugBase}-${Date.now()}`

    const localPayload = {
      story_id: selectedStory?.id || null,
      story_slug: selectedStory?.slug || null,
      story_title: selectedStory?.title || null,
      title,
      slug,
      content: readerOnly,
      full_output: preview,
      created_at: new Date().toISOString(),
      source,
    }

    localStorage.setItem('storyPlatform.aiWriter.chapterDraft', JSON.stringify(localPayload))

    if (source === 'insert') {
      setMessage('ÄÃ£ Ä‘Æ°a ná»™i dung vÃ o draft local. CÃ³ thá»ƒ dÃ¹ng Ä‘á»ƒ Ä‘á»• vÃ o form Chapter.')
      return
    }

    let storyId = selectedStory?.id || null

    if (!storyId && selectedStory?.slug) {
      const { data: storyRow, error: storyError } = await supabase
        .from('stories')
        .select('id')
        .eq('slug', selectedStory.slug)
        .single()

      if (storyError) {
        setMessage(`KhÃ´ng tÃ¬m Ä‘Æ°á»£c truyá»‡n Ä‘Ã£ chá»n trong Supabase: ${String(storyError.message)}`)
        return
      }

      storyId = storyRow?.id || null
    }

    if (!storyId) {
      setMessage('Chá»n truyá»‡n trÆ°á»›c khi lÆ°u draft chapter vÃ o Supabase.')
      return
    }

    try {
      const payload = {
        story_id: storyId,
        title,
        slug,
        content: readerOnly,
        summary: aiForm.promptIdea.trim() || null,
        status: 'draft',
      }

      const { error } = await supabase.from('chapters').insert([payload])

      if (error) {
        const msg = String(error.message || error)

        if (msg.toLowerCase().includes('status')) {
          setMessage(
            'ChÆ°a lÆ°u Supabase Ä‘Æ°á»£c vÃ¬ báº£ng chapters thiáº¿u cá»™t status. ÄÃ£ lÆ°u backup localStorage. HÃ£y cháº¡y SQL thÃªm cá»™t status.'
          )
          return
        }

        throw error
      }

      setMessage('ÄÃ£ lÆ°u draft chapter vÃ o Supabase.')
    } catch (err: any) {
      setMessage(`LÆ°u draft tháº¥t báº¡i: ${String(err?.message ?? err)}`)
    }
  }
 
  
 
  function buildFullCoverPrompt() {
  const title =
    selectedStory?.title ||
    'Sau Khi Bá»‹ Pháº£n Bá»™i, TÃ´i Khiáº¿n Cáº£ NhÃ  Há» Quá»³ Xin Lá»—i'

  const genreLabel = findLabel(categoryOptions, aiForm.category)
  const styleLabel = findLabel(mainCharacterOptions, aiForm.mainCharacterStyle)
  const coverStyleLabel = findLabel(coverStyleOptions, aiForm.coverStyle)
  const colorThemeLabel = findLabel(colorThemeOptions, aiForm.colorTheme)
  const characterVibeLabel = findLabel(characterVibeOptions, aiForm.characterVibe)

  const summary =
    aiForm.promptIdea.trim() ||
    selectedStory?.description ||
    'A betrayed bride is publicly humiliated during an engagement ceremony, but she secretly holds evidence that can destroy the wealthy family that betrayed her.'

  const coverStylePrompt =
    aiForm.coverStyle === 'anime-drama'
      ? 'high-detail anime cover illustration, emotional facial expressions, cinematic framing, polished web-novel cover quality, dramatic lighting, glossy premium finish'
      : aiForm.coverStyle === 'luxury-wedding'
        ? 'luxury wedding visual language, grand ballroom, crystal chandeliers, couture bridal fashion, glamorous and expensive atmosphere'
        : aiForm.coverStyle === 'corporate-queen'
          ? 'modern elite corporate aesthetics, sharp fashion styling, wealthy urban atmosphere, confident female lead, premium executive aura'
          : aiForm.coverStyle === 'revenge-poster'
            ? 'high-impact revenge drama poster style, visually bold composition, intense tension, striking contrast, viral web-fiction cover energy'
            : 'clean portrait-focused cover, elegant composition, single-character emphasis, simple but premium visual hierarchy, refined illustration'

  const colorPrompt =
    aiForm.colorTheme === 'dark-luxury'
      ? 'dark luxury color palette with black, charcoal, soft gold highlights, deep shadows, subtle champagne glow, premium elite atmosphere'
      : aiForm.colorTheme === 'cold-blue'
        ? 'cold blue palette, steel-blue shadows, cool highlights, dramatic emotional distance, elegant urban chill'
        : aiForm.colorTheme === 'red-drama'
          ? 'dramatic red accents, tension-heavy atmosphere, emotional intensity, high-conflict visual tone'
          : aiForm.colorTheme === 'black-amber'
            ? 'black and amber palette, moody rich shadows, cinematic warmth, sophisticated drama look'
            : 'warm gold palette, golden highlights, soft amber light, elegant warm tones, luxurious romantic glow'

  const vibePrompt =
    aiForm.characterVibe === 'broken-bride'
      ? 'the heroine should look like a betrayed bride: emotionally wounded but still proud, graceful, cold-eyed, elegant, fragile on the surface yet internally dangerous'
      : aiForm.characterVibe === 'cold-queen'
        ? 'the heroine should appear untouchable, regal, elegant, cold, dominant, and high-status'
        : aiForm.characterVibe === 'elegant-revenge'
          ? 'the heroine should appear refined, graceful, intelligent, and quietly vengeful, with a polished aristocratic aura'
          : aiForm.characterVibe === 'soft-dangerous'
            ? 'the heroine should look gentle at first glance but carry a hidden threat, sharp intelligence, and emotional danger underneath'
            : 'the heroine should appear calm, restrained, composed, emotionally controlled, powerful through silence'

  return `Create a premium vertical web-novel cover illustration.

  Format: 2:3 vertical book cover, polished digital illustration, highly detailed, cinematic, premium, commercial-quality cover art.

  Story title: "${title}"
  Genre: ${genreLabel}
  Story engine style: Ná»¯ táº§n Ä‘Ã´ thá»‹ viral Trung Quá»‘c
  Story summary: ${summary}

  Visual style:
  ${coverStylePrompt}

  Color direction:
  ${colorPrompt}

  Character vibe:
  ${vibePrompt}

  Main subject:
  A beautiful female protagonist with the character direction "${styleLabel}". She should be the main focus of the cover. She looks emotionally wounded but strong, elegant, memorable, and ready to take revenge.

  Setting:
  Modern Chinese urban luxury environment, wealthy families, elite corporate circles, glamorous hotel or banquet hall, crystal chandeliers, luxury fashion, public scandal atmosphere, Weibo/Douyin viral drama feeling.

  Composition:
  The heroine stands in the foreground. In the blurred background, show hints of betrayal: a man in a formal black suit standing close to another woman, wealthy guests, luxury lights, or a grand engagement ceremony. Keep the heroine dominant and unforgettable.

  Mood:
  Dark luxury, emotional tension, betrayal, humiliation turning into revenge, female-oriented Chinese urban drama, high-click web novel cover energy.

  Selected cover tags:
  - Cover style: ${coverStyleLabel}
  - Color theme: ${colorThemeLabel}
  - Character vibe: ${characterVibeLabel}

  Important:
  Do not add any text, logo, watermark, random letters, or unreadable typography on the cover.
  No extra fingers, no distorted face, no low-quality anatomy.
  Make it look like a premium anime-style Chinese urban revenge novel cover.`
  }
  const hasPreview = Boolean(preview.trim())

  return (
    <section className="mb-12 mt-8 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
      <h2 className="text-lg font-semibold text-zinc-100">AI Generate</h2>


      <div className="mt-5 grid gap-5">
        <div className="grid gap-2">
          <label className="grid gap-1 text-xs text-zinc-400">
            Chá»n truyá»‡n Ä‘á»ƒ gÃ¡n vÃ o chapter / lÆ°u draft
            <select
              value={selectedStory?.id ? String(selectedStory.id) : ''}
              onChange={(event) => {
                const storyId = event.target.value
                const story = storyOptions.find((item) => String(item.id) === storyId) || null
                setSelectedStory(story)

                if (story) {
                  setMessage(`ÄÃ£ chá»n truyá»‡n: ${story.title}`)
                } else {
                  setMessage(null)
                }
              }}
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm font-medium text-zinc-100 outline-none focus:border-amber-400"
            >
              <option value="">-- Chá»n truyá»‡n --</option>
              {storyOptions.map((story) => (
                <option key={story.id} value={String(story.id)}>
                  {story.title} â€” {story.author || 'KhÃ´ng rÃµ tÃ¡c giáº£'}
                </option>
              ))}
            </select>
          </label>

          {selectedStory ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-sm text-zinc-200">
              <div className="font-semibold text-zinc-100">
                ÄÃ£ chá»n: {selectedStory.title}
              </div>

              <div className="mt-1 text-xs text-zinc-400">
                ID: {selectedStory.id || 'chÆ°a cÃ³'} â€¢ {selectedStory.author || 'KhÃ´ng rÃµ tÃ¡c giáº£'} â€¢{' '}
                {selectedStory.slug}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedStory(null)
                  setMessage(null)
                }}
                className="mt-2 rounded bg-zinc-800 px-3 py-1 text-xs text-zinc-100 hover:bg-zinc-700"
              >
                Bá» chá»n
              </button>
            </div>
          ) : null}
        </div>
   

        <label className="grid gap-1 text-xs text-zinc-400">
          Prompt idea
          <input
            className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400"
            placeholder="VÃ­ dá»¥: Bá»‹ chá»“ng sáº¯p cÆ°á»›i há»§y hÃ´n ngay trÃªn sÃ¢n kháº¥u"
            value={aiForm.promptIdea}
            onChange={(event) => updateAiForm('promptIdea', event.target.value)}
          />
        </label>

        <div className="grid gap-4 lg:grid-cols-3">
          <SelectField
            label="Nguá»“n táº¡o ná»™i dung"
            value={aiForm.provider}
            options={providerOptions}
            onChange={(value) => updateAiForm('provider', value as AIFormState['provider'])}
          />

          <SelectField
            label="CÃ´ng thá»©c viáº¿t truyá»‡n"
            value={aiForm.moduleId}
            options={moduleOptions}
            onChange={(value) => updateAiForm('moduleId', value as AIFormState['moduleId'])}
          />

          <SelectField
            label="Cháº¿ Ä‘á»™"
            value={aiForm.mode}
            options={modeOptions}
            onChange={(value) => updateAiForm('mode', value as AIFormState['mode'])}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <SelectField
            label="Thá»ƒ loáº¡i"
            value={aiForm.category}
            options={categoryOptions}
            onChange={(value) => updateAiForm('category', value)}
          />

          <SelectField
            label="Kiá»ƒu ná»¯ chÃ­nh"
            value={aiForm.mainCharacterStyle}
            options={mainCharacterOptions}
            onChange={(value) => updateAiForm('mainCharacterStyle', value)}
          />

          <SelectField
            label="Äá»™ dÃ i chÆ°Æ¡ng"
            value={aiForm.chapterLength}
            options={chapterLengthOptions}
            onChange={(value) => updateAiForm('chapterLength', value as AIFormState['chapterLength'])}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="text-xs text-zinc-400">Má»©c uáº¥t á»©c</label>
            <input
              className="mt-2 block w-full"
              type="range"
              min={1}
              max={5}
              value={aiForm.humiliationLevel}
              onChange={(event) => updateAiForm('humiliationLevel', Number(event.target.value))}
            />
            <div className="mt-1 text-xs text-zinc-400">{aiForm.humiliationLevel}</div>
          </div>

          <div>
            <label className="text-xs text-zinc-400">Má»©c tráº£ thÃ¹</label>
            <input
              className="mt-2 block w-full"
              type="range"
              min={1}
              max={5}
              value={aiForm.revengeIntensity}
              onChange={(event) => updateAiForm('revengeIntensity', Number(event.target.value))}
            />
            <div className="mt-1 text-xs text-zinc-400">{aiForm.revengeIntensity}</div>
          </div>

          <SelectField
            label="Kiá»ƒu káº¿t chÆ°Æ¡ng"
            value={aiForm.cliffhangerType}
            options={cliffhangerOptions}
            onChange={(value) => updateAiForm('cliffhangerType', value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-zinc-950 disabled:opacity-60"
          >
            {loading
              ? aiForm.provider === 'openai'
                ? 'Äang gá»i OpenAI API...'
                : 'Äang táº¡o ná»™i dung mock...'
              : 'Generate'}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg bg-zinc-800 px-4 py-2 text-zinc-100 hover:bg-zinc-700"
          >
            Clear
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <SelectField
            label="Phong cÃ¡ch bÃ¬a"
            value={aiForm.coverStyle}
            options={coverStyleOptions}
            onChange={(value) => updateAiForm('coverStyle', value)}
          />

          <SelectField
            label="TÃ´ng mÃ u bÃ¬a"
            value={aiForm.colorTheme}
            options={colorThemeOptions}
            onChange={(value) => updateAiForm('colorTheme', value)}
          />

          <SelectField
            label="KhÃ­ cháº¥t nhÃ¢n váº­t"
            value={aiForm.characterVibe}
            options={characterVibeOptions}
            onChange={(value) => updateAiForm('characterVibe', value)}
          />
        </div>

        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="text-xs text-zinc-400">Preview</div>
              <div className="text-xs text-zinc-500">Provider: {aiForm.provider}</div>
            </div>

            <div className="text-xs text-zinc-400">
              Sá»‘ kÃ½ tá»±: {previewStats.chars} â€¢ DÃ²ng: {previewStats.lines}
            </div>
          </div>

          <div className="max-h-[420px] w-full overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-zinc-900/40 p-4 text-sm leading-relaxed text-zinc-100 sm:max-h-[600px]">
            {loading ? 'Äang táº¡o ná»™i dung mock...' : preview || 'ChÆ°a cÃ³ ná»™i dung.'}
          </div>

          {message ? (
            <div className="mt-2 rounded-lg border border-emerald-800 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
              {message}
            </div>
          ) : null}

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              disabled={!hasPreview}
              onClick={() => saveDraft('insert')}
              className="w-full rounded-lg bg-amber-300 px-4 py-2 text-zinc-900 disabled:opacity-50 sm:w-auto"
            >
              ÄÆ°a vÃ o form Chapter
            </button>

            <button
              type="button"
              disabled={!hasPreview}
              onClick={() => copyText(preview, 'ÄÃ£ copy toÃ n bá»™ output.')}
              className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-zinc-100 disabled:opacity-50 sm:w-auto"
            >
              Copy toÃ n bá»™
            </button>

            <button
              type="button"
              disabled={!hasPreview}
              onClick={() => copyText(getReaderOnly(), 'ÄÃ£ copy Báº¢N Äá»ŒC CHO Äá»˜C GIáº¢.')}
              className="w-full rounded-lg bg-zinc-700 px-4 py-2 text-zinc-100 disabled:opacity-50 sm:w-auto"
            >
              Copy Báº¢N Äá»ŒC CHO Äá»˜C GIáº¢
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="w-full rounded-lg bg-zinc-600 px-4 py-2 text-zinc-100 sm:w-auto"
            >
              Clear Preview
            </button>

            <button
              type="button"
              onClick={() => copyText(buildFullCoverPrompt(), 'ÄÃ£ copy cover prompt Ä‘áº§y Ä‘á»§.')}
              className="w-full rounded-lg bg-zinc-700 px-4 py-2 text-zinc-100 sm:w-auto"
            >
              Copy Cover Prompt
            </button>

            <button
              type="button"
              disabled={!hasPreview}
              onClick={() => saveDraft('draft')}
              className="w-full rounded-lg bg-sky-500 px-4 py-2 text-zinc-950 disabled:opacity-50 sm:w-auto"
            >
              Save as Draft Chapter
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
