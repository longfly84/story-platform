// Payoff timing stages and helper
export const PAYOFF_STAGES = [
  'setup',
  'humiliation_build',
  'first_small_reveal',
  'villain_confidence',
  'reversal_warning',
  'partial_payoff',
  'cliffhanger_before_full_payoff',
  'full_payoff',
]

export function getStageForChapter(chapterNumber: number) {
  if (!chapterNumber || chapterNumber <= 1) return 'setup'
  if (chapterNumber === 2) return 'humiliation_build'
  if (chapterNumber === 3) return 'first_small_reveal'
  if (chapterNumber === 4) return 'villain_confidence'
  if (chapterNumber === 5) return 'reversal_warning'
  if (chapterNumber === 6) return 'partial_payoff'
  if (chapterNumber === 7) return 'cliffhanger_before_full_payoff'
  return 'full_payoff'
}

export default { PAYOFF_STAGES, getStageForChapter }
