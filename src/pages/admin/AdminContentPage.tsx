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

export default function AdminContentPage() {
  const { user, role, loading: sessionLoading } = useAdminSession()
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedStoryForChapters] = useState<string | null>(null)
  // expandedChapters reserved for future detailed chapter UI (not used currently)

  async function fetchStories() {
    setLoading(true)
    try {
      let q = supabase.from('stories').select('*')
      if (role === 'staff' && user?.id) q = q.eq('owner_id', user.id)
      const res = await q.order('id', { ascending: true })
      if (res.error) throw res.error
      setStories(res.data ?? [])
      setError(null)
    } catch (e:any) { setError(String(e?.message ?? e)) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (!sessionLoading) void fetchStories() }, [sessionLoading, role, user])

  return (
    <MainLayout>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4"><Link to="/admin" className="text-sm text-amber-300">← Quay lại Admin Dashboard</Link></div>
        <StoriesSection
          stories={stories}
          categories={[]}
          loading={loading}
          error={error}
          imageErrors={{}}
          resolveCoverUrl={(v?: string | null) => resolveCoverUrl(v)}
          setImageErrors={()=>{}}
          onTogglePublish={()=>{}}
          onDeleteStory={()=>{}}
          onOpenChapters={()=>{}}
        />
        <CreateStoryForm newStory={{}} setNewStory={()=>{}} newVisibility={'published'} setNewVisibility={()=>{}} newCoverFile={null} setNewCoverFile={()=>{}} uploadingCover={false} storySlugEdited={false} setStorySlugEdited={()=>{}} createCategorySlug={''} setCreateCategorySlug={()=>{}} categories={[]} generateSlug={()=>''} onSubmit={async()=>{}} />
        <CategoryManager catName={''} catSlug={''} catDesc={''} selectedCategoryId={''} categories={[]} onCatNameChange={()=>{}} setCatSlug={()=>{}} setCatDesc={()=>{}} setSelectedCategoryId={()=>{}} createCategory={async()=>{}} deleteCategory={async()=>{}} clearForm={()=>{}} />
        <CreateChapterForm stories={stories} newChapter={{}} setNewChapter={()=>{}} chapterSlugEdited={false} setChapterSlugEdited={()=>{}} generateSlug={()=>''} onSubmit={async()=>{}} />
        <ManageChapters selectedStoryForChapters={selectedStoryForChapters} chapters={[]} editingChapterId={null} editChapterData={null} setEditingChapterId={()=>{}} setEditChapterData={()=>{}} startEditChapter={()=>{}} saveEditChapter={async()=>{}} deleteChapter={async()=>{}} onClose={()=>{}} />
        <div className="mt-6">
          <ManageComments />
        </div>
      </main>
    </MainLayout>
  )
}
