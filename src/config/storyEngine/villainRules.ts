// Minimal villain rules and archetypes
export const VILLAIN_RULES: Record<string, any> = {
  'gaslighting_fiance': {
    archetype: 'gaslighting fiance',
    speech_pattern: 'smooth, belittling',
    manipulation_tactic: 'deny and rewrite events',
    humiliation_method: 'private insults that become public',
    weakness: 'pride in public image',
    panic_behavior: 'blame others loudly',
    downfall_style: 'public exposure via evidence'
  },
  'golden_child_sibling': {
    archetype: 'golden child sibling',
    speech_pattern: 'condescending charm',
    manipulation_tactic: 'social leverage and favoritism',
    humiliation_method: 'public comparisons',
    weakness: 'entitlement blinds them',
    panic_behavior: 'deflect with outrage',
    downfall_style: 'revealed hypocrisy'
  },
  'toxic_mother': {
    archetype: 'toxic mother',
    speech_pattern: 'soft threat, passive-aggressive',
    manipulation_tactic: 'guilt and obligation',
    humiliation_method: 'expose private failures at gatherings',
    weakness: 'need for control',
    panic_behavior: 'withdraw and weaponize silence',
    downfall_style: 'family turns away publicly'
  },
  'greedy_relative': {
    archetype: 'greedy relative',
    speech_pattern: 'brash, transactional',
    manipulation_tactic: 'legal and financial pressure',
    humiliation_method: 'threaten with loss of status',
    weakness: 'avarice',
    panic_behavior: 'rush reckless deals',
    downfall_style: 'legal/financial collapse'
  },
  'arrogant_boss': {
    archetype: 'arrogant boss',
    speech_pattern: 'short, dismissive',
    manipulation_tactic: 'public belittling, promotion threats',
    humiliation_method: 'blame in meetings',
    weakness: 'fear of losing control',
    panic_behavior: 'lash out at subordinates',
    downfall_style: 'scandal and removal'
  },
  'fake_victim_green_tea': {
    archetype: 'fake victim',
    speech_pattern: 'honeyed, performative',
    manipulation_tactic: 'playing innocence to gain allies',
    humiliation_method: 'twist truth to shame target',
    weakness: 'consistency slips',
    panic_behavior: 'overact and contradict',
    downfall_style: 'caught on record'
  },
  'coward_husband': {
    archetype: 'coward husband',
    speech_pattern: 'fawning, evasive',
    manipulation_tactic: 'gaslighting and withdrawal',
    humiliation_method: 'abandon in public',
    weakness: 'self-preservation',
    panic_behavior: 'run away/deny',
    downfall_style: 'abandoned when stakes rise'
  },
  'status_thief': {
    archetype: 'status thief',
    speech_pattern: 'polished, insinuating',
    manipulation_tactic: 'steal credit and connections',
    humiliation_method: 'undermine reputations subtly',
    weakness: 'relies on image',
    panic_behavior: 'fabricate alibis',
    downfall_style: 'network turns on them'
  }
}

export default VILLAIN_RULES
