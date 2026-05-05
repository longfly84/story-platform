export function getFactoryChapterProgress(params: {
  currentChapters?: number | null
  targetChapters?: number | null
  maxCreateNow?: number | null
}) {
  const current = Math.max(0, Math.floor(Number(params.currentChapters ?? 0)))
  const target = Math.max(0, Math.floor(Number(params.targetChapters ?? 0)))
  const maxCreateNow = Math.max(0, Math.floor(Number(params.maxCreateNow ?? 0)))

  const remaining = target > 0 ? Math.max(0, target - current) : 0
  const nextChapter = current + 1

  const createNow =
    target > 0
      ? Math.min(remaining, maxCreateNow || remaining)
      : maxCreateNow

  const createTo = createNow > 0 ? current + createNow : current

  return {
    current,
    target,
    remaining,
    nextChapter,

    createNow,
    createFrom: createNow > 0 ? nextChapter : null,
    createTo: createNow > 0 ? createTo : null,

    isFull: target > 0 && current >= target,
    hasTarget: target > 0,

    progressLabel: target > 0 ? `${current}/${target}` : `${current}/?`,

    remainingLabel:
      target > 0
        ? remaining > 0
          ? `Còn thiếu ${remaining} chương`
          : `Đã full ${current}/${target}`
        : 'Chưa có target chương',

    nextChapterLabel:
      target > 0 && current >= target
        ? 'Không có chương tiếp theo'
        : `Chương tiếp theo: ${nextChapter}`,

    createRangeLabel:
      createNow > 0
        ? createNow === 1
          ? `Lần này sẽ tạo chương ${nextChapter}`
          : `Lần này sẽ tạo chương ${nextChapter} → ${createTo}`
        : target > 0 && current >= target
          ? 'Không tạo thêm vì đã full'
          : 'Chưa xác định chương cần tạo',
  }
}