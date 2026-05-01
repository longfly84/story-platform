import { COVER_STYLES, COLOR_THEMES, CHARACTER_VIBES } from '@/lib/coverEngine'
import { CHAPTER_LENGTH_OPTIONS, GENRE_REGISTRY } from '@/lib/storyEngine'

type Props = {
  stories: any[]
  aiStorySlug: string
  setAiStorySlug: (value: string) => void
  aiPrompt: string
  setAiPrompt: (value: string) => void
  aiGenreId: string
  setAiGenreId: (value: string) => void
  aiMainStyle: string
  setAiMainStyle: (value: string) => void
  mainCharacterStyles: string[]
  aiLength: string
  setAiLength: (value: string) => void
  aiProvider: 'mock' | 'openai'
  setAiProvider: (value: 'mock' | 'openai') => void
  aiHumiliation: number
  setAiHumiliation: (value: number) => void
  aiRevenge: number
  setAiRevenge: (value: number) => void
  aiCliffhanger: string
  setAiCliffhanger: (value: string) => void
  cliffhangerTypes: string[]
  coverStyle: string
  setCoverStyle: (value: string) => void
  coverColor: string
  setCoverColor: (value: string) => void
  coverVibe: string
  setCoverVibe: (value: string) => void
  aiLoading: boolean
  aiResult: string
  setAiResult: (value: string) => void
  aiTitle: string
  aiDnaSummary: string
  aiProviderUsed: string | null
  aiMeta: any
  coverPrompt: string
  onGenerate: () => void | Promise<void>
  onInsertChapter: () => void
  onSaveDraft: () => void | Promise<void>
}

