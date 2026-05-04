import fs from 'node:fs'
import path from 'node:path'

const filePath = path.join(
  process.cwd(),
  'src',
  'components',
  'admin',
  'ai-factory',
  'AIFactoryPanel.tsx',
)

if (!fs.existsSync(filePath)) {
  console.error('Không tìm thấy file:', filePath)
  process.exit(1)
}

let code = fs.readFileSync(filePath, 'utf8')
const original = code
const backupPath = `${filePath}.bak-story-seed-v6-${Date.now()}`
fs.writeFileSync(backupPath, original)

function ok(message) {
  console.log(`OK: ${message}`)
}

function skip(message) {
  console.log(`Bỏ qua: ${message}`)
}

// 1) Đảm bảo insertStoryDraft params có storySeed
const insertStoryDraftMatch = code.match(/async function insertStoryDraft\(params: \{[\s\S]*?\n  \}\) \{/)

if (!insertStoryDraftMatch) {
  skip('không tìm thấy block insertStoryDraft params')
} else if (insertStoryDraftMatch[0].includes('storySeed?: FactoryStorySeed | null')) {
  skip('insertStoryDraft params đã có storySeed')
} else {
  const fixedBlock = insertStoryDraftMatch[0].replace(
    /(\n\s*nameSeed:\s*string)/,
    `$1
    storySeed?: FactoryStorySeed | null`,
  )

  code = code.replace(insertStoryDraftMatch[0], fixedBlock)
  ok('thêm storySeed vào params insertStoryDraft')
}

// 2) Xóa toàn bộ dòng story_dna bị chèn nhầm trước đó.
// Sau đó lát nữa chỉ chèn lại đúng trong activeAvoidLibrary.
const beforeRemove = code
code = code.replace(/\n\s*story_dna:\s*\{\s*factory_seed:\s*storySeed\s*\},/g, '')

if (code !== beforeRemove) {
  ok('xóa các dòng story_dna factory_seed bị chèn lệch')
} else {
  skip('không thấy dòng story_dna factory_seed chèn lệch')
}

// 3) Chèn lại story_dna đúng chỗ trong activeAvoidLibrary = buildAvoidLibrary([...])
const activeMarker = 'activeAvoidLibrary = buildAvoidLibrary(['
const activeIndex = code.indexOf(activeMarker)

if (activeIndex === -1) {
  skip('không tìm thấy activeAvoidLibrary = buildAvoidLibrary([')
} else {
  const searchFromActive = '              story_memory: storyMemory,\n              created_at: new Date().toISOString(),'
  const activeStoryMemoryIndex = code.indexOf(searchFromActive, activeIndex)

  if (activeStoryMemoryIndex === -1) {
    skip('không tìm thấy story_memory trong block activeAvoidLibrary')
  } else {
    const replacement =
      '              story_memory: storyMemory,\n' +
      '              story_dna: { factory_seed: storySeed },\n' +
      '              created_at: new Date().toISOString(),'

    code =
      code.slice(0, activeStoryMemoryIndex) +
      replacement +
      code.slice(activeStoryMemoryIndex + searchFromActive.length)

    ok('chèn story_dna factory_seed đúng vào activeAvoidLibrary')
  }
}

if (code === original) {
  console.log('Không có thay đổi nào.')
} else {
  fs.writeFileSync(filePath, code)
  console.log('Đã sửa xong:', filePath)
  console.log('Backup:', backupPath)
}
