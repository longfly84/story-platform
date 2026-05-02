import MainLayout from '@/layouts/MainLayout'
import { Link } from 'react-router-dom'
import StoriesSection from '@/components/admin/StoriesSection'
import CreateStoryForm from '@/components/admin/CreateStoryForm'
import CategoryManager from '@/components/admin/CategoryManager'
import CreateChapterForm from '@/components/admin/CreateChapterForm'
import ManageChapters from '@/components/admin/ManageChapters'
import ManageComments from '@/components/admin/ManageComments'
import useAdminSession from '@/hooks/admin/useAdminSession'
import { useEffect, useState } from 'react'
import { supabase, resolveCoverUrl } from '@/lib/supabase'

type NewChapterState = {
  storySlug: string
  title: string
  slug: string
  content: string
  chapter_number: number
  summary: string
  cliffhanger: string
  important_events: string[]
  emotion_tags: string[]
}

export default function AdminContentPage() {
  const { user, role, loading: sessionLoading } = useAdminSession()

  const [stories, setStories] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const [expandedChapters, setExpandedChapters] = useState<Record<string, any[]>>({})
  const [selectedStoryForChapters, setSelectedStoryForChapters] = useState<string | null>(null)
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null)
  const [editChapterData, setEditChapterData] = useState<any>(null)

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
  const [storySlugEdited, setStorySlugEdited] = useState(false)
  const [createCategorySlug, setCreateCategorySlug] = useState('')

  const [newChapter, setNewChapter] = useState<NewChapterState>({
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

  const [chapterSlugEdited, setChapterSlugEdited] = useState(false)

  const [catName, setCatName] = useState('')
  const [catSlug, setCatSlug] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')

  function generateSlug(input: string) {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  async function fetchStories() {
    setLoading(true)

    try {
      let q = supabase.from('stories').select('*')

      if (role === 'staff' && user?.id) {
        q = q.eq('owner_id', user.id)
      }

      const res = await q.order('id', { ascending: true })

      if (res.error) throw res.error

      setStories(res.data ?? [])
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
    } catch {
      setCategories([])
    }
  }

  useEffect(() => {
    if (sessionLoading) return

    void fetchStories()
    void fetchCategories()
  }, [sessionLoading, role, user])

  function onCatNameChange(value: string) {
    setCatName(value)

    if (!catSlug) {
      setCatSlug(generateSlug(value))
    }
  }

  async function createCategory() {
    if (!catName.trim()) {
      alert('Name required')
      return
    }

    const slugToUse = catSlug.trim() || generateSlug(catName)

    try {
      const { data: exist, error: existError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slugToUse)
        .limit(1)

      if (existError) throw existError

      if (exist && exist.length > 0) {
        alert('Thể loại này đã tồn tại.')
        return
      }

      const { error } = await supabase.from('categories').insert([
        {
          name: catName.trim(),
          slug: slugToUse,
          description: catDesc.trim() || null,
        },
      ])

      if (error) throw error

      setCatName('')
      setCatSlug('')
      setCatDesc('')
      setSelectedCategoryId('')
      await fetchCategories()
    } catch (e: any) {
      alert('Create category failed: ' + String(e?.message ?? e))
    }
  }

  async function deleteCategory(id: string, slug: string) {
    const used = stories.some((story) => {
      return Array.isArray(story.genres) && story.genres.includes(slug)
    })

    if (used) {
      alert('Không thể xóa: có truyện đang sử dụng thể loại này.')
      return
    }

    const ok = window.confirm('Xóa thể loại này?')
    if (!ok) return

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)

      if (error) throw error

      await fetchCategories()
    } catch (e: any) {
      alert('Delete category failed: ' + String(e?.message ?? e))
    }
  }

  async function handleCreateStory(event: any) {
    event.preventDefault()

    try {
      let coverUrl: string | null = newStory.cover_image ?? null

      if (newCoverFile) {
        setUploadingCover(true)

        try {
          const safeFileName = newCoverFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')
          const filePath = `${Date.now()}-${safeFileName}`

          const { error: uploadError } = await supabase.storage
            .from('covers')
            .upload(filePath, newCoverFile)

          if (uploadError) throw uploadError

          const publicRes = supabase.storage.from('covers').getPublicUrl(filePath)
          coverUrl = publicRes.data.publicUrl
        } finally {
          setUploadingCover(false)
        }
      }

      const payload: any = {
        ...newStory,
        cover_image: coverUrl,
        genres: createCategorySlug ? [createCategorySlug] : [],
        visibility: newVisibility,
        status: newVisibility,
        owner_id: user?.id ?? null,
      }

      const { error } = await supabase.from('stories').insert([payload])

      if (error) throw error

      alert('Đã tạo truyện.')

      setNewStory({
        title: '',
        slug: '',
        description: '',
        author: '',
        status: 'ongoing',
      })
      setNewVisibility('published')
      setNewCoverFile(null)
      setStorySlugEdited(false)
      setCreateCategorySlug('')

      await fetchStories()
    } catch (e: any) {
      alert('Create story failed: ' + String(e?.message ?? e))
    } finally {
      setUploadingCover(false)
    }
  }

  async function handleCreateChapter(event: any) {
    event.preventDefault()

    const story = stories.find((item) => item.slug === newChapter.storySlug)

    if (!story?.id) {
      alert('Chọn truyện trước khi tạo chương.')
      return
    }

    if (!newChapter.title.trim() || !newChapter.content.trim()) {
      alert('Title và content là bắt buộc.')
      return
    }

    try {
      const payload: any = {
        story_id: story.id,
        title: newChapter.title.trim(),
        slug: newChapter.slug.trim() || generateSlug(newChapter.title),
        content: newChapter.content,
        summary: newChapter.summary || null,
        cliffhanger: newChapter.cliffhanger || null,
        important_events: newChapter.important_events || [],
        emotion_tags: newChapter.emotion_tags || [],
        status: 'published',
      }

      const { error } = await supabase.from('chapters').insert([payload])

      if (error) {
        const msg = String(error.message || error)

        if (msg.toLowerCase().includes('status')) {
          const fallbackPayload = { ...payload }
          delete fallbackPayload.status

          const fallback = await supabase.from('chapters').insert([fallbackPayload])
          if (fallback.error) throw fallback.error
        } else {
          throw error
        }
      }

      alert('Đã tạo chương.')

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

      await openManageChapters(story.slug)
    } catch (e: any) {
      alert('Create chapter failed: ' + String(e?.message ?? e))
    }
  }

  async function togglePublish(story: any) {
    try {
      const nextStatus = story?.status === 'draft' ? 'published' : 'draft'

      const { error } = await supabase
        .from('stories')
        .update({ status: nextStatus })
        .eq('id', story.id)

      if (error) throw error

      await fetchStories()
    } catch (e: any) {
      alert('Toggle publish failed: ' + String(e?.message ?? e))
    }
  }

  async function deleteStory(id: number) {
    const ok = window.confirm('Xóa truyện này?')
    if (!ok) return

    try {
      const { error } = await supabase.from('stories').delete().eq('id', id)

      if (error) throw error

      await fetchStories()
      alert('Đã xóa truyện.')
    } catch (e: any) {
      alert('Delete failed: ' + String(e?.message ?? e))
    }
  }

  async function openManageChapters(slug: string) {
    try {
      const story = stories.find((item) => item.slug === slug)

      if (!story?.id) {
        alert('Không tìm thấy ID truyện để load chương.')
        return
      }

      setSelectedStoryForChapters(slug)

      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('story_id', story.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      setExpandedChapters((prev) => ({
        ...prev,
        [slug]: data ?? [],
      }))

      setTimeout(() => {
        const el = document.getElementById('manage-chapters')

        if (el) {
          el.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        } else {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
          })
        }
      }, 120)

      if (!data || data.length === 0) {
        alert('Truyện này chưa có chương nào.')
      }
    } catch (e: any) {
      alert('Load chapters failed: ' + String(e?.message ?? e))
    }
  }

  function startEditChapter(chapter: any) {
    setEditingChapterId(chapter.id)
    setEditChapterData({ ...chapter })
  }

  async function saveEditChapter(event: any) {
    event.preventDefault()

    if (!editingChapterId || !editChapterData) {
      return
    }

    try {
      const payload = {
        title: editChapterData.title,
        slug: editChapterData.slug,
        content: editChapterData.content,
        summary: editChapterData.summary,
        cliffhanger: editChapterData.cliffhanger,
        important_events: editChapterData.important_events,
        emotion_tags: editChapterData.emotion_tags,
      }

      const { error } = await supabase
        .from('chapters')
        .update(payload)
        .eq('id', editingChapterId)

      if (error) throw error

      if (selectedStoryForChapters) {
        await openManageChapters(selectedStoryForChapters)
      }

      setEditingChapterId(null)
      setEditChapterData(null)
      alert('Đã cập nhật chương.')
    } catch (e: any) {
      alert('Update chapter failed: ' + String(e?.message ?? e))
    }
  }

  async function deleteChapter(id: number, storySlug?: string) {
    const ok = window.confirm('Xóa chương này?')
    if (!ok) return

    try {
      const { error } = await supabase.from('chapters').delete().eq('id', id)

      if (error) throw error

      if (storySlug || selectedStoryForChapters) {
        await openManageChapters(storySlug || selectedStoryForChapters!)
      }

      alert('Đã xóa chương.')
    } catch (e: any) {
      alert('Delete chapter failed: ' + String(e?.message ?? e))
    }
  }

  return (
    <MainLayout>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4">
          <Link to="/admin" className="text-sm text-amber-300">
            ← Quay lại Admin Dashboard
          </Link>
        </div>

        <StoriesSection
          stories={stories}
          categories={categories}
          loading={loading}
          error={error}
          imageErrors={imageErrors}
          resolveCoverUrl={(v?: string | null) => resolveCoverUrl(v)}
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
            setSelectedCategoryId('')
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

        <div className="mt-6">
          <ManageComments />
        </div>
      </main>
    </MainLayout>
  )
}