// Minimal character consistency presets per genre
export const CHARACTER_RULES: Record<string, any> = {
  family_revenge: {
    speaking_style: 'measured, bitter',
    emotional_default: 'wounded',
    revenge_tendency: 8,
    trust_issues: 9,
    aggression_level: 4,
    manipulation_level: 6,
    romance_openness: 2,
  },
  workplace_revenge: {
    speaking_style: 'dry, clipped',
    emotional_default: 'controlled resentment',
    revenge_tendency: 7,
    trust_issues: 6,
    aggression_level: 5,
    manipulation_level: 7,
    romance_openness: 3,
  },
  school_betrayal: {
    speaking_style: 'honest, raw',
    emotional_default: 'insecure',
    revenge_tendency: 5,
    trust_issues: 7,
    aggression_level: 3,
    manipulation_level: 4,
    romance_openness: 6,
  },
  hidden_authority: {
    speaking_style: 'cautious, observant',
    emotional_default: 'suspicious',
    revenge_tendency: 4,
    trust_issues: 8,
    aggression_level: 2,
    manipulation_level: 6,
    romance_openness: 1,
  },
  toxic_family: {
    speaking_style: 'soft edged, defensive',
    emotional_default: 'guarded',
    revenge_tendency: 6,
    trust_issues: 8,
    aggression_level: 3,
    manipulation_level: 5,
    romance_openness: 4,
  },
  urban_romance: {
    speaking_style: 'light, intimate',
    emotional_default: 'hopeful',
    revenge_tendency: 2,
    trust_issues: 3,
    aggression_level: 1,
    manipulation_level: 2,
    romance_openness: 9,
  }
}

export default CHARACTER_RULES
