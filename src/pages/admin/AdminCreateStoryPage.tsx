import MainLayout from '@/layouts/MainLayout'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import CreateStoryForm from '@/components/admin/CreateStoryForm'
import useAdminSession from '@/hooks/admin/useAdminSession'
import { supabase } from '@/lib/supabase'

type Category = {
  id: string
  name: string
  slug: string
  description?: string | null
}

export default function AdminCreateStoryPage() {
  const navigate = useNavigate()
  const { user, loading: sessionLoading } = useAdminSession()

  const [categories, setCategories] = useState<Category[]>([])
  const [newStory, setNewStory] = useState<any>({
    title: '',
    slug: '',
    author: '',
    description: '',
    status: 'ongoing',
  })

  const [newVisibility, setNewVisibility] = useState<'published' | 'draft'>('published')
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [storySlugEdited, setStorySlugEdited] = useState(false)
  const [createCategorySlug, setCreateCategorySlug] = useState('')

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

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug, description')
        .order('created_at', { ascending: false })

      if (error) throw error

      setCategories(data || [])
    } catch {
      setCategories([])
    }
  }

  useEffect(() => {
    if (sessionLoading) return

    void fetchCategories()
  }, [sessionLoading])

  async function handleCreateStory(event: any) {
    event.preventDefault()

    if (!newStory.title?.trim()) {
      alert('Title required')
      return
    }

    const slug = newStory.slug?.trim() || generateSlug(newStory.title)

    if (!slug) {
      alert('Slug required')
      return
    }

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
        title: newStory.title.trim(),
        slug,
        author: newStory.author?.trim() || null,
        description: newStory.description?.trim() || null,
        cover_image: coverUrl,
        genres: createCategorySlug ? [createCategorySlug] : [],
        status: newVisibility,
        owner_id: user?.id ?? null,
      }

      const { error } = await supabase.from('stories').insert([payload])

      if (error) throw error

      alert('Đã tạo truyện.')

      navigate('/admin/content')
    } catch (error: any) {
      alert('Create story failed: ' + String(error?.message ?? error))
    } finally {
      setUploadingCover(false)
    }
  }

  return (
    <MainLayout>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link to="/admin/content" className="text-sm text-amber-300">
            ← Quay lại Content
          </Link>

          <Link
            to="/admin"
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-100 hover:border-amber-300"
          >
            Admin Dashboard
          </Link>
        </div>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-zinc-100">Create Story</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Tạo truyện thủ công. Nếu dùng AI Writer thì nên tạo story draft từ AI Writer.
            </p>
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
        </section>
      </main>
    </MainLayout>
  )
}