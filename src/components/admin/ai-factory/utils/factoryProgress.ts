export type FactoryChapterProgressInput = {
  chapterNumber?: number | null;
  currentChapter?: number | null;
  generatedChapters?: number | null;
  targetChapters?: number | null;
  totalChapters?: number | null;
};

export function getFactoryChapterProgress(input: FactoryChapterProgressInput) {
  const currentChapter = Math.max(
    0,
    Math.floor(
      input.generatedChapters ?? input.currentChapter ?? input.chapterNumber ?? 0,
    ),
  );

  const targetChapters = Math.max(
    0,
    Math.floor(input.targetChapters ?? input.totalChapters ?? 0),
  );

  const remainingChapters = Math.max(targetChapters - currentChapter, 0);
  const progressPercent = targetChapters
    ? Math.min(100, Math.round((currentChapter / targetChapters) * 100))
    : 0;

  return {
    currentChapter,
    targetChapters,
    remainingChapters,
    progressPercent,
    isComplete: targetChapters > 0 && currentChapter >= targetChapters,
    progressLabel: targetChapters
      ? `${currentChapter}/${targetChapters}`
      : `${currentChapter}`,
  };
}
