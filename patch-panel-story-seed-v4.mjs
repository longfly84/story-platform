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
const backupPath = `${filePath}.bak-story-seed-v4-${Date.now()}`
fs.writeFileSync(backupPath, original)

function ok(message) {
  console.log(`OK: ${message}`)
}

function skip(message) {
  console.log(`Bỏ qua: ${message}`)
}

function replaceOnce(search, replacement, label) {
  if (code.includes(replacement)) {
    skip(`${label} đã có`)
    return
  }

  if (!code.includes(search)) {
    skip(`không tìm thấy đoạn để ${label}`)
    return
  }

  code = code.replace(search, replacement)
  ok(label)
}

function replaceRegex(regex, replacer, label) {
  const before = code
  code = code.replace(regex, replacer)

  if (code === before) {
    skip(`không match regex để ${label}`)
  } else {
    ok(label)
  }
}

// 1. Thêm FactoryStorySeed vào import type
if (!code.includes('FactoryStorySeed,')) {
  code = code.replace(
    /import type \{([\s\S]*?)\} from '\.\/aiFactoryTypes'/,
    (match, body) => {
      if (body.includes('FactoryStorySeed')) return match

      if (body.includes('FactoryStatus,')) {
        return match.replace('  FactoryStatus,\n', '  FactoryStatus,\n  FactoryStorySeed,\n')
      }

      return match.replace('  ParsedChapterOutput,', '  FactoryStorySeed,\n  ParsedChapterOutput,')
    },
  )
  ok('thêm FactoryStorySeed vào import type')
} else {
  skip('FactoryStorySeed đã có trong import type')
}

// 2. Thêm buildMockStorySeed vào import utils
if (!code.includes('buildMockStorySeed,')) {
  code = code.replace(
    /import \{([\s\S]*?)\} from '\.\/aiFactoryUtils'/,
    (match, body) => {
      if (body.includes('buildMockStorySeed')) return match

      if (body.includes('buildMockChapterOutput,')) {
        return match.replace(
          '  buildMockChapterOutput,\n',
          '  buildMockChapterOutput,\n  buildMockStorySeed,\n',
        )
      }

      return match.replace('  buildFactoryPromptIdea,', '  buildFactoryPromptIdea,\n  buildMockStorySeed,')
    },
  )
  ok('thêm buildMockStorySeed vào import utils')
} else {
  skip('buildMockStorySeed đã có trong import utils')
}

// 3. Thêm storySeed vào params generateChapter
if (!code.includes('storySeed?: FactoryStorySeed | null')) {
  replaceRegex(
    /(factoryPromptIdea:\s*string\s*\n\s*runShortId:\s*string)(\s*\n\s*\})/,
    `$1
    storySeed?: FactoryStorySeed | null$2`,
    'thêm storySeed vào params generateChapter',
  )
} else {
  skip('storySeed params generateChapter đã có')
}

// 4. Thêm storySeed vào payload /api/ai/generate
if (!code.includes('storySeed: params.storySeed ?? null,')) {
  replaceOnce(
    '      isFinalChapter: Boolean(params.isFinalChapter),\n      recentChapters: params.recentChapters,',
    '      isFinalChapter: Boolean(params.isFinalChapter),\n      storySeed: params.storySeed ?? null,\n      recentChapters: params.recentChapters,',
    'thêm storySeed vào payload /api/ai/generate',
  )
} else {
  skip('payload đã có storySeed')
}

// 5. Thêm storySeed vào params insertStoryDraft
if (!code.includes('storySeed?: FactoryStorySeed | null\n  })')) {
  replaceRegex(
    /(premiseSeed:\s*string\s*\n\s*nameSeed:\s*string)(\s*\n\s*\})/,
    `$1
    storySeed?: FactoryStorySeed | null$2`,
    'thêm storySeed vào params insertStoryDraft',
  )
} else {
  skip('params insertStoryDraft đã có storySeed')
}

