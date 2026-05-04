import fs from 'node:fs'
import path from 'node:path'

const filePath = path.join(
  process.cwd(),
  'src',
  'components',
  'admin',
  'ai-factory',
  'aiFactoryUtils.ts',
)

if (!fs.existsSync(filePath)) {
  console.error('Không tìm thấy file:', filePath)
  process.exit(1)
}

let code = fs.readFileSync(filePath, 'utf8')
const backupPath = `${filePath}.bak-fix-utils-${Date.now()}`
fs.writeFileSync(backupPath, code)

let changed = false

// Fix 1: FACTORY_EVIDENCE_OBJECTS bị khai báo 2 lần.
// Giữ bản đầu, đổi bản thứ hai thành FACTORY_SEED_EVIDENCE_OBJECTS.
const marker = 'export const FACTORY_EVIDENCE_OBJECTS = ['
const firstIndex = code.indexOf(marker)
const secondIndex = firstIndex >= 0 ? code.indexOf(marker, firstIndex + marker.length) : -1

if (secondIndex >= 0) {
  code =
    code.slice(0, secondIndex) +
    'export const FACTORY_SEED_EVIDENCE_OBJECTS = [' +
    code.slice(secondIndex + marker.length)

  changed = true
  console.log('OK: đổi FACTORY_EVIDENCE_OBJECTS thứ hai thành FACTORY_SEED_EVIDENCE_OBJECTS')
} else {
  console.log('Bỏ qua: không tìm thấy FACTORY_EVIDENCE_OBJECTS thứ hai')
}

// Fix 2: buildMockStorySeed phải dùng FACTORY_SEED_EVIDENCE_OBJECTS.
if (code.includes('pickSeedItem(FACTORY_EVIDENCE_OBJECTS,')) {
  code = code.replace(
    'pickSeedItem(FACTORY_EVIDENCE_OBJECTS,',
    'pickSeedItem(FACTORY_SEED_EVIDENCE_OBJECTS,',
  )

  changed = true
  console.log('OK: buildMockStorySeed dùng FACTORY_SEED_EVIDENCE_OBJECTS')
} else {
  console.log('Bỏ qua: không thấy pickSeedItem(FACTORY_EVIDENCE_OBJECTS,')
}

// Fix 3: ParsedChapterOutput yêu cầu field raw.
const returnWithoutRaw = `  return {
    storyTitle,
    storySlug: \`\${slugifyVietnamese(storyTitle)}-\${params.runShortId}\`,`


const returnWithRaw = `  return {
    raw: params.output,
    storyTitle,
    storySlug: \`\${slugifyVietnamese(storyTitle)}-\${params.runShortId}\`,`

if (code.includes(returnWithoutRaw) && !code.includes('raw: params.output,')) {
  code = code.replace(returnWithoutRaw, returnWithRaw)
  changed = true
  console.log('OK: thêm raw: params.output vào parseChapterOutput')
} else {
  console.log('Bỏ qua: raw có thể đã tồn tại hoặc không tìm thấy đúng đoạn return')
}

if (!changed) {
  console.log('Không có gì để sửa.')
} else {
  fs.writeFileSync(filePath, code)
  console.log('Đã sửa xong:', filePath)
  console.log('Backup file cũ:', backupPath)
}