import MainLayout from '@/layouts/MainLayout'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import CategoryManager from '@/components/admin/CategoryManager'
import { supabase } from '@/lib/supabase'

type Category = {
  id: string
  name: string
  slug: string
  description?: string | null
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [stories, setStories] = useState<any[]>([])
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

  function onCatNameChange(value: string) {
    setCatName(value)

    if (!catSlug) {
      setCatSlug(generateSlug(value))
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

  async function fetchStories() {
    try {
      const { data, error } = await supabase.from('stories').select('*')

      if (error) throw error

      setStories(data || [])
    } catch {
      setStories([])
    }
  }

  useEffect(() => {
    void fetchCategories()
    void fetchStories()
  }, [])

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
    } catch (error: any) {
      alert('Create category failed: ' + String(error?.message ?? error))
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
    } catch (error: any) {
      alert('Delete category failed: ' + String(error?.message ?? error))
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
      </main>
    </MainLayout>
  )
}