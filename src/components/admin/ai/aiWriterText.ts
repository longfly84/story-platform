export function getMarkdownSection(markdown: string, heading: string) {
  const lines = markdown.split('\n')
  const headingIndex = lines.findIndex((line) => line.trim() === heading)

  if (headingIndex === -1) return ''

  const collected: string[] = []

  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const line = lines[index]

    if (line.trim().startsWith('## ') || line.trim().startsWith('# ')) {
      break
    }

    collected.push(line)
  }

  return collected.join('\n').trim()
}

export function extractReaderOnly(preview: string) {
  const marker = '# BẢN ĐỌC CHO ĐỘC GIẢ'
  const techMarker = '---'

  const markerIndex = preview.indexOf(marker)

  if (markerIndex === -1) return preview.trim()

  const afterMarker = preview.slice(markerIndex).trim()
  const techIndex = afterMarker.indexOf(techMarker)

  if (techIndex === -1) return afterMarker.trim()

  return afterMarker.slice(0, techIndex).trim()
}

export function getChapterTitleFromReader(readerOnly: string, fallbackTitle = 'Chương nháp AI') {
  const chapterLine =
    readerOnly.split('\n').find((line) => line.trim().startsWith('# Chương')) || fallbackTitle

  return chapterLine
    .replace(/^#+\s*/, '')
    .replace(/^Chương\s*[—-]\s*/i, '')
    .trim()
}

export function getStoryTitleFromPreviewText({
  preview,
  fallbackTitle,
}: {
  preview: string
  fallbackTitle: string
}) {
  const planTitle = getMarkdownSection(preview, '## Tên truyện')
    .split('\n')
    .find((line) => line.trim())

  if (planTitle) return planTitle.replace(/^[-*]\s*/, '').trim()

  const chapterTitle = preview.split('\n').find((line) => line.trim().startsWith('# Chương'))

  if (chapterTitle) {
    return chapterTitle
      .replace(/^#+\s*/, '')
      .replace(/^Chương\s*[—-]\s*/i, '')
      .trim()
  }

  return fallbackTitle
}

export function getStoryDescriptionFromPreviewText({
  preview,
  fallbackDescription,
}: {
  preview: string
  fallbackDescription: string
}) {
  const logline = getMarkdownSection(preview, '## Logline')
  if (logline) return logline

  const summary = getMarkdownSection(preview, '## Tóm tắt')
  if (summary) return summary

  const conflict = getMarkdownSection(preview, '## Mâu thuẫn cốt lõi')
  if (conflict) return conflict

  return fallbackDescription
}