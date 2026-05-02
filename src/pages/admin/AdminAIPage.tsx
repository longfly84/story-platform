import MainLayout from '@/layouts/MainLayout'
import { Link } from 'react-router-dom'
import AIGeneratePanel from '@/components/admin/AIGeneratePanel'
import StoryMemoryViewer from '@/components/admin/StoryMemoryViewer'

export default function AdminAIPage() {
  return (
    <MainLayout>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4"><Link to="/admin" className="text-sm text-amber-300">← Quay lại Admin Dashboard</Link></div>
        <AIGeneratePanel stories={[]} aiStorySlug={''} setAiStorySlug={()=>{}} aiPrompt={''} setAiPrompt={()=>{}} aiGenreId={''} setAiGenreId={()=>{}} aiMainStyle={''} setAiMainStyle={()=>{}} mainCharacterStyles={[]} aiLength={''} setAiLength={()=>{}} aiProvider={'mock'} setAiProvider={()=>{}} aiHumiliation={3} setAiHumiliation={()=>{}} aiRevenge={3} setAiRevenge={()=>{}} aiCliffhanger={''} setAiCliffhanger={()=>{}} cliffhangerTypes={[]} coverStyle={''} setCoverStyle={()=>{}} coverColor={''} setCoverColor={()=>{}} coverVibe={''} setCoverVibe={()=>{}} aiLoading={false} aiResult={''} setAiResult={()=>{}} aiTitle={''} aiDnaSummary={''} aiProviderUsed={''} aiMeta={null} coverPrompt={''} onGenerate={async()=>{}} onInsertChapter={()=>{}} onSaveDraft={async()=>{}} />
        <StoryMemoryViewer stories={[]} selectedMemorySlug={null} setSelectedMemorySlug={()=>{}} memoryData={null} memoryCollapsed={{}} setMemoryCollapsed={()=>{}} loadStoryMemory={async()=>{}} saveStoryMemoryToDb={()=>{}} />
      </main>
    </MainLayout>
  )
}
