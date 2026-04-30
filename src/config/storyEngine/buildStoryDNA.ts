import { STORY_TYPES } from './storyTypes'
import { EMOTION_TAGS } from './emotionTags'
import { HUMILIATION_POOLS } from './humiliations'
import { PAYOFF_POOLS } from './payoffs'
import { CLIFFHANGER_SEEDS } from './cliffhangers'
import type { StoryDNA } from './types'

function choose<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)] }

export function buildStoryDNA(input: Partial<StoryDNA> = {}): StoryDNA {
  const story_type = input.story_type || choose(STORY_TYPES).id
  const core_wound = input.core_wound || 'public betrayal'
  const power_fantasy = input.power_fantasy || 'expose and regain dignity'
  const humiliation_type = input.humiliation_type || choose(HUMILIATION_POOLS)
  const antagonist_type = input.antagonist_type || 'charismatic manipulator'
  const payoff_type = input.payoff_type || choose(PAYOFF_POOLS)
  const cliffhanger_type = input.cliffhanger_type || choose(CLIFFHANGER_SEEDS)
  const emotion_tags = input.emotion_tags || [choose(EMOTION_TAGS)]
  const humiliation_level = typeof input.humiliation_level === 'number' ? input.humiliation_level : Math.floor(Math.random() * 10)
  const revenge_intensity = typeof input.revenge_intensity === 'number' ? input.revenge_intensity : Math.floor(Math.random() * 10)
  const chapter_length = input.chapter_length || (['short','medium','long'][Math.floor(Math.random()*3)] as any)

  return {
    story_type,
    core_wound,
    power_fantasy,
    humiliation_type,
    antagonist_type,
    payoff_type,
    cliffhanger_type,
    emotion_tags,
    humiliation_level,
    revenge_intensity,
    chapter_length,
  }
}

export default buildStoryDNA
