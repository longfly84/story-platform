import fs from 'node:fs'
import path from 'node:path'

const filePath = path.join(process.cwd(), 'src', 'components', 'admin', 'ai-factory', 'AIFactoryPanel.tsx')

if (!fs.existsSync(filePath)) {
  console.error('Không tìm thấy file:', filePath)
  process.exit(1)
}

let code = fs.readFileSync(filePath, 'utf8')
const original = code
const backupPath = `${filePath}.bak-story-seed-v3-${Date.now()}`
fs.writeFileSync(backupPath, original)

function ok(msg) {
  console.log('OK:', msg)
}

function skip(msg) {
  console.log('Bỏ qua:', msg)
}

function replaceOnce(search, replacement, label) {
  if (code.includes(replacement)) return skip(`${label} đã có`)
  if (!code.includes(search)) return skip(`không tìm thấy đoạn để ${label}`)
  code = code.replace(search, replacement)
  ok(label)
}

function replaceRegex(regex, replacement, label) {
  if (regex.test(code)) {
    code = code.replace(regex, replacement)
    ok(label)
  } else {
    skip(`không match regex để ${label}`)
  }
}

// 1. Import type FactoryStorySeed
if (!code.includes('FactoryStorySeed,')) {
  replaceOnce(
    '  FactoryStatus,\n  ParsedChapterOutput,',
    '  FactoryStatus,\n  FactoryStorySeed,\n  ParsedChapterOutput,',
    'thêm FactoryStorySeed vào import type',
  )
}

// 2. Import util buildMockStorySeed
if (!code.includes('buildMockStorySeed,')) {
  replaceOnce(
    '  buildMockChapterOutput,\n  clampNumber,',
    '  buildMockChapterOutput,\n  buildMockStorySeed,\n  clampNumber,',
    'thêm buildMockStorySeed vào import utils',
  )
}

// 3. generateChapter params thêm storySeed
if (!code.includes('storySeed?: FactoryStorySeed | null')) {
  replaceRegex(
    /(factoryPromptIdea:\s*string\s*\n\s*runShortId:\s*string\s*\n\s*})\s*\)/,
    'factoryPromptIdea: string\n    runShortId: string\n    storySeed?: FactoryStorySeed | null\n  })',
    'thêm storySeed vào params generateChapter',
  )
}

// 4. payload gửi API thêm storySeed
if (!code.includes('storySeed: params.storySeed ?? null,')) {
  replaceOnce(
    '      isFinalChapter: Boolean(params.isFinalChapter),\n      recentChapters: params.recentChapters,',
    '      isFinalChapter: Boolean(params.isFinalChapter),\n      storySeed: params.storySeed ?? null,\n      recentChapters: params.recentChapters,',
    'thêm storySeed vào payload /api/ai/generate',
  )
}

// 5. insertStoryDraft params thêm storySeed
if (!code.includes('storySeed?: FactoryStorySeed | null\n  }) {')) {
  replaceRegex(
    /(premiseSeed:\s*string\s*\n\s*nameSeed:\s*string\s*\n\s*})\s*\)/,
    'premiseSeed: string\n    nameSeed: string\n    storySeed?: FactoryStorySeed | null\n  })',
    'thêm storySeed vào params insertStoryDraft',
  )
}

// 6. storyDna lưu factory_seed
if (!code.includes('factory_seed: params.storySeed ?? null,')) {
  replaceOnce(
    '      target_chapters: params.targetChapters,\n      generated_chapters_now: generatedChaptersNow,',
    '      target_chapters: params.targetChapters,\n      factory_seed: params.storySeed ?? null,\n      generated_chapters_now: generatedChaptersNow,',
    'lưu factory_seed vào story_dna',
  )
}

// 7. Tạo storySeed sau premiseSeed/nameSeed trong create-new flow
if (!code.includes('const storySeed = buildMockStorySeed({')) {
  replaceOnce(
    "        const premiseSeed = makeId('premise')\n        const nameSeed = makeId('name')",
    "        const premiseSeed = makeId('premise')\n        const nameSeed = makeId('name')\n        const storySeed = buildMockStorySeed({\n          genreLabel: genre.label,\n          heroineLabel: heroine.label,\n          avoidLibrary: activeAvoidLibrary,\n          seed: `${factoryRunId}-${storyIndex}-${premiseSeed}`,\n        })",
    'tạo storySeed cho mỗi truyện mới',
  )
}

// 8. Log fingerprint sau log bắt đầu story
if (!code.includes('Story seed fingerprint: ${storySeed.shortFingerprint}')) {
  const batchLogRegex = /(\s*addLog\(\s*`Batch \$\{currentBatch\}\/\$\{totalBatchesForRun\} — bắt đầu story \$\{storyIndex\}\/\$\{config\.storyCount\}: \$\{genre\.label\}\. Target: \$\{targetChapters\} chương, tạo thật: \$\{chaptersToCreate\} chương\.`,\s*'info',\s*\)\s*)/
  if (batchLogRegex.test(code)) {
    code = code.replace(batchLogRegex, `$1\n        addLog(\`Story seed fingerprint: \${storySeed.shortFingerprint}\`, 'info')\n`)
    ok('thêm log Story seed fingerprint')
  } else {
    skip('không tìm thấy batch log để thêm fingerprint')
  }
}

// 9. buildFactoryPromptIdea nhận storySeed
if (!code.includes('              storySeed,\n            })')) {
  replaceOnce(
    '              avoidLibrary: activeAvoidLibrary,\n              premiseSeed,\n            })',
    '              avoidLibrary: activeAvoidLibrary,\n              premiseSeed,\n              storySeed,\n            })',
    'truyền storySeed vào buildFactoryPromptIdea',
  )
}

// 10. generateChapter create-new nhận storySeed
if (!code.includes('                runShortId,\n                storySeed,')) {
  replaceOnce(
    '                factoryPromptIdea,\n                runShortId,\n              })',
    '                factoryPromptIdea,\n                runShortId,\n                storySeed,\n              })',
    'truyền storySeed vào generateChapter tạo mới',
  )
}

// 11. insertStoryDraft nhận storySeed
if (!code.includes('                nameSeed,\n                storySeed,')) {
  replaceOnce(
    '                premiseSeed,\n                nameSeed,\n              })',
    '                premiseSeed,\n                nameSeed,\n                storySeed,\n              })',
    'truyền storySeed vào insertStoryDraft',
  )
}

// 12. synthetic story đưa storySeed vào avoidLibrary để story sau né story trước ngay trong cùng batch
if (!code.includes('story_dna: { factory_seed: storySeed },')) {
  replaceOnce(
    '              story_memory: storyMemory,\n              created_at: new Date().toISOString(),',
    '              story_memory: storyMemory,\n              story_dna: { factory_seed: storySeed },\n              created_at: new Date().toISOString(),',
    'đưa storySeed vào activeAvoidLibrary',
  )
}

if (code === original) {
  console.log('Không có thay đổi nào. Có thể file đã được sửa rồi hoặc code khác cấu trúc quá nhiều.')
} else {
  fs.writeFileSync(filePath, code)
  console.log('Đã sửa xong file:', filePath)
  console.log('Backup file cũ:', backupPath)
}
