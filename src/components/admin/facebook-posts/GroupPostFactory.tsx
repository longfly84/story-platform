import { useEffect, useMemo, useState } from 'react'

import {
  FACEBOOK_POST_LIMIT,
  copyText,
  createGroupPostDraft,
  deleteDraft,
  formatDateTime,
  getStatusLabel,
  loadDrafts,
  loadPublishedStories,
  loadStoryChapters,
  limitFacebookPostText,
  type GroupPostDraft,
  type GroupPostStory,
  updateDraftStatus,
  upsertDraft,
} from './facebookPostUtils'

type ChapterMode = 'chapter1' | 'chapter1_2'
type PostLength = 'short' | 'medium' | 'long'
type DraftFilter = 'active' | 'draft' | 'copied' | 'posted' | 'skipped' | 'all'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Có lỗi không xác định.'
}

function getStatusClass(status: GroupPostDraft['status']) {
  if (status === 'posted') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
  if (status === 'copied') return 'border-sky-500/30 bg-sky-500/10 text-sky-200'
  if (status === 'skipped') return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300'
  return 'border-amber-500/30 bg-amber-500/10 text-amber-200'
}

function Button({
  children,
  onClick,
  disabled,
  variant = 'primary',
  className = '',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  className?: string
}) {
  const base =
    'inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50'

  const variants = {
    primary: 'bg-red-500 text-white hover:bg-red-400',
    secondary: 'border border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-800',
    danger: 'border border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/20',
    ghost: 'text-zinc-300 hover:bg-zinc-800',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

function DraftCard({
  draft,
  onCopy,
  onCopyNoLink,
  onCopyStoryUrl,
  onCopyImageUrl,
  onCopyComment,
  onStatus,
  onDelete,
}: {
  draft: GroupPostDraft
  onCopy: (draft: GroupPostDraft) => void
  onCopyNoLink: (draft: GroupPostDraft) => void
  onCopyStoryUrl: (draft: GroupPostDraft) => void
  onCopyImageUrl: (draft: GroupPostDraft) => void
  onCopyComment: (draft: GroupPostDraft) => void
  onStatus: (draft: GroupPostDraft, status: GroupPostDraft['status']) => void
  onDelete: (draft: GroupPostDraft) => void
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-xl shadow-black/20">
      <div className="grid gap-4 p-4 sm:grid-cols-[160px_1fr]">
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          {draft.imageUrl ? (
            <img
              src={draft.imageUrl}
              alt={draft.storyTitle}
              className="aspect-[3/4] w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center text-sm text-zinc-500">
              Không có ảnh
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="line-clamp-2 text-base font-bold text-zinc-50">
                {draft.storyTitle}
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Chương {draft.chapterNumber}
                {draft.chapterTitle ? ` — ${draft.chapterTitle}` : ''} · {formatDateTime(draft.createdAt)}
              </p>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                draft.status
              )}`}
            >
              {getStatusLabel(draft.status)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-400">
            <span>
              Độ dài bài: {(draft.caption?.length ?? 0).toLocaleString('vi-VN')} / {FACEBOOK_POST_LIMIT.toLocaleString('vi-VN')} ký tự
            </span>
            {(draft.caption?.length ?? 0) > FACEBOOK_POST_LIMIT ? (
              <span className="font-semibold text-red-300">Vượt giới hạn Facebook</span>
            ) : null}
            {draft.wasTrimmed ? (
              <span className="font-semibold text-amber-300">Đã tự cắt bớt</span>
            ) : null}
          </div>

          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-800 bg-black/40 p-3 text-sm leading-6 text-zinc-200">
            {draft.caption}
          </pre>

          <div className="space-y-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-xs text-zinc-400">
            <p className="break-all">
              <span className="text-zinc-500">Link truyện: </span>
              {draft.storyUrl}
            </p>

            <p className="break-all">
               <span className="text-zinc-500">Comment link: </span>
               {draft.commentText || `Đọc tiếp tại đây nha: ${draft.storyUrl}`}
            </p>

            <p className="break-all">
              <span className="text-zinc-500">Link ảnh: </span>
              {draft.imageUrl || 'Chưa có'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Button onClick={() => onCopy(draft)} className="w-full sm:w-auto">
              Copy bài
            </Button>
            <Button onClick={() => onCopyNoLink(draft)} variant="secondary" className="w-full sm:w-auto">
              Copy không link
            </Button>
            <Button onClick={() => onCopyStoryUrl(draft)} variant="secondary" className="w-full sm:w-auto">
              Copy link truyện
            </Button>
            <Button
              onClick={() => onCopyImageUrl(draft)}
              disabled={!draft.imageUrl}
              variant="secondary"
              className="w-full sm:w-auto"
            >
              Copy link ảnh
            </Button>

            <Button onClick={() => onCopyComment(draft)} variant="secondary" className="w-full sm:w-auto">
              Copy comment link
            </Button>  

            <a
              href={draft.imageUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
            >
              Mở ảnh
            </a>

            <a
              href={draft.storyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-800"
            >
              Mở truyện
            </a>

            <Button onClick={() => onStatus(draft, 'posted')} variant="secondary" className="w-full sm:w-auto">
              Đã đăng
            </Button>
            <Button onClick={() => onStatus(draft, 'skipped')} variant="ghost" className="w-full sm:w-auto">
              Bỏ qua
            </Button>
            <Button onClick={() => onDelete(draft)} variant="danger" className="w-full sm:w-auto">
              Xóa
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function GroupPostFactory() {
  const [stories, setStories] = useState<GroupPostStory[]>([])
  const [selectedStoryId, setSelectedStoryId] = useState('')
  const [chapterMode, setChapterMode] = useState<ChapterMode>('chapter1')
  const [postLength, setPostLength] = useState<PostLength>('medium')
  const [drafts, setDrafts] = useState<GroupPostDraft[]>([])
  const [filter, setFilter] = useState<DraftFilter>('active')
  const [loadingStories, setLoadingStories] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState('')
  const [manualCopyText, setManualCopyText] = useState('')

  useEffect(() => {
    setDrafts(loadDrafts())
    void handleLoadStories()
  }, [])

  const selectedStory = useMemo(
    () => stories.find((story) => story.id === selectedStoryId) || null,
    [selectedStoryId, stories]
  )

  const filteredDrafts = useMemo(() => {
    if (filter === 'all') return drafts
    if (filter === 'active') {
      return drafts.filter((draft) => draft.status === 'draft' || draft.status === 'copied')
    }

    return drafts.filter((draft) => draft.status === filter)
  }, [drafts, filter])

  async function handleLoadStories() {
    setLoadingStories(true)
    setMessage('')

    try {
      const nextStories = await loadPublishedStories()
      setStories(nextStories)

      if (!selectedStoryId && nextStories[0]) {
        setSelectedStoryId(nextStories[0].id)
      }

      setMessage(`Đã load ${nextStories.length} truyện có thể tạo bài.`)
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setLoadingStories(false)
    }
  }

  function pickRandomStory() {
    if (!stories.length) return null
    const index = Math.floor(Math.random() * stories.length)
    return stories[index]
  }

  async function createDraftForStory(story: GroupPostStory) {
    const chapters = await loadStoryChapters(story.id)

    const validChapters = chapters.filter((chapter) => chapter.content.trim().length >= 800)

    if (!validChapters.length) {
      throw new Error(`Truyện "${story.title}" chưa có chương đủ dài để tạo bài.`)
    }

    const draft = createGroupPostDraft({
      story,
      chapters: validChapters,
      mode: chapterMode,
      length: postLength,
    })

    const nextDrafts = upsertDraft(draft)
    setDrafts(nextDrafts)

    return draft
  }

  async function handleCreateSelectedDraft() {
    if (!selectedStory) {
      setMessage('Chưa chọn truyện.')
      return
    }

    setGenerating(true)
    setMessage('')

    try {
      const draft = await createDraftForStory(selectedStory)
      setMessage(`Đã tạo bài nháp cho truyện: ${draft.storyTitle}`)
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setGenerating(false)
    }
  }

  async function handleCreateRandomDraft() {
    setGenerating(true)
    setMessage('')

    try {
      let lastError = ''
      const maxTry = Math.min(10, Math.max(stories.length, 1))

      for (let index = 0; index < maxTry; index += 1) {
        const story = pickRandomStory()

        if (!story) {
          setMessage('Chưa có truyện để random.')
          return
        }

        try {
          const draft = await createDraftForStory(story)
          setSelectedStoryId(story.id)
          setMessage(`Đã random và tạo bài: ${draft.storyTitle}`)
          return
        } catch (error) {
          lastError = getErrorMessage(error)
        }
      }

      setMessage(lastError || 'Không random được truyện phù hợp.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleCreateBatch(count: number) {
    if (!stories.length) {
      setMessage('Chưa có truyện để tạo batch.')
      return
    }

    setGenerating(true)
    setMessage('')

    try {
      let created = 0
      const usedStoryIds = new Set<string>()
      const shuffled = [...stories].sort(() => Math.random() - 0.5)

      for (const story of shuffled) {
        if (created >= count) break
        if (usedStoryIds.has(story.id)) continue

        try {
          await createDraftForStory(story)
          usedStoryIds.add(story.id)
          created += 1
        } catch {
          // Bỏ qua truyện không đủ điều kiện.
        }
      }

      setMessage(`Đã tạo ${created}/${count} bài nháp.`)
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopy(draft: GroupPostDraft, text: string, markCopied = false) {
    setManualCopyText('')

    const safe = markCopied ? limitFacebookPostText(text, FACEBOOK_POST_LIMIT) : { text, wasTrimmed: false, charCount: text.length }

    try {
      await copyText(safe.text)

      if (markCopied) {
        const nextDrafts = updateDraftStatus(draft.id, 'copied')
        setDrafts(nextDrafts)
      }

      setMessage(
        safe.wasTrimmed
          ? `Bài quá dài nên đã cắt còn ${safe.charCount.toLocaleString('vi-VN')} ký tự rồi mới copy.`
          : 'Đã copy.'
      )
    } catch (error) {
      setManualCopyText(safe.text)
      setMessage(`${getErrorMessage(error)} Tao đã hiện nội dung bên dưới để copy thủ công.`)
    }
  }

  function handleStatus(draft: GroupPostDraft, status: GroupPostDraft['status']) {
    const nextDrafts = updateDraftStatus(draft.id, status)
    setDrafts(nextDrafts)
    setMessage(`Đã chuyển "${draft.storyTitle}" sang trạng thái: ${getStatusLabel(status)}.`)
  }

  function handleDelete(draft: GroupPostDraft) {
    const ok = window.confirm(`Xóa bài nháp "${draft.storyTitle}"?`)
    if (!ok) return

    const nextDrafts = deleteDraft(draft.id)
    setDrafts(nextDrafts)
    setMessage('Đã xóa bài nháp.')
  }

  function handleNextDraft() {
    const next = drafts.find((draft) => draft.status === 'draft' || draft.status === 'copied')

    if (!next) {
      setMessage('Không còn bài chờ đăng.')
      return
    }

    const element = document.getElementById(next.id)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-5 shadow-xl shadow-black/30">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-400">
            Story Platform
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Group Post Factory
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Tool tạo bài Facebook group bán tự động. Không dùng Meta API, không auto đăng.
            Mày chỉ cần copy nội dung, mở ảnh/lưu ảnh rồi đăng bằng nick cá nhân.
          </p>
        </header>

        <section className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-4 shadow-xl shadow-black/20 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-zinc-300">Chọn truyện</span>
                  <select
                    value={selectedStoryId}
                    onChange={(event) => setSelectedStoryId(event.target.value)}
                    className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-red-400"
                  >
                    {stories.map((story) => (
                      <option key={story.id} value={story.id}>
                        {story.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-zinc-300">Nguồn chương</span>
                  <select
                    value={chapterMode}
                    onChange={(event) => setChapterMode(event.target.value as ChapterMode)}
                    className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-red-400"
                  >
                    <option value="chapter1">Chỉ chương 1</option>
                    <option value="chapter1_2">Chương 1 + 2</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-zinc-300">Độ dài bài</span>
                  <select
                    value={postLength}
                    onChange={(event) => setPostLength(event.target.value as PostLength)}
                    className="min-h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-red-400"
                  >
                    <option value="short">Ngắn</option>
                    <option value="medium">Vừa</option>
                    <option value="long">Dài</option>
                  </select>
                </label>
              </div>

              {selectedStory ? (
                <div className="flex gap-3 rounded-2xl border border-zinc-800 bg-black/30 p-3">
                  <img
                    src={selectedStory.coverImage || ''}
                    alt={selectedStory.title}
                    className="h-24 w-16 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-2 font-bold text-zinc-100">{selectedStory.title}</p>
                    <p className="mt-1 break-all text-xs text-zinc-500">/{selectedStory.slug}</p>
                    {selectedStory.description ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-400">
                        {selectedStory.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid content-start gap-2">
              <Button onClick={handleLoadStories} disabled={loadingStories} variant="secondary">
                {loadingStories ? 'Đang load...' : 'Load lại truyện'}
              </Button>
              <Button onClick={handleCreateSelectedDraft} disabled={generating || !selectedStory}>
                Tạo bài đã chọn
              </Button>
              <Button onClick={handleCreateRandomDraft} disabled={generating || !stories.length} variant="secondary">
                Random 1 bài
              </Button>
              <Button onClick={() => handleCreateBatch(5)} disabled={generating || !stories.length} variant="secondary">
                Tạo batch 5 bài
              </Button>
              <Button onClick={handleNextDraft} variant="ghost">
                Bài tiếp theo
              </Button>
            </div>
          </div>

          {message ? (
            <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 text-sm text-zinc-300">
              {message}
            </div>
          ) : null}

          {manualCopyText ? (
            <div className="mt-4 space-y-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-sm font-semibold text-amber-200">
                Copy tự động lỗi. Giữ tay/chọn toàn bộ nội dung dưới đây để copy thủ công:
              </p>
              <textarea
                readOnly
                value={manualCopyText}
                className="h-56 w-full rounded-xl border border-zinc-700 bg-black/60 p-3 text-sm leading-6 text-zinc-100"
              />
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 rounded-3xl border border-zinc-800 bg-zinc-950/90 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Danh sách bài nháp</h2>
              <p className="text-sm text-zinc-500">
                {filteredDrafts.length}/{drafts.length} bài đang hiển thị
              </p>
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as DraftFilter)}
              className="min-h-11 rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-red-400"
            >
              <option value="active">Chờ đăng</option>
              <option value="draft">Nháp</option>
              <option value="copied">Đã copy</option>
              <option value="posted">Đã đăng</option>
              <option value="skipped">Bỏ qua</option>
              <option value="all">Tất cả</option>
            </select>
          </div>

          {filteredDrafts.length ? (
            <div className="space-y-4">
              {filteredDrafts.map((draft) => (
                <div key={draft.id} id={draft.id} className="scroll-mt-4">
                  <DraftCard
                    draft={draft}
                    onCopy={(item) => handleCopy(item, item.caption, true)}
                    onCopyNoLink={(item) => handleCopy(item, item.captionNoLink, true)}
                    onCopyStoryUrl={(item) => handleCopy(item, item.storyUrl)}
                    onCopyImageUrl={(item) => handleCopy(item, item.imageUrl)}
                    onCopyComment={(item) =>
                        handleCopy(item, item.commentText || `Đọc tiếp tại đây nha:\n${item.storyUrl}`)
                    }
                    onStatus={handleStatus}
                    onDelete={handleDelete}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/70 p-8 text-center">
              <p className="font-semibold text-zinc-300">Chưa có bài nháp phù hợp bộ lọc.</p>
              <p className="mt-1 text-sm text-zinc-500">
                Bấm “Random 1 bài” hoặc “Tạo batch 5 bài” để bắt đầu.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}