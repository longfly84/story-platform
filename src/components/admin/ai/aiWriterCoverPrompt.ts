import {
  characterVibeOptions,
  colorThemeOptions,
  coverStyleOptions,
  findLabel,
  mainCharacterOptions,
  type AIFormState,
  type Option,
  type StoryLite,
} from './aiWriterOptions'
import { getMarkdownSection } from './aiWriterText'

export function buildFullCoverPrompt({
  selectedStory,
  preview,
  aiForm,
  categoryOptions,
}: {
  selectedStory: StoryLite | null
  preview: string
  aiForm: AIFormState
  categoryOptions: Option[]
}) {
  const title =
    selectedStory?.title ||
    getMarkdownSection(preview, '## Tên truyện')
      .split('\n')
      .find((line) => line.trim()) ||
    'Sau Khi Bị Phản Bội, Tôi Khiến Cả Nhà Họ Quỳ Xin Lỗi'

  const genreLabel = findLabel(categoryOptions, aiForm.category)
  const styleLabel = findLabel(mainCharacterOptions, aiForm.mainCharacterStyle)
  const coverStyleLabel = findLabel(coverStyleOptions, aiForm.coverStyle)
  const colorThemeLabel = findLabel(colorThemeOptions, aiForm.colorTheme)
  const characterVibeLabel = findLabel(characterVibeOptions, aiForm.characterVibe)

  const summary =
    aiForm.promptIdea.trim() ||
    selectedStory?.description ||
    getMarkdownSection(preview, '## Logline') ||
    getMarkdownSection(preview, '## Tóm tắt') ||
    'A betrayed bride is publicly humiliated during an engagement ceremony, but she secretly holds evidence that can destroy the wealthy family that betrayed her.'

  return `Create a premium vertical web-novel cover illustration.

Format: 2:3 vertical book cover, polished digital illustration, highly detailed, cinematic, premium, commercial-quality cover art.

Story title: "${title}"
Genre: ${genreLabel}
Story engine style: Nữ tần đô thị viral Trung Quốc
Story summary: ${summary}

Visual style:
${coverStyleLabel}, high-detail anime cover illustration, emotional facial expressions, cinematic framing, polished web-novel cover quality, dramatic lighting, glossy premium finish.

Color direction:
${colorThemeLabel}, dark luxury atmosphere, premium elite feeling, cinematic shadows, strong contrast.

Character vibe:
${characterVibeLabel}. The heroine should be emotionally wounded but proud, graceful, cold-eyed, elegant, fragile on the surface yet internally dangerous.

Main subject:
A beautiful female protagonist with the character direction "${styleLabel}". She should be the main focus of the cover. She looks emotionally wounded but strong, elegant, memorable, and ready to take revenge.

Setting:
Modern Chinese urban luxury environment, wealthy families, elite corporate circles, glamorous hotel or banquet hall, crystal chandeliers, luxury fashion, public scandal atmosphere, Weibo/Douyin viral drama feeling.

Composition:
The heroine stands in the foreground. In the blurred background, show hints of betrayal: a man in a formal black suit standing close to another woman, wealthy guests, luxury lights, or a grand engagement ceremony. Keep the heroine dominant and unforgettable.

Mood:
Dark luxury, emotional tension, betrayal, humiliation turning into revenge, female-oriented Chinese urban drama, high-click web novel cover energy.

Important:
Do not add any text, logo, watermark, random letters, or unreadable typography on the cover.
No extra fingers, no distorted face, no low-quality anatomy.
Make it look like a premium anime-style Chinese urban revenge novel cover.`
}