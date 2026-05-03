type PreviewStats = {
  chars: number
  lines: number
}

type AIWriterPreviewPanelProps = {
  preview: string
  loading: boolean
  provider: 'mock' | 'openai'
  hasPreview: boolean
  previewStats: PreviewStats
  message: string | null
  onCreateStoryDraft: () => void | Promise<void>
  onInsertChapter: () => void | Promise<void>
  onCopyAll: () => void | Promise<void>
  onCopyReaderOnly: () => void | Promise<void>
  onClear: () => void
  onCopyCoverPrompt: () => void | Promise<void>
  onSaveDraftChapter: () => void | Promise<void>
}

export default function AIWriterPreviewPanel({
  preview,
  loading,
  provider,
  hasPreview,
  previewStats,
  message,
  onCreateStoryDraft,
  onInsertChapter,
  onCopyAll,
  onCopyReaderOnly,
  onClear,
  onCopyCoverPrompt,
  onSaveDraftChapter,
}: AIWriterPreviewPanelProps) {
  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-400">Preview</div>
          <div className="text-xs text-zinc-500">Provider: {provider}</div>
        </div>

        <div className="text-xs text-zinc-400">
          Số ký tự: {previewStats.chars} • Dòng: {previewStats.lines}
        </div>
      </div>

      <div className="max-h-[420px] w-full overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-zinc-900/40 p-4 text-sm leading-relaxed text-zinc-100 sm:max-h-[600px]">
        {loading
          ? provider === 'openai'
            ? 'Đang gọi OpenAI API...'
            : 'Đang tạo nội dung mock...'
          : preview || 'Chưa có nội dung.'}
      </div>

      {message ? (
        <div className="mt-2 rounded-lg border border-emerald-800 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
          {message}
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={!hasPreview}
          onClick={onCreateStoryDraft}
          className="w-full rounded-lg bg-purple-500 px-4 py-2 text-zinc-950 disabled:opacity-50 sm:w-auto"
        >
          Tạo Story Draft từ Preview
        </button>

        <button
          type="button"
          disabled={!hasPreview}
          onClick={onInsertChapter}
          className="w-full rounded-lg bg-amber-300 px-4 py-2 text-zinc-900 disabled:opacity-50 sm:w-auto"
        >
          Đưa vào form Chapter
        </button>

        <button
          type="button"
          disabled={!hasPreview}
          onClick={onCopyAll}
          className="w-full rounded-lg bg-zinc-800 px-4 py-2 text-zinc-100 disabled:opacity-50 sm:w-auto"
        >
          Copy toàn bộ
        </button>

        <button
          type="button"
          disabled={!hasPreview}
          onClick={onCopyReaderOnly}
          className="w-full rounded-lg bg-zinc-700 px-4 py-2 text-zinc-100 disabled:opacity-50 sm:w-auto"
        >
          Copy BẢN ĐỌC CHO ĐỘC GIẢ
        </button>

        <button
          type="button"
          onClick={onClear}
          className="w-full rounded-lg bg-zinc-600 px-4 py-2 text-zinc-100 sm:w-auto"
        >
          Clear Preview
        </button>

        <button
          type="button"
          onClick={onCopyCoverPrompt}
          className="w-full rounded-lg bg-zinc-700 px-4 py-2 text-zinc-100 sm:w-auto"
        >
          Copy Cover Prompt
        </button>

        <button
          type="button"
          disabled={!hasPreview}
          onClick={onSaveDraftChapter}
          className="w-full rounded-lg bg-sky-500 px-4 py-2 text-zinc-950 disabled:opacity-50 sm:w-auto"
        >
          Save as Draft Chapter
        </button>
      </div>
    </div>
  )
}