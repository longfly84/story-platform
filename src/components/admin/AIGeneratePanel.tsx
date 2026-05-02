import { useEffect, useMemo, useState } from 'react'
import StorySearchSelect from '@/components/admin/ai/StorySearchSelect'
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
  provider: 'mock'
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
  { value: 'hon-nhan-phan-boi-ngoai-tinh', label: 'Hôn nhân phản bội / ngoại tình' },
  { value: 'cong-so-va-mat-nu-cuong-thuong-chien', label: 'Công sở vả mặt / nữ cường thương chiến' },
  { value: 'hon-nhan-phan-boi-huy-hon-chong-cu-hoi-han', label: 'Hôn nhân phản bội / hủy hôn / chồng cũ hối hận' },
  { value: 'hao-mon-lien-hon', label: 'Hào môn liên hôn' },
  { value: 'tra-thu-do-thi', label: 'Trả thù đô thị' },
]

const modeOptions: Option[] = [
  { value: 'chapter', label: 'Tạo chương truyện' },
  { value: 'story-plan', label: 'Tạo dàn ý truyện' },
]

const providerOptions: Option[] = [{ value: 'mock', label: 'Mock' }]

const moduleOptions: Option[] = [
  { value: 'female-urban-viral', label: 'Nữ tần đô thị viral Trung Quốc' },
]

const mainCharacterOptions: Option[] = [
  { value: 'patient-counterattack', label: 'Nhẫn nhịn rồi phản công' },
  { value: 'cold-sharp', label: 'Lạnh lùng sắc bén' },
  { value: 'business-queen', label: 'Nữ cường thương chiến' },
  { value: 'hidden-heiress', label: 'Giàu ngầm / thân phận ẩn' },
  { value: 'betrayed-bride', label: 'Cô dâu bị phản bội' },
]

const chapterLengthOptions: Option[] = [
  { value: 'short', label: 'Ngắn 1.000–1.500 ký tự' },
  { value: 'medium', label: 'Vừa 1.800–2.300 ký tự' },
  { value: 'long', label: 'Dài 2.800–3.500 ký tự' },
]

