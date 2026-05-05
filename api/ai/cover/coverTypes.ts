export type JsonRecord = Record<string, any>

export type CoverBlueprint =
  | 'showbiz-scandal'
  | 'family-inheritance'
  | 'airport-mystery'
  | 'marriage-betrayal'
  | 'child-school'
  | 'hospital-truth'
  | 'corporate-war'
  | 'general-drama'

export interface CoverConcept {
  blueprint: CoverBlueprint
  arena: string
  mood: string
  heroineLook: string
  heroineAction: string
  signatureObject: string
  signatureScene: string
  secondaryFigures: string[]
  clueProps: string[]
  conflictVisuals: string[]
  mustShowElements: string[]
  colorTone: string
  compositionType: string
  cameraAngle: string
  antiGenericNotes: string[]
}

export interface TitleDrivenVisuals {
  signatureObject: string
  signatureScene: string
  supportingProps: string[]
  supportingFigures: string[]
  visualConflict: string[]
  heroineAction: string
  arenaHint: string
  moodHint: string
}

export interface StoryInput {
  id?: string
  title: string
  summary?: string
  description?: string
  genre?: string
  genreLabel?: string
  genres?: string[]
  tags?: string[]
  slug?: string
  story_dna?: JsonRecord | string | null
  storyDna?: JsonRecord | string | null
  author?: string
  style?: string
  visual_style?: string
  cover_style?: string
}

export interface CoverBuildResult {
  prompt: string
  fallbackPrompt: string
  coverConcept: CoverConcept
}
