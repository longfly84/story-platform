type GeneratePayload = {
  mode?: 'chapter' | 'story-plan'
  moduleId?: string
  title?: string
  storySummary?: string
  promptIdea?: string
  genreLabel?: string
  mainCharacterStyleLabel?: string
  chapterLengthLabel?: string
  cliffhangerLabel?: string
  humiliationLevel?: number
  revengeIntensity?: number
}

function safeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function getOutputText(data: any) {
  if (typeof data?.output_text === 'string') {
    return data.output_text
  }

  if (Array.isArray(data?.output)) {
    const parts: string[] = []

    for (const item of data.output) {
      if (Array.isArray(item?.content)) {
        for (const content of item.content) {
          if (typeof content?.text === 'string') {
            parts.push(content.text)
          }
        }
      }
    }

    return parts.join('\n').trim()
  }

  return ''
}

function buildPrompt(payload: GeneratePayload) {
  const mode = payload.mode === 'story-plan' ? 'story-plan' : 'chapter'
  const title = safeText(payload.title, 'Truyện nữ tần đô thị')
  const idea = safeText(payload.promptIdea || payload.storySummary, 'Một nữ chính bị phản bội và bắt đầu phản công.')
  const genre = safeText(payload.genreLabel, 'Hôn nhân phản bội / ngoại tình')
  const mainStyle = safeText(payload.mainCharacterStyleLabel, 'Nhẫn nhịn rồi phản công')
  const length = safeText(payload.chapterLengthLabel, 'Vừa 1.800–2.300 ký tự')
  const cliff = safeText(payload.cliffhangerLabel, 'Bằng chứng mới xuất hiện')
  const humiliation = payload.humiliationLevel ?? 3
  const revenge = payload.revengeIntensity ?? 3

  const common = `
Bạn là Master Story Engine v2.4 cho truyện nữ tần đô thị viral Trung Quốc.

Viết bằng tiếng Việt.
Bối cảnh: Trung Quốc hiện đại, hào môn, công sở/tập đoàn, Weibo/Douyin/hot search, tiền tệ RMB/tệ.
Giọng văn: ngôi thứ nhất "tôi", câu ngắn, giàu cảm xúc, nhiều tension, có nhịp web novel.
Không viết như dàn bài khô nếu đang tạo chương truyện.
Không đạo văn.
Không nhắc rằng bạn là AI.
Không giải thích ngoài output.

Thông tin truyện:
- Tên truyện: ${title}
- Ý tưởng: ${idea}
- Thể loại: ${genre}
- Công thức: Nữ tần đô thị viral Trung Quốc
- Kiểu nữ chính: ${mainStyle}
- Độ dài mục tiêu: ${length}
- Kiểu kết chương: ${cliff}
- Mức uất ức: ${humiliation}/5
- Mức trả thù: ${revenge}/5

Quy tắc pacing:
- Nữ chính không thắng quá dễ.
- Bằng chứng không tung hết ngay.
- Mỗi chương phải có xung đột rõ.
- Phản diện phải có hành động gây áp lực.
- Kết chương phải tạo lý do đọc tiếp.
- Nếu có thông tin kỹ thuật, đặt dưới phần KHÔNG ĐĂNG.
`.trim()

  if (mode === 'story-plan') {
    return `
${common}

Nhiệm vụ: Tạo dàn ý truyện.

Output bắt buộc theo format:

# STORY PLAN

## Tên truyện
...

## Logline
...

## Bối cảnh
...

## Nhân vật chính
...

## Phản diện
...

## Mâu thuẫn cốt lõi
...

## Revenge Weapon
...

## Evidence Pacing
...

## Outline 10 chương
Chương 1: ...
Chương 2: ...
...
Chương 10: ...

## Ghi chú viral
...
`.trim()
  }

  return `
${common}

Nhiệm vụ: Viết một chương truyện hoàn chỉnh để đăng cho độc giả.

Output bắt buộc theo format:

# BẢN ĐỌC CHO ĐỘC GIẢ

# Chương — [tên chương hấp dẫn]

[Viết nội dung chương ở đây. Không bullet, không phân tích trong phần này. Câu văn ngắn, giàu drama, có đối thoại, có hành động, có twist.]

---

# BẢN PHÂN TÍCH KỸ THUẬT / KHÔNG ĐĂNG

=== STORY PROGRESS CHECK ===
- ...

=== STORY MEMORY ===
- ...

=== PAYOFF SETUP TRACKER ===
- ...

=== EVIDENCE PACING TRACKER ===
- ...

=== CONFLICT ESCALATION LEDGER ===
- ...
`.trim()
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL || 'gpt-5-mini'

  if (!apiKey) {
    return res.status(500).json({
      error: 'Missing OPENAI_API_KEY on server.',
    })
  }

  try {
    const payload = (req.body || {}) as GeneratePayload
    const prompt = buildPrompt(payload)

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: prompt,
        max_output_tokens: payload.mode === 'story-plan' ? 3200 : 5200,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'OpenAI request failed.',
        raw: data,
      })
    }

    const text = getOutputText(data)

    if (!text) {
      return res.status(500).json({
        error: 'OpenAI returned empty text.',
        raw: data,
      })
    }

    return res.status(200).json({
      text,
      provider: 'openai',
      model,
    })
  } catch (error: any) {
    return res.status(500).json({
      error: String(error?.message ?? error),
    })
  }
}