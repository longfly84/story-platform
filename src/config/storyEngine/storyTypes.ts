export type StoryTypeDef = {
  id: string
  label: string
  description?: string
}

export const STORY_TYPES: StoryTypeDef[] = [
  { id: 'family_revenge', label: 'Family Revenge', description: 'Conflict rooted in family betrayal and hidden grudges' },
  { id: 'workplace_revenge', label: 'Workplace Revenge', description: 'Office politics, sabotage and public humiliation' },
  { id: 'school_betrayal', label: 'School Betrayal', description: 'Peer betrayal, gossip and social exile' },
  { id: 'hidden_authority', label: 'Hidden Authority', description: 'Abuse of power behind closed doors' },
  { id: 'toxic_family', label: 'Toxic Family', description: 'Long-running family dysfunction and manipulation' },
]

export default STORY_TYPES
