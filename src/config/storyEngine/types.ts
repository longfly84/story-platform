// generic types for story engine
export type StoryDNA = {
  story_type: string
  core_wound: string
  power_fantasy: string
  humiliation_type: string
  antagonist_type: string
  payoff_type: string
  cliffhanger_type: string
  emotion_tags: string[]
  humiliation_level: number
  revenge_intensity: number
  chapter_length: 'short'|'medium'|'long'
}

export type Scenario = {
  opening_hook: string
  setting: string
  humiliation_scene: string
  antagonist_action: string
  main_reaction: string
  reveal_seed: string
  cliffhanger_event: string
}

export default {} as any
