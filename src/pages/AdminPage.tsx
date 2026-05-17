import { useEffect, useState } from 'react'
import MainLayout from '@/layouts/MainLayout'
import { supabase, signOut, resolveCoverUrl } from '@/lib/supabase'
import useAdminSession from '@/hooks/admin/useAdminSession'
import AdminTopBar from '@/components/admin/AdminTopBar'
import StoriesSection from '@/components/admin/StoriesSection'
import AdminAnalyticsPanel from '@/components/admin/analytics/AdminAnalyticsPanel'
import CreateStoryForm from '@/components/admin/CreateStoryForm'
import CategoryManager from '@/components/admin/CategoryManager'
import CreateChapterForm from '@/components/admin/CreateChapterForm'
import ManageChapters from '@/components/admin/ManageChapters'
import AdminAdsManager from '@/components/admin/ads/AdminAdsManager'
import AIGeneratePanel from '@/components/admin/AIGeneratePanel'
import StoryMemoryViewer from '@/components/admin/StoryMemoryViewer'

export default function AdminPage() {
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [expandedChapters, setExpandedChapters] = useState<Record<string, any[]>>({})
  const [editingChapterId, setEditingChapterId] = useState<any | null>(null)
  const [editChapterData, setEditChapterData] = useState<any>(null)
  const [selectedStoryForChapters, setSelectedStoryForChapters] = useState<string | null>(null)

  const [newStory, setNewStory] = useState<any>({
    title: '',
    slug: '',
    description: '',
    author: '',
    status: 'ongoing',
  })
  const [newVisibility, setNewVisibility] = useState<'published' | 'draft'>('published')
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)

  const [newChapter, setNewChapter] = useState({
    storySlug: '',
    title: '',
    slug: '',
    content: '',
    chapter_number: 1,
    summary: '',
    cliffhanger: '',
    important_events: [] as string[],
    emotion_tags: [] as string[],
  })

  const [storySlugEdited, setStorySlugEdited] = useState(false)
  const [chapterSlugEdited, setChapterSlugEdited] = useState(false)

  const [selectedMemorySlug, setSelectedMemorySlug] = useState<string | null>(null)
  const [memoryData, setMemoryData] = useState<any>(null)
  const [memoryCollapsed, setMemoryCollapsed] = useState<Record<string, boolean>>({
    active_conflicts: true,
    pending_payoffs: true,
    known_secrets: true,
    relationships: true,
    unresolved_humiliations: true,
    emotion_tags: true,
    current_arc: true,
  })

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [categories, setCategories] = useState<any[]>([])
  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [createCategorySlug, setCreateCategorySlug] = useState<string>('')

  const { user, role, loading: sessionLoading } = useAdminSession()

  function generateSlug(input: string) {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }

  function getChapterNumberFromTitle(title: any) {
    const match = String(title ?? '').match(/Chương\s+(\d+)/i)
    const value = match ? Number(match[1]) : 0
    return Number.isFinite(value) && value > 0 ? value : 0
  }

  async function fetchStories() {
    setLoading(true)

    try {
      let q = supabase.from('stories').select('*')

      if (role === 'staff' && user?.id) {
        q = q.eq('owner_id', user.id)
      }

      const storiesRes = await q.order('created_at', { ascending: false })
      if (storiesRes.error) throw storiesRes.error

      const rawStories = storiesRes.data ?? []
      const storyIds = rawStories
        .map((story: any) => story?.id)
        .filter((id: any) => id !== null && id !== undefined)
        .map((id: any) => String(id))

      const chapterStatsByStoryId = new Map<string, { count: number; latest: number | null }>()

      if (storyIds.length > 0) {
        // First try the SECURITY DEFINER RPC. This is important when RLS hides draft chapters
        // from the browser client, while SQL Editor still shows them.
        const rpcRes = await supabase.rpc('get_admin_story_chapter_stats', {
          story_ids: storyIds,
        })

        if (!rpcRes.error && Array.isArray(rpcRes.data)) {
          for (const row of rpcRes.data) {
            const storyId = row?.story_id ? String(row.story_id) : ''
            if (!storyId) continue

            const count = Number(row?.chapter_count ?? 0)
            const latestRaw = Number(row?.latest_chapter_number ?? 0)

            chapterStatsByStoryId.set(storyId, {
              count: Number.isFinite(count) && count > 0 ? count : 0,
              latest: Number.isFinite(latestRaw) && latestRaw > 0 ? latestRaw : null,
            })
          }
        } else {
          // Fallback for local/dev databases that do not have the RPC yet.
          const { data: chapterRows, error: chapterError } = await supabase
            .from('chapters')
            .select('id, story_id, title, chapter_number, created_at')
            .in('story_id', storyIds)

          if (chapterError) throw chapterError

          for (const chapter of chapterRows ?? []) {
            const storyId = chapter?.story_id ? String(chapter.story_id) : ''
            if (!storyId) continue

            const oldStats = chapterStatsByStoryId.get(storyId) ?? { count: 0, latest: null }
            const directChapterNumber = Number(chapter?.chapter_number ?? 0)
            const parsedChapterNumber = getChapterNumberFromTitle(chapter?.title)
            const chapterNumber =
              Number.isFinite(directChapterNumber) && directChapterNumber > 0
                ? directChapterNumber
                : parsedChapterNumber

            chapterStatsByStoryId.set(storyId, {
              count: oldStats.count + 1,
              latest:
                chapterNumber > 0
                  ? Math.max(oldStats.latest ?? 0, chapterNumber)
                  : oldStats.latest,
            })
          }
        }
      }

      const storiesWithChapterStats = rawStories.map((story: any) => {
        const stats = chapterStatsByStoryId.get(String(story.id)) ?? { count: 0, latest: null }
        const explicitTotal = Number(
          story?.total_chapters ?? story?.target_chapters ?? story?.planned_chapters ?? 0
        )
        const hasExplicitCompletion =
          story?.completion_status !== undefined ||
          story?.story_status !== undefined ||
          story?.progress_status !== undefined ||
          story?.is_completed !== undefined ||
          story?.completed !== undefined

        return {
          ...story,
          _chapter_count: stats.count,
          chapter_count: stats.count,
          chapters_count: stats.count,
          chapterCount: stats.count,
          chaptersCount: stats.count,
          _latest_chapter_number: stats.latest,
          latest_chapter_number: stats.latest,
          latestChapterNumber: stats.latest,
          _admin_has_chapters: stats.count > 0,
          _admin_is_full:
            hasExplicitCompletion
              ? undefined
              : stats.count > 0 && (!explicitTotal || stats.count >= explicitTotal),
        }
      })

      setStories(storiesWithChapterStats)
      setError(null)
    } catch (e: any) {
      setError(String(e?.message ?? e))
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCategories(data || [])
    } catch (e) {
      if (import.meta.env.DEV) console.debug('categories missing or failed to load', e)
      setCategories([])
    }
  }

  useEffect(() => {
    if (sessionLoading) return

    ;(async () => {
      await fetchStories()
      await fetchCategories()
    })()
  }, [sessionLoading, role, user])

  useEffect(() => {
    if (!sessionLoading && !user) {
      window.location.href = '/login'
    }
  }, [sessionLoading, user])

  function onCatNameChange(v: string) {
    setCatName(v)
    if (!catSlug) setCatSlug(generateSlug(v))
  }

  async function createCategory() {
    if (!catName.trim()) {
      alert('Name required')
      return
    }

    const slugToUse = catSlug || generateSlug(catName)

    try {
      const { data: exist } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slugToUse)
        .limit(1)

      if (exist && exist.length) {
        alert('Thể loại này đã tồn tại.')
        return
      }

      const payload = {
        name: catName.trim(),
        slug: slugToUse,
        description: catDesc || null,
      }

      const { error } = await supabase.from('categories').insert([payload])
      if (error) throw error

      setCatName('')
      setCatSlug('')
      setCatDesc('')
      await fetchCategories()
    } catch (e: any) {
      const msg = String(e?.message ?? e)

      if (msg.toLowerCase().includes('duplicate') || e?.code === '23505') {
        alert('Thể loại này đã tồn tại.')
      } else {
        alert('Create category failed: ' + msg + '\nRun scripts/create_categories.sql if table missing.')
      }
    }
  }

  async function deleteCategory(id: string, slug: string) {
    try {
      const used = stories.some((story) => Array.isArray(story.genres) && story.genres.includes(slug))

      if (used) {
        alert('Không thể xóa: có truyện đang sử dụng thể loại này.')
        return
      }

      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error

      await fetchCategories()
    } catch (e: any) {
      alert('Delete category failed: ' + String(e?.message ?? e))
    }
  }

  async function handleCreateStory(e: any) {
    e.preventDefault()

    try {
      let coverUrl: string | null = (newStory as any).cover_image ?? null

      if (newCoverFile) {
        setUploadingCover(true)
        const filePath = `${Date.now()}-${newCoverFile.name}`

        if (import.meta.env.DEV) {
          console.log('[cover-submit]', {
            hasFile: !!newCoverFile,
            fileName: newCoverFile?.name,
            fileSize: newCoverFile?.size,
          })
        }

        try {
          const { error: uploadError } = await supabase.storage
            .from('covers')
            .upload(filePath, newCoverFile as File)

          if (uploadError) {
            console.error('[cover-upload] uploadError', uploadError)
            alert('Cover upload failed: ' + String(uploadError?.message ?? uploadError))
          } else {
            const publicRes = supabase.storage.from('covers').getPublicUrl(filePath)
            const publicUrl = (publicRes as any)?.data?.publicUrl || null

            if (import.meta.env.DEV) {
              console.log('[cover-upload]', { filePath, uploadError, publicUrl })
            }

            coverUrl = publicUrl
          }
        } finally {
          setUploadingCover(false)
        }
      }

      const payload: any = { ...newStory }
      payload.cover_image = coverUrl ?? null
      payload.genres = createCategorySlug ? [createCategorySlug] : []
      payload.status = newVisibility === 'draft' ? 'draft' : 'published'
      payload.owner_id = user?.id ?? null

      if (import.meta.env.DEV) console.log('[story-insert-payload]', payload)

      const res = await supabase.from('stories').insert([payload])
      if (res.error) throw res.error

      alert('Created')
      setNewStory({ title: '', slug: '', description: '', author: '', status: 'ongoing' })
      setNewVisibility('published')
      setNewCoverFile(null)
      setCreateCategorySlug('')
      setStorySlugEdited(false)
      await fetchStories()
    } catch (err: any) {
      alert('Error: ' + String(err?.message ?? err))
    }
  }

  async function handleCreateChapter(e: any) {
    e.preventDefault()

    try {
      const story = stories.find((s) => s.slug === newChapter.storySlug)

      const payload: any = {
        title: newChapter.title,
        slug: newChapter.slug,
        content: newChapter.content,
        chapter_number: Number(newChapter.chapter_number) || 1,
        status: 'published',
      }

      if (story?.id) payload.story_id = story.id
      if (newChapter.summary) payload.summary = newChapter.summary
      if (newChapter.cliffhanger) payload.cliffhanger = newChapter.cliffhanger
      if (newChapter.important_events) payload.important_events = newChapter.important_events
      if (newChapter.emotion_tags) payload.emotion_tags = newChapter.emotion_tags

      const res = await supabase.from('chapters').insert([payload])
      if (res.error) throw res.error

      alert('Chapter created')
      setNewChapter({
        storySlug: '',
        title: '',
        slug: '',
        content: '',
        chapter_number: 1,
        summary: '',
        cliffhanger: '',
        important_events: [],
        emotion_tags: [],
      })
      setChapterSlugEdited(false)

      if (story?.slug) await openManageChapters(story.slug)
      await fetchStories()
    } catch (err: any) {
      alert('Error: ' + String(err?.message ?? err))
    }
  }

  
  async function deleteStory(storyOrId: any) {
    const story =
      typeof storyOrId === 'object'
        ? storyOrId
        : stories.find((item) => String(item.id) === String(storyOrId))

    if (!story) {
      alert('Không tìm thấy truyện để xử lý.')
      return
    }

    const choice = window.prompt(
      [
        `Bạn muốn làm gì với truyện: ${story.title}?`,
        '',
        'Nhập 1 để XÓA CẢ TRUYỆN.',
        'Nhập 2 để MỞ DANH SÁCH CHƯƠNG và xóa/sửa từng chương.',
        '',
        'Nhập số 1 hoặc 2:',
      ].join('\n')
    )

    if (choice === null) return

    const normalized = choice.trim()

    if (normalized === '2') {
      await openManageChapters(story.slug)
      return
    }

    if (normalized !== '1') {
      alert('Lựa chọn không hợp lệ. Nhập 1 hoặc 2.')
      return
    }

    const confirmDelete = window.confirm(
      `Xóa cả truyện "${story.title}"?\n\nLưu ý: thao tác này chỉ xóa story. Nếu muốn xóa chương trước, hãy chọn 2.`
    )

    if (!confirmDelete) return

    try {
      const res = await supabase.from('stories').delete().eq('id', story.id)
      if (res.error) throw res.error

      await fetchStories()
      alert('Đã xóa truyện.')
    } catch (err: any) {
      alert('Delete failed: ' + String(err?.message ?? err))
    }
  }
  

  async function togglePublish(story: any) {
    try {
      const nextStatus = story?.status === 'draft' ? 'published' : 'draft'
      const { error } = await supabase.from('stories').update({ status: nextStatus }).eq('id', story.id)
      if (error) throw error
      await fetchStories()
    } catch (e) {
      alert('Toggle failed: ' + String(e))
    }
  }

  function startEditChapter(chap: any) {
    setEditingChapterId(chap.id)
    setEditChapterData({ ...chap })
  }

  async function saveEditChapter(e: any) {
    e.preventDefault()

    if (!editingChapterId || !editChapterData) return

    try {
      const payload = {
        title: editChapterData.title,
        slug: editChapterData.slug,
        content: editChapterData.content,
        chapter_number: Number(editChapterData.chapter_number) || undefined,
        summary: editChapterData.summary,
        cliffhanger: editChapterData.cliffhanger,
        important_events: editChapterData.important_events,
        emotion_tags: editChapterData.emotion_tags,
      }

      const res = await supabase.from('chapters').update(payload).eq('id', editingChapterId)
      if (res.error) throw res.error

      if (selectedStoryForChapters) await openManageChapters(selectedStoryForChapters)
      await fetchStories()

      setEditingChapterId(null)
      setEditChapterData(null)
    } catch (err: any) {
      alert('Update chapter failed: ' + String(err?.message ?? err))
    }
  }

  async function deleteChapter(id: any, storySlug?: string) {
    if (!confirm('Xác nhận xoá chương?')) return

    try {
      const res = await supabase.from('chapters').delete().eq('id', id)
      if (res.error) throw res.error
      if (storySlug) await openManageChapters(storySlug)
      await fetchStories()
    } catch (err: any) {
      alert('Delete chapter failed: ' + String(err?.message ?? err))
    }
  }

  async function openManageChapters(slug: string) {
    try {
      setSelectedStoryForChapters(slug)

      const sid = stories.find((s) => s.slug === slug)?.id

      if (!sid) {
        throw new Error('Không tìm thấy story_id cho truyện này.')
      }

      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('story_id', sid)
        .order('chapter_number', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true })
      if (error) throw error

      setExpandedChapters((m) => ({ ...m, [slug]: data ?? [] }))

      setTimeout(() => {
        document.getElementById('manage-chapters')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 120)
    } catch (e: any) {
      alert('Load chapters failed: ' + String(e?.message ?? e))
    }
  }

  async function loadStoryMemory(slug: string) {
    if (!slug) return

    try {
      const { data, error } = await supabase
        .from('stories')
        .select('story_dna, story_memory, current_arc, emotion_tags, cover_prompt, cover_style')
        .eq('slug', slug)
        .single()

      if (error) throw error

      setMemoryData(data)
      setSelectedMemorySlug(slug)
    } catch (err: any) {
      alert('Load memory failed: ' + String(err?.message ?? err))
    }
  }

  async function saveStoryMemoryToDb(slug?: string, memory?: any) {
    const target = slug || (newStory as any).slug || selectedMemorySlug

    if (!target) {
      alert('Chọn truyện để lưu memory')
      return
    }

    try {
      const payload: any = {}
      const source = memory ?? (newStory as any)

      if (source.story_dna) payload.story_dna = source.story_dna
      if (source.story_memory) payload.story_memory = source.story_memory
      if (source.cover_prompt) payload.cover_prompt = source.cover_prompt
      if (source.cover_style) payload.cover_style = source.cover_style
      if (source.emotion_tags) payload.emotion_tags = source.emotion_tags
      if (source.current_arc) payload.current_arc = source.current_arc

      const res = await supabase.from('stories').update(payload).eq('slug', target)
      if (res.error) throw res.error

      alert('Story memory saved')
      await fetchStories()
    } catch (err: any) {
      alert('Save memory failed: ' + String(err?.message ?? err))
    }
  }

  return (
    <MainLayout>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <AdminTopBar
          checkingSession={sessionLoading}
          role={role ?? undefined}
          onLogout={async () => {
            try {
              await signOut()
            } catch {}
            window.location.href = '/login'
          }}
        />

        <AdminAnalyticsPanel />

        <StoriesSection
          stories={stories}
          categories={categories}
          loading={loading}
          error={error}
          imageErrors={imageErrors}
          resolveCoverUrl={resolveCoverUrl}
          setImageErrors={setImageErrors}
          onTogglePublish={togglePublish}
          onDeleteStory={deleteStory}
          onOpenChapters={openManageChapters}
        />

        <div id="manage-chapters">
          <ManageChapters
            selectedStoryForChapters={selectedStoryForChapters}
            chapters={selectedStoryForChapters ? expandedChapters[selectedStoryForChapters] ?? [] : []}
            editingChapterId={editingChapterId}
            editChapterData={editChapterData}
            setEditingChapterId={setEditingChapterId}
            setEditChapterData={setEditChapterData}
            startEditChapter={startEditChapter}
            saveEditChapter={saveEditChapter}
            deleteChapter={deleteChapter}
            onClose={() => setSelectedStoryForChapters(null)}
          />
        </div>

        <CreateStoryForm
          newStory={newStory}
          setNewStory={setNewStory}
          newVisibility={newVisibility}
          setNewVisibility={setNewVisibility}
          newCoverFile={newCoverFile}
          setNewCoverFile={setNewCoverFile}
          uploadingCover={uploadingCover}
          storySlugEdited={storySlugEdited}
          setStorySlugEdited={setStorySlugEdited}
          createCategorySlug={createCategorySlug}
          setCreateCategorySlug={setCreateCategorySlug}
          categories={categories}
          generateSlug={generateSlug}
          onSubmit={handleCreateStory}
        />

        <CategoryManager
          catName={catName}
          catSlug={catSlug}
          catDesc={catDesc}
          selectedCategoryId={selectedCategoryId}
          categories={categories}
          onCatNameChange={onCatNameChange}
          setCatSlug={setCatSlug}
          setCatDesc={setCatDesc}
          setSelectedCategoryId={setSelectedCategoryId}
          createCategory={createCategory}
          deleteCategory={deleteCategory}
          clearForm={() => {
            setCatName('')
            setCatSlug('')
            setCatDesc('')
          }}
        />

        <CreateChapterForm
          stories={stories}
          newChapter={newChapter}
          setNewChapter={setNewChapter}
          chapterSlugEdited={chapterSlugEdited}
          setChapterSlugEdited={setChapterSlugEdited}
          generateSlug={generateSlug}
          onSubmit={handleCreateChapter}
        />

        <AdminAdsManager />

        <AIGeneratePanel />

        <StoryMemoryViewer
          stories={stories}
          selectedMemorySlug={selectedMemorySlug}
          setSelectedMemorySlug={setSelectedMemorySlug}
          memoryData={memoryData}
          memoryCollapsed={memoryCollapsed}
          setMemoryCollapsed={setMemoryCollapsed}
          loadStoryMemory={loadStoryMemory}
          saveStoryMemoryToDb={() => saveStoryMemoryToDb()}
        />
      </main>
    </MainLayout>
  )
}