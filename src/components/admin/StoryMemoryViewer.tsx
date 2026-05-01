type Props = {
  stories: any[]
  selectedMemorySlug: string | null
  setSelectedMemorySlug: (value: string | null) => void
  memoryData: any
  memoryCollapsed: Record<string, boolean>
  setMemoryCollapsed: (updater: (prev: Record<string, boolean>) => Record<string, boolean>) => void
  loadStoryMemory: (slug: string) => void | Promise<void>
  saveStoryMemoryToDb: () => void | Promise<void>
}

export default function StoryMemoryViewer({
  stories,
  selectedMemorySlug,
  setSelectedMemorySlug,
  memoryData,
  memoryCollapsed,
  setMemoryCollapsed,
  loadStoryMemory,
  saveStoryMemoryToDb,
}: Props) {
  return (
    <section className="mb-12 mt-6 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-lg font-semibold text-zinc-100">Story Memory Viewer</h2>
        <div className="flex flex-wrap gap-2">
          <select className="rounded bg-zinc-900/60 p-2 text-sm text-zinc-100" value={selectedMemorySlug ?? ''} onChange={(e) => setSelectedMemorySlug(e.target.value || null)}>
            <option value="">-- Chọn truyện --</option>
            {stories.map((s: any) => <option key={s.id} value={s.slug}>{s.title}</option>)}
          </select>
          <button type="button" onClick={() => { if (selectedMemorySlug) void loadStoryMemory(selectedMemorySlug) }} className="rounded bg-amber-300 px-3 py-1 text-sm text-zinc-900">Load Memory</button>
          <button type="button" onClick={() => void saveStoryMemoryToDb()} className="rounded bg-emerald-500 px-3 py-1 text-sm text-zinc-900">Save Memory</button>
        </div>
      </div>

      <div className="mt-3 text-sm text-zinc-200">
        {memoryData ? (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <div className="font-medium text-zinc-100">Story DNA</div>
                <button type="button" className="text-xs text-zinc-400" onClick={() => setMemoryCollapsed((m) => ({ ...m, current_arc: !m.current_arc }))}>{memoryCollapsed.current_arc ? 'Show' : 'Hide'}</button>
              </div>
              {!memoryCollapsed.current_arc ? <pre className="mt-2 overflow-auto rounded bg-zinc-900/20 p-2 text-xs text-zinc-200">{JSON.stringify(memoryData.story_dna, null, 2)}</pre> : null}
            </div>

            {['active_conflicts', 'pending_payoffs', 'known_secrets', 'relationships', 'unresolved_humiliations', 'emotion_tags'].map((k) => (
              <div key={k}>
                <div className="flex items-center justify-between">
                  <div className="font-medium text-zinc-100">{k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</div>
                  <button type="button" className="text-xs text-zinc-400" onClick={() => setMemoryCollapsed((m) => ({ ...m, [k]: !m[k] }))}>{memoryCollapsed[k] ? 'Show' : 'Hide'}</button>
                </div>
                {!memoryCollapsed[k] ? (
                  <div className="mt-2 rounded bg-zinc-900/20 p-2 text-xs text-zinc-200">
                    {Array.isArray(memoryData.story_memory?.[k]) ? (
                      <ul className="list-disc space-y-1 pl-4">{(memoryData.story_memory[k] || []).map((it: any, idx: number) => <li key={idx}>{String(it)}</li>)}</ul>
                    ) : (
                      <pre className="whitespace-pre-wrap">{JSON.stringify(memoryData.story_memory?.[k], null, 2)}</pre>
                    )}
                  </div>
                ) : null}
              </div>
            ))}

            <div>
              <div className="flex items-center justify-between">
                <div className="font-medium text-zinc-100">Current Arc</div>
                <button type="button" className="text-xs text-zinc-400" onClick={() => setMemoryCollapsed((m) => ({ ...m, current_arc: !m.current_arc }))}>{memoryCollapsed.current_arc ? 'Show' : 'Hide'}</button>
              </div>
              {!memoryCollapsed.current_arc ? <div className="mt-2 text-sm text-zinc-200">{memoryData.current_arc ?? '(empty)'}</div> : null}
            </div>
          </div>
        ) : (
          <div className="text-zinc-400">Chưa load memory. Chọn truyện và bấm Load Memory.</div>
        )}
      </div>
    </section>
  )
}