const cliffhangerOptions: Option[] = [
  { value: 'new-evidence', label: 'Bằng chứng mới xuất hiện' },
  { value: 'villain-counterattack', label: 'Phản diện phản công' },
  { value: 'hot-search', label: 'Hot search bùng nổ' },
  { value: 'key-character', label: 'Nhân vật quan trọng xuất hiện' },
  { value: 'face-slap-line', label: 'Nữ chính tung câu vả mặt' },
  { value: 'secret-message-camera', label: 'Tin nhắn / camera bí mật' },
  { value: 'legal-reversal', label: 'Hợp đồng / pháp lý đảo chiều' },
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
    'Một nữ chính bị phản bội trong hôn lễ và bắt đầu phản công.'

  const categoryLabel = findLabel(categoryOptions, form.category)
  const styleLabel = findLabel(mainCharacterOptions, form.mainCharacterStyle)
  const lengthLabel = findLabel(chapterLengthOptions, form.chapterLength)
  const cliffLabel = findLabel(cliffhangerOptions, form.cliffhangerType)

  return `# STORY PLAN

## Tên truyện
${selectedStory?.title || 'Sau Khi Bị Phản Bội, Tôi Khiến Cả Nhà Họ Quỳ Xin Lỗi'}

## Công thức viết
Nữ tần đô thị viral Trung Quốc

## Thể loại
${categoryLabel}

## Bối cảnh
Trung Quốc hiện đại, tập đoàn, hào môn, Weibo/Douyin/hot search, tiền tệ tệ/RMB.

## Ý tưởng chính
${idea}

## Hook
Ngay trong khoảnh khắc tôi bị ép cúi đầu nhận lỗi, một đoạn bằng chứng chưa từng công bố bắt đầu được gửi tới điện thoại của từng người trong phòng.

## Tóm tắt
Nữ chính thuộc kiểu "${styleLabel}", ban đầu bị phản bội, bị gaslight và bị đẩy vào thế mất mặt công khai. Nhưng cô không tung toàn bộ bằng chứng ngay. Cô giữ lại đòn chí mạng, để phản diện tự đào hố qua từng chương.

## Nhân vật
- Nữ chính: xưng tôi, ${styleLabel}, càng về sau càng lạnh và kiểm soát thế cục.
- Phản diện chính: người phản bội/tập đoàn/hào môn đang cố dùng quyền lực và dư luận ép nữ chính im lặng.
- Nhân vật hỗ trợ: chỉ hỗ trợ thông tin/pháp lý, không thắng thay nữ chính.

## Mâu thuẫn cốt lõi
Danh dự, tài sản, cổ phần/hợp đồng và sự phản bội công khai.

## Revenge Weapon
Camera, ghi âm, hợp đồng, điều khoản pháp lý, hot search Weibo và một nhân chứng chưa lộ mặt.

## Evidence Pacing
- 0–25%: chỉ cài dấu hiệu.
- 25–50%: thắng nhỏ, hé bằng chứng phụ.
- 50–75%: phản diện phản công, bằng chứng mạnh xuất hiện một phần.
- 75–90%: vả mặt công khai.
- 90–100%: payoff cuối, phản diện trả giá.

## Độ dài chương mục tiêu
${lengthLabel}

## Kiểu kết chương ưu tiên
${cliffLabel}

## Mức uất ức
${form.humiliationLevel}/5

## Mức trả thù
${form.revengeIntensity}/5

## Outline 6 chương
Chương 1: Opening Shock — nữ chính bị phản bội công khai, giữ lại bằng chứng đầu tiên.
Chương 2: Gaslighting — phản diện ép nữ chính nhận lỗi, dư luận bắt đầu nghiêng sai hướng.
Chương 3: First Counterattack — nữ chính tung một mảnh bằng chứng nhỏ, phản diện chưa sụp.
Chương 4: Escalation — phản diện phản công bằng truyền thông bẩn/hợp đồng giả.
Chương 5: Public Face-Slap — bằng chứng mạnh lên hot search, đồng minh phản diện dao động.
Chương 6: Final Payoff — nữ chính tung đòn cuối, phản diện mất danh dự/tài sản/quyền lực.`
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
    'Một nữ chính bị phản bội trong hôn lễ và bắt đầu phản công.'

  const categoryLabel = findLabel(categoryOptions, form.category)
  const styleLabel = findLabel(mainCharacterOptions, form.mainCharacterStyle)
  const lengthLabel = findLabel(chapterLengthOptions, form.chapterLength)
  const cliffLabel = findLabel(cliffhangerOptions, form.cliffhangerType)

  const baseScene = `Tôi đứng giữa sảnh tiệc khách sạn năm sao ở Thượng Hải, váy cưới còn chưa kịp thay, đã nghe Lục Thành nói trước mặt hơn ba trăm khách mời:

“Lâm An Nhiên, cô đừng làm loạn nữa. Người tôi yêu thật sự không phải cô.”

Cả sảnh im phăng phắc.

Màn hình lớn sau lưng anh ta vẫn đang chiếu ảnh cưới của chúng tôi. Còn người phụ nữ được anh ta nắm tay kéo lên sân khấu lại chính là Hạ Mạn Nhi, cô em gái nuôi mà mẹ tôi từng bắt tôi nhường phòng, nhường váy, nhường cả suất du học.

Cô ta cúi đầu, nước mắt rơi đúng lúc.

“Chị, em xin lỗi. Nhưng tình yêu không thể ép buộc.”

Một câu nhẹ tênh, lại đủ biến tôi thành người thứ ba trong chính lễ đính hôn của mình.

Dưới sân khấu, Lục phu nhân lạnh mặt đặt chén trà xuống.

“An Nhiên, nhà họ Lục cần thể diện. Nếu cô còn hiểu chuyện, hãy tự bước xuống.”

Tôi nhìn từng gương mặt quen thuộc.

Người từng nói tôi là con dâu duy nhất của nhà họ Lục, giờ tránh ánh mắt tôi.

Người từng nhận cổ phần hồi môn của tôi, giờ bảo tôi đừng làm mất mặt gia tộc.

Tôi chợt bật cười.

Không lớn.

Nhưng đủ để micro trước mặt thu lại.

Lục Thành nhíu mày. “Cô cười cái gì?”

Tôi rút điện thoại khỏi túi xách, mở tin nhắn vừa nhận được từ phòng pháp vụ Vạn Thịnh.

Trong đó có một dòng ngắn:

“Hợp đồng liên minh giữa Lục thị và Vạn Thịnh có điều khoản hủy ngang nếu bên Lục thị vi phạm đạo đức thương nghiệp trong sự kiện công khai.”

Tôi chưa bấm gửi.

Chưa phải lúc.

Một con bài đủ làm họ chảy máu, nhưng chưa đủ để kết thúc.

Tôi ngẩng đầu nhìn Hạ Mạn Nhi.

“Cô chắc hôm nay muốn đứng trên sân khấu này?”

Mặt cô ta trắng đi trong một thoáng.

Rất nhanh thôi.

Nhanh đến mức người khác không nhận ra.

Nhưng tôi nhận ra.

Vì người đang nói dối luôn sợ người khác hỏi đúng chỗ đau.

Lục Thành bước chắn trước mặt cô ta.

“Đủ rồi. Nếu cô còn làm loạn, tôi sẽ yêu cầu bảo vệ đưa cô ra ngoài.”

Tôi gật đầu.

“Được.”

Rồi tôi cầm micro, nhìn thẳng về phía camera livestream của khách sạn.

“Vậy trước khi tôi ra ngoài, tôi chỉ hỏi một câu.”

Tôi dừng lại, nhìn cả nhà họ Lục.

“Đoạn camera hậu trường lúc 19 giờ 42 phút, các người muốn tự công bố, hay để tôi công bố?”`

  const extraMedium = `

Không khí trong sảnh tiệc đông cứng.

Lục Thành vốn đang định giật micro khỏi tay tôi, bỗng khựng lại.

Hạ Mạn Nhi nắm chặt tay áo anh ta. Móng tay cô ta bấm đến trắng bệch, nhưng giọng vẫn mềm như nước.

“Chị, chị đang nói gì vậy? Em không hiểu.”

Tôi nhìn cô ta.

“Không hiểu cũng không sao. Camera hiểu.”

Tiếng bàn tán bắt đầu nổi lên như sóng.

“Camera gì?”

“Hậu trường lúc 19 giờ 42 phút chẳng phải là lúc cô Hạ mất tích sao?”

“Có phải còn chuyện khác không?”

Lục phu nhân lập tức đứng dậy.

“Lâm An Nhiên, cô muốn hủy cả buổi tiệc sao?”

Tôi quay sang bà ta, bình tĩnh đến mức chính tôi cũng thấy xa lạ.

“Không phải tôi hủy.”

Tôi chỉ vào màn hình lớn phía sau.

“Là các người tự dựng sân khấu này lên.”`

  const extraLong = `

Một nhân viên khách sạn ôm máy tính chạy từ phía sau cánh gà ra, mặt tái mét.

“Lục tổng, hệ thống livestream bị người xem report quá nhiều, phòng kỹ thuật hỏi có cần tắt không?”

Tắt?

Muộn rồi.

Trên Douyin, đoạn Lục Thành nắm tay Hạ Mạn Nhi tuyên bố hủy hôn đã bị cắt thành hàng chục video.

Trên Weibo, hashtag #LụcThịHủyHônTrênSânKhấu đang leo lên hot search khu vực Thượng Hải.

Tôi nhìn màn hình điện thoại.

Bình luận chạy nhanh đến mức gần như không đọc kịp.

“Đại tiểu thư bị cướp hôn phu ngay trong lễ đính hôn?”

“Em gái nuôi? Lại là em gái nuôi?”

“Camera hậu trường là gì? Mau công bố!”

Lục Thành cuối cùng cũng nhận ra chuyện không còn nằm trong tầm kiểm soát.

Anh ta nghiến răng, hạ giọng chỉ đủ cho tôi nghe.

“An Nhiên, cô muốn gì?”

Tôi cười nhạt.

Câu này, đáng lẽ anh ta phải hỏi sớm hơn.

Trước khi dùng tài sản hồi môn của tôi để đổi lấy dự án Nam Cảng.

Trước khi để Hạ Mạn Nhi mặc chiếc váy tôi đặt riêng.

Trước khi biến tôi thành trò cười trước toàn bộ Thượng Hải.

Tôi đặt điện thoại xuống cạnh micro.

“Lục Thành, tôi từng muốn một lời giải thích.”

Tôi nhìn anh ta, từng chữ rất chậm.

“Bây giờ tôi muốn thanh toán.”`

  let body = baseScene

  if (form.chapterLength === 'medium') {
    body += extraMedium
  }

  if (form.chapterLength === 'long') {
    body += extraMedium + extraLong
  }

  return `# BẢN ĐỌC CHO ĐỘC GIẢ

# Chương — ${selectedStory?.title || 'Cô Dâu Bị Phản Bội'}

${body}

---

# BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG

=== STORY PROGRESS CHECK ===
- Mode: ${form.mode}
- Ý tưởng: ${idea}
- Thể loại: ${categoryLabel}
- Kiểu nữ chính: ${styleLabel}
- Độ dài chương: ${lengthLabel}
- Kiểu kết chương: ${cliffLabel}
- Mức uất ức: ${form.humiliationLevel}/5
- Mức trả thù: ${form.revengeIntensity}/5

=== STORY MEMORY ===
- Nữ chính bị hủy hôn công khai tại khách sạn năm sao ở Thượng Hải.
- Lục Thành công khai chọn Hạ Mạn Nhi.
- Nữ chính giữ lại camera hậu trường lúc 19 giờ 42 phút, chưa tung toàn bộ.

=== PAYOFF SETUP TRACKER ===
- Setup đã cài: camera hậu trường, hợp đồng liên minh Lục thị – Vạn Thịnh, hot search Weibo.
- Payoff chưa thực hiện: công bố toàn bộ camera, điều khoản hủy hợp đồng, phản diện mất quyền/danh tiếng.

=== EVIDENCE PACING TRACKER ===
- Chỉ hé bằng chứng, chưa tung Tier 4.
- Giữ đạn cuối cho giai đoạn public face-slap/final payoff.

=== CONFLICT ESCALATION LEDGER ===
- Conflict tăng từ phản bội cá nhân lên scandal công khai + nguy cơ thương chiến.`
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

  function updateAiForm<K extends keyof AIFormState>(key: K, value: AIFormState[K]) {
    setAiForm((prev) => ({ ...prev, [key]: value }))
    setMessage(null)
  }

  function handleGenerate() {
    setLoading(true)
    setMessage(null)

    window.setTimeout(() => {
      const output =
        aiForm.mode === 'story-plan'
          ? buildStoryPlanMock({ form: aiForm, selectedStory, categoryOptions })
          : buildChapterMock({ form: aiForm, selectedStory, categoryOptions })

      setPreview(output)
      setLoading(false)
    }, 350)
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

  function saveDraft(source: 'insert' | 'draft') {
    if (!preview) return

    const readerOnly = getReaderOnly()
    const titleLine =
      readerOnly
        .split('\n')
        .find((line) => line.trim().startsWith('# Chương')) ||
      selectedStory?.title ||
      'Chương nháp AI Writer'

    const payload = {
      story_id: selectedStory?.id || null,
      story_title: selectedStory?.title || null,
      title: titleLine.replace(/^#\s*/, '').trim(),
      content: readerOnly,
      full_output: preview,
      created_at: new Date().toISOString(),
      source,
    }

    localStorage.setItem('storyPlatform.aiWriter.chapterDraft', JSON.stringify(payload))
    setMessage(
      selectedStory?.title
        ? `Đã lưu draft cho truyện: ${selectedStory.title}`
        : 'Đã lưu draft chương vào localStorage.'
    )
  }

  const hasPreview = Boolean(preview.trim())

  return (
    <section className="mb-12 mt-8 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
      <h2 className="text-lg font-semibold text-zinc-100">AI Generate</h2>

      <div className="mt-5 grid gap-5">
        <div className="grid gap-2">
          <div className="text-xs text-zinc-400">Chọn truyện để gán vào chapter</div>
          <StorySearchSelect
            onSelect={(story) => {
              setSelectedStory(story || null)
            }}
          />

          {selectedStory ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-sm text-zinc-200">
              <div className="font-semibold text-zinc-100">Đã chọn: {selectedStory.title}</div>
              <div className="mt-1 text-xs text-zinc-400">
                {selectedStory.author || 'Không rõ tác giả'} • {selectedStory.slug}
              </div>
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="mt-2 rounded bg-zinc-800 px-3 py-1 text-xs text-zinc-100 hover:bg-zinc-700"
              >
                Bỏ chọn
              </button>
            </div>
          ) : null}
        </div>

        <label className="grid gap-1 text-xs text-zinc-400">
          Prompt idea
          <input
            className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400"
            placeholder="Ví dụ: Bị chồng sắp cưới hủy hôn ngay trên sân khấu"
            value={aiForm.promptIdea}
            onChange={(event) => updateAiForm('promptIdea', event.target.value)}
          />
        </label>

        <div className="grid gap-4 lg:grid-cols-3">
          <SelectField
            label="Nguồn tạo nội dung"
            value={aiForm.provider}
            options={providerOptions}
            onChange={(value) => updateAiForm('provider', value as AIFormState['provider'])}
          />

          <SelectField
            label="Công thức viết truyện"
            value={aiForm.moduleId}
            options={moduleOptions}
            onChange={(value) => updateAiForm('moduleId', value as AIFormState['moduleId'])}
          />

          <SelectField
            label="Chế độ"
            value={aiForm.mode}
            options={modeOptions}
            onChange={(value) => updateAiForm('mode', value as AIFormState['mode'])}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <SelectField
            label="Thể loại"
            value={aiForm.category}
            options={categoryOptions}
            onChange={(value) => updateAiForm('category', value)}
          />

          <SelectField
            label="Kiểu nữ chính"
            value={aiForm.mainCharacterStyle}
            options={mainCharacterOptions}
            onChange={(value) => updateAiForm('mainCharacterStyle', value)}
          />

          <SelectField
            label="Độ dài chương"
            value={aiForm.chapterLength}
            options={chapterLengthOptions}
            onChange={(value) => updateAiForm('chapterLength', value as AIFormState['chapterLength'])}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="text-xs text-zinc-400">Mức uất ức</label>
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
            <label className="text-xs text-zinc-400">Mức trả thù</label>
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
            label="Kiểu kết chương"
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
            {loading ? 'Đang tạo nội dung mock...' : 'Generate'}
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
            label="Phong cách bìa"
            value={aiForm.coverStyle}
            options={coverStyleOptions}
            onChange={(value) => updateAiForm('coverStyle', value)}
          />

          <SelectField
            label="Tông màu bìa"
            value={aiForm.colorTheme}
            options={colorThemeOptions}
            onChange={(value) => updateAiForm('colorTheme', value)}
          />

          <SelectField
            label="Khí chất nhân vật"
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
              Số ký tự: {previewStats.chars} • Dòng: {previewStats.lines}
            </div>
          </div>

          <div className="max-h-[420px] w-full overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-zinc-900/40 p-4 text-sm leading-relaxed text-zinc-100 sm:max-h-[600px]">
            {loading ? 'Đang tạo nội dung mock...' : preview || 'Chưa có nội dung.'}
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
              Đưa vào form Chapter
            </button>

            <button
              type="button"
              disabled={!hasPreview}
              onClick={() => copyText(preview, 'Đã copy toàn bộ output.')}
              className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-zinc-100 disabled:opacity-50 sm:w-auto"
            >
              Copy toàn bộ
            </button>

            <button
              type="button"
              disabled={!hasPreview}
              onClick={() => copyText(getReaderOnly(), 'Đã copy BẢN ĐỌC CHO ĐỘC GIẢ.')}
              className="w-full rounded-lg bg-zinc-700 px-4 py-2 text-zinc-100 disabled:opacity-50 sm:w-auto"
            >
              Copy BẢN ĐỌC CHO ĐỘC GIẢ
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
              onClick={() =>
                copyText(
                  `Anime cover, ${findLabel(coverStyleOptions, aiForm.coverStyle)}, ${findLabel(
                    colorThemeOptions,
                    aiForm.colorTheme
                  )}, ${findLabel(characterVibeOptions, aiForm.characterVibe)}, Chinese urban revenge drama`,
                  'Đã copy cover prompt.'
                )
              }
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