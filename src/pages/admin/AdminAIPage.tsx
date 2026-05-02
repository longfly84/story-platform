import MainLayout from '@/layouts/MainLayout'
import { Link } from 'react-router-dom'
import AIGeneratePanel from '@/components/admin/AIGeneratePanel'
import StoryMemoryViewer from '@/components/admin/StoryMemoryViewer'
import { useState } from 'react'

export default function AdminAIPage() {
  const [selectedMemorySlug, setSelectedMemorySlug] = useState<string | null>(null)
  const [memoryData, setMemoryData] = useState<any>(null)
  const [memoryCollapsed, setMemoryCollapsed] = useState<Record<string, boolean>>({})

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
          selectedMemorySlug={selectedMemorySlug}
          setSelectedMemorySlug={setSelectedMemorySlug}
          memoryData={memoryData}
          memoryCollapsed={memoryCollapsed}
          setMemoryCollapsed={setMemoryCollapsed}
          loadStoryMemory={async () => {
            setMemoryData(null)
          }}
          saveStoryMemoryToDb={() => {}}
        />
      </main>
    </MainLayout>
  )
}