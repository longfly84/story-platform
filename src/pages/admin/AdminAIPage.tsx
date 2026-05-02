import MainLayout from '@/layouts/MainLayout'
import { Link } from 'react-router-dom'
import AIGeneratePanel from '@/components/admin/AIGeneratePanel'
import StoryMemoryViewer from '@/components/admin/StoryMemoryViewer'

export default function AdminAIPage() {
  return (
    <MainLayout>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4">
          <Link to="/admin" className="text-sm text-amber-300">
            ← Quay lại Admin Dashboard
          </Link>
        </div>

        <AIGeneratePanel />

        <StoryMemoryViewer
          stories={[]}
          selectedMemorySlug={null}
          setSelectedMemorySlug={() => {}}
          memoryData={null}
          memoryCollapsed={{}}
          setMemoryCollapsed={() => {}}
          loadStoryMemory={async () => {}}
          saveStoryMemoryToDb={() => {}}
        />
      </main>
    </MainLayout>
  )
}