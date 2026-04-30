import { HUMILIATION_POOLS } from './humiliations'
import { PAYOFF_POOLS } from './payoffs'
import { CLIFFHANGER_SEEDS } from './cliffhangers'
// emotion tags available in emotionTags (import kept for future use)
// import { EMOTION_TAGS } from './emotionTags' // reserved for future
import type { Scenario, StoryDNA } from './types'

function choose<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)] }

export function generateScenario(dna: Partial<StoryDNA> = {}): Scenario {
  // Use dna fields if provided, otherwise select from pools
  const opening_hook = dna.core_wound ? `I remember the moment the ${dna.core_wound} happened.` : choose([
    'The glass shattered and everyone turned.',
    'My name became a joke in under a minute.',
    'They laughed like I had no right to be here.'
  ])
  const setting = dna.story_type || 'a crowded hall'
  const humiliation_scene = dna.humiliation_type || choose(HUMILIATION_POOLS)
  const antagonist_action = dna.antagonist_type || 'smiled and pointed at me while the room hushed.'
  const main_reaction = 'I kept my face still. Inside, my jaw found a new rhythm.'
  const reveal_seed = dna.payoff_type || choose(PAYOFF_POOLS)
  const cliffhanger_event = dna.cliffhanger_type || choose(CLIFFHANGER_SEEDS)

  return {
    opening_hook,
    setting,
    humiliation_scene,
    antagonist_action,
    main_reaction,
    reveal_seed,
    cliffhanger_event,
  }
}

export default generateScenario