// 6. Lưu factory_seed vào storyDna
if (!code.includes('factory_seed: params.storySeed ?? null,')) {
  replaceOnce(
    '      target_chapters: params.targetChapters,\n      generated_chapters_now: generatedChaptersNow,',
    '      target_chapters: params.targetChapters,\n      factory_seed: params.storySeed ?? null,\n      generated_chapters_now: generatedChaptersNow,',
    'lưu factory_seed vào story_dna',
  )
} else {
  skip('story_dna đã có factory_seed')
}

// 7. Tạo storySeed sau premiseSeed/nameSeed
if (!code.includes('const storySeed = buildMockStorySeed({')) {
  replaceOnce(
    "        const premiseSeed = makeId('premise')\n        const nameSeed = makeId('name')",
    "        const premiseSeed = makeId('premise')\n        const nameSeed = makeId('name')\n        const storySeed = buildMockStorySeed({\n          genreLabel: genre.label,\n          heroineLabel: heroine.label,\n          avoidLibrary: activeAvoidLibrary,\n          seed: `${factoryRunId}-${storyIndex}-${premiseSeed}`,\n        })",
    'tạo storySeed cho mỗi truyện mới',
  )
} else {
  skip('storySeed đã được tạo')
}

// 8. Đảm bảo log Story seed fingerprint nằm sau log bắt đầu story
if (!code.includes('Story seed fingerprint: ${storySeed.shortFingerprint}')) {
  const search = `        addLog(
          \`Batch \${currentBatch}/\${totalBatchesForRun} — bắt đầu story \${storyIndex}/\${config.storyCount}: \${genre.label}. Target: \${targetChapters} chương, tạo thật: \${chaptersToCreate} chương.\`,
          'info',
        )`

  const replacement = `${search}

        addLog(\`Story seed fingerprint: \${storySeed.shortFingerprint}\`, 'info')`

  replaceOnce(search, replacement, 'thêm log Story seed fingerprint')
} else {
  skip('log Story seed fingerprint đã có')
}

// 9. Truyền storySeed vào buildFactoryPromptIdea
if (!code.includes('              premiseSeed,\n              storySeed,')) {
  replaceOnce(
    '              avoidLibrary: activeAvoidLibrary,\n              premiseSeed,\n            })',
    '              avoidLibrary: activeAvoidLibrary,\n              premiseSeed,\n              storySeed,\n            })',
    'truyền storySeed vào buildFactoryPromptIdea',
  )
} else {
  skip('buildFactoryPromptIdea đã nhận storySeed')
}

// 10. Truyền storySeed vào generateChapter ở flow tạo mới
if (!code.includes('                runShortId,\n                storySeed,')) {
  replaceOnce(
    '                factoryPromptIdea,\n                runShortId,\n              })',
    '                factoryPromptIdea,\n                runShortId,\n                storySeed,\n              })',
    'truyền storySeed vào generateChapter tạo mới',
  )
} else {
  skip('generateChapter tạo mới đã nhận storySeed')
}

// 11. Truyền storySeed vào insertStoryDraft
if (!code.includes('                nameSeed,\n                storySeed,')) {
  replaceOnce(
    '                premiseSeed,\n                nameSeed,\n              })',
    '                premiseSeed,\n                nameSeed,\n                storySeed,\n              })',
    'truyền storySeed vào insertStoryDraft',
  )
} else {
  skip('insertStoryDraft đã nhận storySeed')
}

// 12. Đưa storySeed vào activeAvoidLibrary sau mỗi truyện
if (!code.includes('story_dna: { factory_seed: storySeed },')) {
  replaceOnce(
    '              story_memory: storyMemory,\n              created_at: new Date().toISOString(),',
    '              story_memory: storyMemory,\n              story_dna: { factory_seed: storySeed },\n              created_at: new Date().toISOString(),',
    'đưa storySeed vào activeAvoidLibrary',
  )
} else {
  skip('activeAvoidLibrary đã có storySeed')
}

if (code === original) {
  console.log('Không có thay đổi nào.')
} else {
  fs.writeFileSync(filePath, code)
  console.log('Đã sửa xong file:', filePath)
  console.log('Backup file cũ:', backupPath)
}
