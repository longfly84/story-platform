// Pools extracted from promptBuilder to central config for hooks, cliffhangers and drama elements
export const HOOK_POOLS: Record<string, string[]> = {
  default: [
    'a glass shatters and everyone turns',
    'someone points and laughs; a secret is revealed',
    'an envelope marked "For you" is opened in public',
    'a whispered name echoes across the room',
    'a call comes in: "You need to leave now."'
  ],
  family_revenge: [
    'inheritance papers placed on the table',
    'a relative reveals a hidden lineage'
  ],
  workplace_revenge: [
    'a performance chart is flashed across the room',
    'a manager names you in front of the team and laughs'
  ],
  school_betrayal: [
    'a rumor is shouted in the hallway',
    'a photo is pinned to the board'
  ],
  hidden_authority: [
    'a name appears on a sealed list',
    'an anonymous note slides under the door'
  ],
  toxic_family: [
    'a toast hits you like an accusation',
    'an old letter is read aloud'
  ]
}

export const CLIFFHANGER_POOLS = [
  'the lights go out and someone screams',
  'a gunshot rings nearby',
  'the antagonist collapses unexpectedly',
  'a key witness disappears into the crowd',
  'a phone buzzes with a message: "I know what you did."'
]

export const DRAMA_POOLS = {
  humiliation: [
    'tripped and spilled drink on stage',
    'humiliated by a leaked secret in front of coworkers',
    'falsely accused and shouted down publicly',
    'a private message projected live',
    'a photo used to shame them in public'
  ],
  antagonist: [
    'a polished rival who smiles while cutting you down',
    'an influential in-law who controls gossip',
    'a charismatic boss who hides malice behind compliments',
    'a charming ex who plays audience like a puppet'
  ],
  reveal: [
    'a hidden ledger',
    'a whispered confession caught on camera',
    'an unsigned letter that changes everything',
    'a text message thread exposing alliances'
  ]
}

export default { HOOK_POOLS, CLIFFHANGER_POOLS, DRAMA_POOLS }
