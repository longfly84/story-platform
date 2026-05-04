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
const backupPath = `${filePath}.bak-story-seed-v5-${Date.now()}`
fs.writeFileSync(backupPath, original)

function ok(msg) {
  console.log(`OK: ${msg}`)
}

function skip(msg) {
  console.log(`Bỏ qua: ${msg}`)
}

function replaceRegexOnce(regex, replacement, label) {
  const before = code
  code = code.replace(regex, replacement)
  if (code === before) {
    skip(label)
  } else {
    ok(label)
  }
}

// 1. Import FactoryStorySeed
if (!code.includes('FactoryStorySeed,')) {
  replaceRegexOnce(
    /(FactoryStatus,\s*\n)/,
    `$1  FactoryStorySeed,\n`,
    'thêm FactoryStorySeed vào import type',
  )
} else {
  skip('FactoryStorySeed đã có')
}

// 2. Import buildMockStorySeed
if (!code.includes('buildMockStorySeed,')) {
  replaceRegexOnce(
    /(buildMockChapterOutput,\s*\n)/,
    `$1  buildMockStorySeed,\n`,
    'thêm buildMockStorySeed vào import utils',
  )
} else {
  skip('buildMockStorySeed đã có')
}

// 3. generateChapter params thêm storySeed
if (!code.includes('storySeed?: FactoryStorySeed | null')) {
  replaceRegexOnce(
    /(factoryPromptIdea:\s*string\s*\n\s*runShortId:\s*string)(\s*\n\s*\})/,
    `$1\n    storySeed?: FactoryStorySeed | null$2`,
    'thêm storySeed vào params generateChapter',
  )
} else {
  skip('generateChapter params đã có storySeed')
}

// 4. Payload /api/ai/generate thêm storySeed
if (!code.includes('storySeed: params.storySeed ?? null,')) {
  replaceRegexOnce(
    /(isFinalChapter:\s*Boolean\(params\.isFinalChapter\),\s*\n)/,
    `$1      storySeed: params.storySeed ?? null,\n`,
    'thêm storySeed vào payload /api/ai/generate',
  )
} else {
  skip('payload đã có storySeed')
}

// 5. insertStoryDraft params thêm storySeed
if (!code.includes('storySeed?: FactoryStorySeed | null\n  })')) {
  replaceRegexOnce(
    /(premiseSeed:\s*string\s*\n\s*nameSeed:\s*string)(\s*\n\s*\})/,
    `$1\n    storySeed?: FactoryStorySeed | null$2`,
    'thêm storySeed vào params insertStoryDraft',
  )
} else {
  skip('insertStoryDraft params đã có storySeed')
}

// 6. story_dna lưu factory_seed
if (!code.includes('factory_seed: params.storySeed ?? null,')) {
  replaceRegexOnce(
    /(target_chapters:\s*params\.targetChapters,\s*\n)/,
    `$1      factory_seed: params.storySeed ?? null,\n`,
    'lưu factory_seed vào story_dna',
  )
} else {
  skip('story_dna đã có factory_seed')
}

// 7. Tạo biến storySeed sau premiseSeed + nameSeed
if (!code.includes('const storySeed = buildMockStorySeed({')) {
  replaceRegexOnce(
    /(\s*const premiseSeed = makeId\('premise'\)\s*\n\s*const nameSeed = makeId\('name'\))/,
    `$1\n        const storySeed = buildMockStorySeed({\n          genreLabel: genre.label,\n          heroineLabel: heroine.label,\n          avoidLibrary: activeAvoidLibrary,\n          seed: \`\${factoryRunId}-\${storyIndex}-\${premiseSeed}\`,\n        })`,
    'tạo storySeed cho mỗi truyện mới',
  )
} else {
  skip('storySeed đã được tạo')
}

// 8. Thêm log fingerprint nếu chưa có
if (!code.includes('Story seed fingerprint: ${storySeed.shortFingerprint}')) {
  replaceRegexOnce(
    /(addLog\(\s*\n\s*`Batch \$\{currentBatch\}\/\$\{totalBatchesForRun\} — bắt đầu story \$\{storyIndex\}\/\$\{config\.storyCount\}:[\s\S]*?\n\s*\)\s*)/,
    `$1\n\n        addLog(\`Story seed fingerprint: \${storySeed.shortFingerprint}\`, 'info')`,
    'thêm log Story seed fingerprint',
  )
} else {
  skip('log fingerprint đã có')
}

// 9. Truyền storySeed vào buildFactoryPromptIdea
if (!code.includes('storySeed,\n            })')) {
  replaceRegexOnce(
    /(const factoryPromptIdea = buildFactoryPromptIdea\(\{[\s\S]*?premiseSeed,\s*)(\n\s*\}\))/,
    `$1\n              storySeed,$2`,
    'truyền storySeed vào buildFactoryPromptIdea',
  )
} else {
  skip('buildFactoryPromptIdea đã có storySeed')
}

// 10. Truyền storySeed vào generateChapter trong flow tạo mới
if (!code.includes('runShortId,\n                storySeed,')) {
  replaceRegexOnce(
    /(factoryPromptIdea,\s*\n\s*runShortId,\s*)(\n\s*\}\))/,
    `$1\n                storySeed,$2`,
    'truyền storySeed vào generateChapter tạo mới',
  )
} else {
  skip('generateChapter tạo mới đã có storySeed')
}

// 11. Truyền storySeed vào insertStoryDraft
if (!code.includes('nameSeed,\n                storySeed,')) {
  replaceRegexOnce(
    /(createdStory = await insertStoryDraft\(\{[\s\S]*?nameSeed,\s*)(\n\s*\}\))/,
    `$1\n                storySeed,$2`,
    'truyền storySeed vào insertStoryDraft',
  )
} else {
  skip('insertStoryDraft đã có storySeed')
}

// 12. Đưa storySeed vào activeAvoidLibrary sau mỗi truyện
if (!code.includes('story_dna: { factory_seed: storySeed },')) {
  replaceRegexOnce(
    /(story_memory:\s*storyMemory,\s*\n)/,
    `$1              story_dna: { factory_seed: storySeed },\n`,
    'đưa storySeed vào activeAvoidLibrary',
  )
} else {
  skip('activeAvoidLibrary đã có storySeed')
}

if (code === original) {
  console.log('Không có thay đổi nào.')
} else {
  fs.writeFileSync(filePath, code)
  console.log('Đã sửa xong:', filePath)
  console.log('Backup:', backupPath)
}
