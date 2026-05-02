import type { StoryLite } from './aiWriterOptions'

type StoryPickerProps = {
  storyQuery: string
  setStoryQuery: (value: string) => void
  filteredStories: StoryLite[]
  selectedStory: StoryLite | null
  setSelectedStory: (story: StoryLite | null) => void
  setMessage: (message: string | null) => void
}

export default function StoryPicker({
  storyQuery,
  setStoryQuery,
  filteredStories,
  selectedStory,
  setSelectedStory,
  setMessage,
}: StoryPickerProps) {
  return (
    <div className="grid gap-2">
      <label className="grid gap-1 text-xs text-zinc-400">
        Chọn truyện để gán vào chapter / lưu draft
        <input
          value={storyQuery}
          onChange={(event) => setStoryQuery(event.target.value)}
          placeholder="Tìm truyện theo tên, slug, tác giả..."
          className="rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-amber-400"
        />
      </label>

      <div className="grid gap-2">
        {filteredStories.map((story) => (
          <button
            key={story.id}
            type="button"
            onClick={() => {
              setSelectedStory(story)
              setStoryQuery(story.title)
              setMessage(`Đã chọn truyện: ${story.title}`)
            }}
            className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-left text-sm text-zinc-100 hover:border-amber-300"
          >
            <div className="font-semibold">{story.title}</div>
            <div className="text-xs text-zinc-500">
              {story.author || 'Không rõ tác giả'} • {story.slug}
            </div>
          </button>
        ))}
      </div>

      {selectedStory ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-sm text-zinc-200">
          <div className="font-semibold text-zinc-100">Đã chọn: {selectedStory.title}</div>

          <div className="mt-1 text-xs text-zinc-400">
            ID: {selectedStory.id || 'chưa có'} •{' '}
            {selectedStory.author || 'Không rõ tác giả'} • {selectedStory.slug}
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedStory(null)
              setStoryQuery('')
              setMessage(null)
            }}
            className="mt-2 rounded bg-zinc-800 px-3 py-1 text-xs text-zinc-100 hover:bg-zinc-700"
          >
            Bỏ chọn
          </button>
        </div>
      ) : null}
    </div>
  )
}