export default function AIGeneratePanel(props: Props) {
  const selectedGenre = GENRE_REGISTRY.find((x) => x.id === props.aiGenreId)

  return (
    <section className="mb-12 mt-8 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
      <h2 className="text-lg font-semibold text-zinc-100">AI Generate</h2>
      <div className="mt-3 grid gap-3">
        <label className="grid gap-1 text-xs text-zinc-400">
          Chọn truyện để gán vào chapter
          <select className="rounded bg-zinc-900/60 p-2 text-sm text-zinc-100" value={props.aiStorySlug} onChange={(e) => props.setAiStorySlug(e.target.value)}>
            <option value="">-- Không chọn --</option>
            {props.stories.map((s: any) => (
              <option key={s.id} value={s.slug}>{s.title}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-xs text-zinc-400">
          Prompt idea
          <input className="rounded bg-zinc-900/60 p-2 text-sm text-zinc-100" placeholder="Ví dụ: Bị chồng sắp cưới hủy hôn ngay trên sân khấu" value={props.aiPrompt} onChange={(e) => props.setAiPrompt(e.target.value)} />
        </label>

        <div className="grid gap-2 sm:grid-cols-3">
          <label className="grid gap-1 text-xs text-zinc-400">
            Genre preset
            <select
              className="rounded bg-zinc-900/60 p-2 text-sm text-zinc-100"
              value={props.aiGenreId}
              onChange={(e) => props.setAiGenreId(e.target.value)}
            >
              {GENRE_REGISTRY.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
            {selectedGenre ? <span className="text-[11px] text-zinc-600">{selectedGenre.storyTypes?.[0]}</span> : null}
          </label>

          {import.meta.env.DEV ? (
            <label className="grid gap-1 text-xs text-zinc-400">
              Provider dev
              <select className="rounded bg-zinc-900/60 p-2 text-sm text-zinc-100" value={props.aiProvider} onChange={(e) => props.setAiProvider(e.target.value as any)}>
                <option value="mock">Mock</option>
                <option value="openai">OpenAI dev</option>
              </select>
            </label>
          ) : null}

          <label className="grid gap-1 text-xs text-zinc-400">
            Main character style
            <select className="rounded bg-zinc-900/60 p-2 text-sm text-zinc-100" value={props.aiMainStyle} onChange={(e) => props.setAiMainStyle(e.target.value)}>
              {props.mainCharacterStyles.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>

          <label className="grid gap-1 text-xs text-zinc-400">
            Chapter length
            <select className="rounded bg-zinc-900/60 p-2 text-sm text-zinc-100" value={props.aiLength} onChange={(e) => props.setAiLength(e.target.value)}>
              {CHAPTER_LENGTH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <label className="text-xs text-zinc-400">Humiliation level</label>
            <input type="range" min={0} max={10} value={props.aiHumiliation} onChange={(e) => props.setAiHumiliation(Number(e.target.value))} />
            <div className="text-xs text-zinc-400">{props.aiHumiliation}</div>
          </div>
          <div>
            <label className="text-xs text-zinc-400">Revenge intensity</label>
            <input type="range" min={0} max={10} value={props.aiRevenge} onChange={(e) => props.setAiRevenge(Number(e.target.value))} />
            <div className="text-xs text-zinc-400">{props.aiRevenge}</div>
          </div>
          <label className="grid gap-1 text-xs text-zinc-400">
            Cliffhanger type
            <select className="rounded bg-zinc-900/60 p-2 text-sm text-zinc-100" value={props.aiCliffhanger} onChange={(e) => props.setAiCliffhanger(e.target.value)}>
              {props.cliffhangerTypes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void props.onGenerate()} className="rounded bg-emerald-500 px-4 py-2 text-zinc-900">{props.aiLoading ? 'Generating…' : 'Generate'}</button>
          <button type="button" onClick={() => props.setAiResult('')} className="rounded bg-zinc-800 px-4 py-2 text-zinc-100">Clear</button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <label className="grid gap-1 text-xs text-zinc-400">
            Cover style
            <select className="rounded bg-zinc-900/60 p-2 text-sm text-zinc-100" value={props.coverStyle} onChange={(e) => props.setCoverStyle(e.target.value)}>
              {COVER_STYLES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs text-zinc-400">
            Color theme
            <select className="rounded bg-zinc-900/60 p-2 text-sm text-zinc-100" value={props.coverColor} onChange={(e) => props.setCoverColor(e.target.value)}>
              {COLOR_THEMES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-xs text-zinc-400">
            Character vibe
            <select className="rounded bg-zinc-900/60 p-2 text-sm text-zinc-100" value={props.coverVibe} onChange={(e) => props.setCoverVibe(e.target.value)}>
              {CHARACTER_VIBES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-3">
          <label className="text-xs text-zinc-400">Preview</label>
          <div className="mt-2 max-h-[700px] w-full overflow-y-auto break-words rounded bg-zinc-900/40 p-4 text-sm leading-relaxed text-zinc-100 whitespace-pre-wrap">
            {props.aiLoading ? (
              <div>Đang tạo...</div>
            ) : props.aiResult ? (
              <>
                {import.meta.env.DEV ? <div className="mb-2 text-xs text-zinc-400">Provider: {props.aiProviderUsed ?? props.aiProvider}</div> : null}
                {import.meta.env.DEV && props.aiMeta?.provider_meta?.retention ? <div className="mb-2 text-xs text-zinc-400">Retention: {JSON.stringify(props.aiMeta.provider_meta.retention)}</div> : null}
                <div className="mb-2 font-semibold text-zinc-100">{props.aiTitle}</div>
                <div className="mb-2 text-xs text-zinc-400">{props.aiDnaSummary}</div>
                <div>{props.aiResult}</div>
              </>
            ) : (
              <div>Chưa có nội dung.</div>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={props.onInsertChapter} className="w-full rounded bg-amber-300 px-4 py-2 text-zinc-900 sm:w-auto">Đưa vào form Chapter</button>
            <button type="button" onClick={() => navigator.clipboard?.writeText(props.aiResult || '')} className="w-full rounded bg-zinc-800 px-4 py-2 text-zinc-100 sm:w-auto">Copy</button>
            <button type="button" onClick={() => navigator.clipboard?.writeText(props.coverPrompt || '')} className="w-full rounded bg-zinc-700 px-4 py-2 text-zinc-100 sm:w-auto">Copy Cover Prompt</button>
            <button type="button" onClick={() => void props.onSaveDraft()} className="w-full rounded bg-sky-500 px-4 py-2 text-zinc-900 sm:w-auto">Save as Draft Chapter</button>
          </div>
        </div>
      </div>
    </section>
  )
}
