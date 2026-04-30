import { family_revenge } from './storyGenres/family_revenge'
import { workplace_revenge } from './storyGenres/workplace_revenge'
import { school_betrayal } from './storyGenres/school_betrayal'
import { hidden_authority } from './storyGenres/hidden_authority'
import { toxic_family } from './storyGenres/toxic_family'

export const GENRE_REGISTRY = [family_revenge, workplace_revenge, school_betrayal, hidden_authority, toxic_family]

export const STORY_ENGINE_SYSTEM = `You are a story engine. Write fiction with retention-first rules: short sentences, fast hooks, active scenes, character-driven reveals, use first-person narration, include dialogue frequently, end with a strong hook/cliffhanger. Favor short paragraphs and lots of beats.`

export const CHAPTER_LENGTH_OPTIONS = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
]

export function buildStoryDNA(input: {
  storyType?: string,
  mainStyle?: string,
  humiliationLevel?: number,
  revengeIntensity?: number,
  cliffhangerType?: string,
  genreId?: string,
}) {
  const dna = {
    storyType: input.storyType || 'Unknown',
    mainStyle: input.mainStyle || 'Neutral',
    humiliationLevel: Number(input.humiliationLevel ?? 0),
    revengeIntensity: Number(input.revengeIntensity ?? 0),
    cliffhangerType: input.cliffhangerType || 'Reveal',
    genreId: input.genreId || null,
  }

  const summary = `Type: ${dna.storyType}. MC: ${dna.mainStyle}. Humiliation: ${dna.humiliationLevel}. Revenge: ${dna.revengeIntensity}. Cliffhanger: ${dna.cliffhangerType}.`;
  // also produce basic emotion tags for story memory
  const emotion_tags = [] as string[]
  if (dna.humiliationLevel > 5) emotion_tags.push('humiliation')
  if (dna.revengeIntensity > 5) emotion_tags.push('revenge')
  if (dna.storyType?.toLowerCase().includes('romance')) emotion_tags.push('romance')

  return { dna, summary, emotion_tags }
}

// buildMockChapter returns { title, dnaSummary, content }
export function buildMockChapter(input: {
  prompt?: string,
  dna?: any,
  length?: 'short'|'medium'|'long',
}) {
  const p = (input.prompt || 'Tôi thấy mình lạc lối').trim()
  const length = input.length || 'short'
  const dna = input.dna || {}

  const paraCounts = { short: 3, medium: 5, long: 9 }
  const pc = paraCounts[length]

  // title
  const title = `Chương mới: ${dna.storyType ?? 'Câu chuyện'}`

  // generate content: first-person, short sentences, short paragraphs, lots of dialogue
  const parts: string[] = []

  // hook
  parts.push(`Tôi không nên đứng ở đây.\n"Sao anh còn ở đó?" họ hỏi. Tôi chỉ lặng nhìn.`)

  for (let i = 0; i < pc; i++) {
    // small beat
    parts.push(`Tôi nhớ một chi tiết: ${p.split(' ')[0] || 'ánh sáng'}. Một người cười. "Cứ im đi," tôi nói.\n`) 
    // injustice / humiliation
    if (i === 1) {
      parts.push(`Họ cười nhạo tôi. Tôi giữ im lặng. Ở trong lòng, tôi thấy nhục nhã. Nhưng bên ngoài, tôi vẫn bình tĩnh.`)
    }
    // reveal
    if (i === Math.floor(pc/2)) {
      parts.push(`Có một bí mật nhỏ. Tôi phát hiện ra dấu vết của một âm mưu. Nó nằm ngay dưới mũi tôi.`)
    }
    // dialogue heavy
    parts.push(`"Anh ổn chứ?" "Ổn." "Thật sao?" "Có lẽ không."`)
  }

  // closing with cliffhanger
  const cliff = dna?.cliffhangerType || 'Reveal'
  let cliffLine = ''
  if (cliff === 'Near-death') cliffLine = 'Một viên đạn trượt qua. Tôi thấy đất nghiêng.'
  else if (cliff === 'Betrayal') cliffLine = 'Người tôi tin nhất quay lưng. Tôi không ngờ.'
  else if (cliff === 'Twist') cliffLine = 'Không phải kẻ thù, mà là... người thân tôi.'
  else cliffLine = 'Một bí mật được hé lộ. Mọi thứ thay đổi.'

  parts.push(cliffLine)

  // assemble paragraphs: ensure short sentences and short paragraphs
  const content = parts.map(p => p.trim()).join('\n\n')

  const dnaSummary = `DNA — ${dna ? (dna.storyType || '') : ''} | MC:${dna?.mainStyle ?? ''} | H:${dna?.humiliationLevel ?? 0} | R:${dna?.revengeIntensity ?? 0}`

  return { title, dnaSummary, content }
}
