export type FactoryChapterProgressInput = {
  currentChapter?: number | null
  currentChapters?: number | null
  targetChapters?: number | null
  maxCreateNow?: number | null
}

export function getFactoryChapterProgress(params: FactoryChapterProgressInput) {
  const rawCurrent = params.currentChapters ?? params.currentChapter ?? 0
  const current = Math.max(0, Math.floor(Number(rawCurrent)))
  const target = Math.max(0, Math.floor(Number(params.targetChapters ?? 0)))
  const maxCreateNow = Math.max(0, Math.floor(Number(params.maxCreateNow ?? 0)))

  const remaining = target > 0 ? Math.max(0, target - current) : 0
  const nextChapter = current + 1

  const createNow =
    target > 0
      ? Math.min(remaining, maxCreateNow || remaining)
      : maxCreateNow

  const createTo = createNow > 0 ? current + createNow : current

  const hasTarget = target > 0
  const isFull = hasTarget && current >= target
  const progressPercent = hasTarget
    ? Math.min(100, Math.round((current / target) * 100))
    : 0

  return {
    current,
    target,
    remaining,
    nextChapter,
    createNow,
    createFrom: createNow > 0 ? nextChapter : null,
    createTo: createNow > 0 ? createTo : null,
    isFull,
    hasTarget,

    currentChapter: current,
    targetChapters: target,
    remainingChapters: remaining,
    progressPercent,
    isComplete: isFull,

    progressLabel: hasTarget ? `${current}/${target}` : `${current}/?`,

    remainingLabel: hasTarget
      ? remaining > 0
        ? `Còn thiếu ${remaining} chương`
        : `Đã full ${current}/${target}`
      : 'Chưa có target chương',

    nextChapterLabel: isFull
      ? 'Không có chương tiếp theo'
      : `Chương tiếp theo: ${nextChapter}`,

    createRangeLabel:
      createNow > 0
        ? createNow === 1
          ? `Lần này sẽ tạo chương ${nextChapter}`
          : `Lần này sẽ tạo chương ${nextChapter} → ${createTo}`
        : isFull
          ? 'Không tạo thêm vì đã full'
          : 'Chưa xác định chương cần tạo',
  }
}