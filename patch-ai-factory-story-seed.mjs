import fs from 'node:fs'
import path from 'node:path'

const filePath = path.join(process.cwd(), 'src', 'components', 'admin', 'ai-factory', 'AIFactoryPanel.tsx')

if (!fs.existsSync(filePath)) {
  console.error('Không tìm thấy file:', filePath)
  console.error('Hãy chạy script này ở thư mục gốc project, ví dụ: D:\\MyCode\\story-platform')
  process.exit(1)
}

let code = fs.readFileSync(filePath, 'utf8')
const original = code
const backupPath = `${filePath}.bak-story-seed-${Date.now()}`
fs.writeFileSync(backupPath, original)

function replaceOnce(search, replacement, label) {
  if (!code.includes(search)) {
    console.warn(`Bỏ qua: không tìm thấy đoạn ${label}`)
    return false
  }

  code = code.replace(search, replacement)
  console.log(`OK: ${label}`)
  return true
}

// 1. Type import: FactoryStorySeed
if (!code.includes('FactoryStorySeed,')) {
  replaceOnce(
    '  FactoryStatus,\n  ParsedChapterOutput,',
    '  FactoryStatus,\n  FactoryStorySeed,\n  ParsedChapterOutput,',
    'thêm FactoryStorySeed vào type import',
  )
}

// 2. Utils import: buildMockStorySeed
if (!code.includes('buildMockStorySeed,')) {
  replaceOnce(
    '  buildMockChapterOutput,\n  clampNumber,',
    '  buildMockChapterOutput,\n  buildMockStorySeed,\n  clampNumber,',
    'thêm buildMockStorySeed vào utils import',
  )
}

// 3. generateChapter params: storySeed
if (!code.includes('storySeed?: FactoryStorySeed | null')) {
  replaceOnce(
    '    factoryPromptIdea: string\n    runShortId: string\n  }) {',
    '    factoryPromptIdea: string\n    runShortId: string\n    storySeed?: FactoryStorySeed | null\n  }) {',
    'thêm storySeed vào params generateChapter',
  )
}

// 4. payload add storySeed
if (!code.includes('storySeed: params.storySeed ?? null,')) {
  replaceOnce(
    '      isFinalChapter: Boolean(params.isFinalChapter),\n      recentChapters: params.recentChapters,',
    '      isFinalChapter: Boolean(params.isFinalChapter),\n      storySeed: params.storySeed ?? null,\n      recentChapters: params.recentChapters,',
    'thêm storySeed vào payload API generate',
  )
}

// 5. insertStoryDraft params: storySeed
if (!code.includes('    storySeed?: FactoryStorySeed | null\n  }) {')) {
  replaceOnce(
    '    premiseSeed: string\n    nameSeed: string\n  }) {',
    '    premiseSeed: string\n    nameSeed: string\n    storySeed?: FactoryStorySeed | null\n  }) {',
    'thêm storySeed vào params insertStoryDraft',
  )
}

// 6. storyDna add factory_seed
if (!code.includes('factory_seed: params.storySeed ?? null,')) {
  replaceOnce(
    '      target_chapters: params.targetChapters,\n      generated_chapters_now: generatedChaptersNow,',
    '      target_chapters: params.targetChapters,\n      factory_seed: params.storySeed ?? null,\n      generated_chapters_now: generatedChaptersNow,',
    'lưu factory_seed vào story_dna',
  )
}

// 7. create storySeed after premiseSeed/nameSeed
if (!code.includes('const storySeed = buildMockStorySeed({')) {
  replaceOnce(
    "        const premiseSeed = makeId('premise')\n        const nameSeed = makeId('name')",
    "        const premiseSeed = makeId('premise')\n        const nameSeed = makeId('name')\n        const storySeed = buildMockStorySeed({\n          genreLabel: genre.label,\n          heroineLabel: heroine.label,\n          avoidLibrary: activeAvoidLibrary,\n          seed: `${factoryRunId}-${storyIndex}-${premiseSeed}`,\n        })",
    'tạo storySeed cho mỗi truyện mới',
  )
}

// 8. log storySeed fingerprint
if (!code.includes('Story seed fingerprint: ${storySeed.shortFingerprint}')) {
  replaceOnce(
    "        setCurrentAction(\n          `Batch ${currentBatch}/${totalBatchesForRun} — đang tạo story ${storyIndex}/${config.storyCount}`,\n        )",
    "        setCurrentAction(\n          `Batch ${currentBatch}/${totalBatchesForRun} — đang tạo story ${storyIndex}/${config.storyCount}`,\n        )\n\n        addLog(`Story seed fingerprint: ${storySeed.shortFingerprint}`, 'info')",
    'thêm log story seed fingerprint',
  )
}

// 9. buildFactoryPromptIdea call add storySeed
if (!code.includes('              storySeed,\n            })')) {
  replaceOnce(
    '              avoidLibrary: activeAvoidLibrary,\n              premiseSeed,\n            })',
    '              avoidLibrary: activeAvoidLibrary,\n              premiseSeed,\n              storySeed,\n            })',
    'truyền storySeed vào buildFactoryPromptIdea',
  )
}

// 10. generateChapter call in create-new add storySeed
if (!code.includes('                runShortId,\n                storySeed,')) {
  replaceOnce(
    '                factoryPromptIdea,\n                runShortId,\n              })',
    '                factoryPromptIdea,\n                runShortId,\n                storySeed,\n              })',
    'truyền storySeed vào generateChapter tạo mới',
  )
}

// 11. insertStoryDraft call add storySeed
if (!code.includes('                storySeed,\n              })')) {
  replaceOnce(
    '                premiseSeed,\n                nameSeed,\n              })',
    '                premiseSeed,\n                nameSeed,\n                storySeed,\n              })',
    'truyền storySeed vào insertStoryDraft',
  )
}

// 12. activeAvoidLibrary synthetic story include factory_seed
if (!code.includes('story_dna: { factory_seed: storySeed }')) {
  replaceOnce(
    '              story_memory: storyMemory,\n              created_at: new Date().toISOString(),',
    '              story_memory: storyMemory,\n              story_dna: { factory_seed: storySeed },\n              created_at: new Date().toISOString(),',
    'thêm story_seed vào avoid scan sau mỗi truyện',
  )
}

if (code === original) {
  console.log('Không có thay đổi nào. Có thể file đã được patch trước đó.')
} else {
  fs.writeFileSync(filePath, code)
  console.log('Đã patch xong file:', filePath)
  console.log('Backup file cũ:', backupPath)
}