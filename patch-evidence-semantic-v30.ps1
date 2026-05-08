param(
  [string]$ProjectRoot = "D:\MyCode\story-platform"
)

$ErrorActionPreference = "Stop"

function Write-Utf8File([string]$Path, [string]$Content) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

function Add-ImportIfMissing([string]$Path, [string]$ImportLine, [string]$AfterPattern) {
  $text = Get-Content $Path -Raw -Encoding UTF8
  if ($text.Contains($ImportLine.Trim())) {
    return
  }

  $match = [regex]::Match($text, $AfterPattern)
  if (!$match.Success) {
    throw "Không tìm thấy điểm thêm import trong $Path"
  }

  $text = $text.Insert($match.Index + $match.Length, "`n$ImportLine")
  Write-Utf8File $Path $text
}

$utilsDir = Join-Path $ProjectRoot "src\components\admin\ai-factory\utils"
New-Item -ItemType Directory -Force -Path $utilsDir | Out-Null

$semanticFile = Join-Path $utilsDir "factoryEvidenceSemantics.ts"
$semanticContent = @'
export type FactoryEvidenceSemanticType =
  | ''cake_order_slip''
  | ''cafeteria_seat_ticket''
  | ''locker_access_card''
  | ''hotel_room_key''
  | ''laundry_tag''
  | ''sewing_thread_button''
  | ''plant_pot_label''
  | ''bottle_cap_scratch''
  | ''bracelet_bead''
  | ''photo_ribbon''
  | ''towel_embroidery''
  | ''note_piece''
  | ''unknown''

export type FactoryEvidenceSemantics = {
  semanticType: FactoryEvidenceSemanticType
  title: string
  titleVariants: string[]
  worldLabel: string
  settingHints: string[]
  conflictHints: string[]
  forbiddenMeanings: string[]
  confidence: number
  reason: string
}

function safeString(value: unknown) {
  if (typeof value === ''string'') return value.trim()
  if (typeof value === ''number'' || typeof value === ''boolean'') return String(value).trim()
  return ''''
}

export function normalizeFactoryEvidenceText(value: unknown) {
  return safeString(value)
    .toLowerCase()
    .normalize(''NFD'')
    .replace(/[\u0300-\u036f]/g, '''')
    .replace(/đ/g, ''d'')
    .replace(/[^a-z0-9\s/-]/g, '' '')
    .replace(/\s+/g, '' '')
    .trim()
}

function wordsOf(value: string) {
  return value.split(/\s+/).filter(Boolean)
}

function hasWord(text: string, word: string) {
  return wordsOf(text).includes(word)
}

function hasAllWords(text: string, words: string[]) {
  return words.every((word) => hasWord(text, word))
}

function hasAnyWord(text: string, words: string[]) {
  return words.some((word) => hasWord(text, word))
}

function hasPhrase(text: string, phrases: string[]) {
  return phrases.some((phrase) => text.includes(normalizeFactoryEvidenceText(phrase)))
}

function makeSemantic(params: Omit<FactoryEvidenceSemantics, ''titleVariants''> & {
  titleVariants?: string[]
}): FactoryEvidenceSemantics {
  return {
    ...params,
    titleVariants: Array.from(new Set([params.title, ...(params.titleVariants || [])])),
  }
}

export function buildFactoryEvidenceContextText(seed: unknown) {
  const record = seed && typeof seed === ''object'' && !Array.isArray(seed)
    ? (seed as Record<string, unknown>)
    : {}

  return [
    record.title,
    record.genre,
    record.genreLabel,
    record.setting,
    record.openingArena,
    record.mainArena,
    record.evidenceObject,
    record.evidenceType,
    record.signatureObject,
    record.relationshipConflict,
    record.coreConflict,
    record.publicPressure,
    record.hiddenTruth,
    record.villainAttack,
    record.heroineCounter,
    record.motifText,
    record.shortFingerprint,
    record.fingerprint,
  ]
    .map(safeString)
    .filter(Boolean)
    .join('' | '')
}

export function resolveFactoryEvidenceSemantics(params: {
  evidenceText?: unknown
  contextText?: unknown
}): FactoryEvidenceSemantics {
  const evidence = normalizeFactoryEvidenceText(params.evidenceText)
  const context = normalizeFactoryEvidenceText(params.contextText)
  const text = `${evidence} ${context}`.trim()

  const hasTicketWord = hasAnyWord(text, [''ve'', ''phieu''])
  const hasCardWord = hasAnyWord(text, [''the'', ''card''])
  const isCakeOrder =
    hasPhrase(text, [
      ''phieu dat banh'',
      ''phieu banh'',
      ''goc phieu banh'',
      ''phieu banh bi xe'',
      ''banh bi xe goc'',
      ''hoa don banh'',
      ''don banh'',
    ]) || hasAllWords(text, [''phieu'', ''banh''])

  // ORDER MATTERS:
  // Cake slip must be resolved before food ticket because "banh" contains "an" in raw text.
  if (isCakeOrder) {
    return makeSemantic({
      semanticType: ''cake_order_slip'',
      title: ''Phiếu Bánh Bị Xé Góc'',
      titleVariants: [''Góc Phiếu Bánh Bị Xé'', ''Tờ Phiếu Đặt Bánh Bị Xé''],
      worldLabel: ''tiệm bánh / đơn đặt bánh / phụ huynh'',
      settingHints: [
        ''quầy nhận bánh của tiệm bánh'',
        ''khu giao bánh gần lớp học'',
        ''sảnh chung cư nơi phụ huynh đối chất về đơn bánh'',
      ],
      conflictHints: [
        ''phiếu đặt bánh bị xé góc bị dùng để đổ lỗi cho nữ chính'',
        ''đơn bánh bị sửa sau khi rời quầy, khiến nữ chính bị hiểu sai'',
      ],
      forbiddenMeanings: [''vé ăn'', ''phiếu ăn'', ''nhà ăn'', ''số ghế'', ''thẻ phòng'', ''thẻ tủ đồ''],
      confidence: 0.98,
      reason: ''matched cake/order-slip semantics before generic food-ticket semantics'',
    })
  }

  const isLockerCard =
    hasPhrase(text, [
      ''the tu do'',
      ''the locker'',
      ''locker'',
      ''tu locker'',
      ''khe tu'',
      ''phong tap'',
      ''cau lac bo the thao'',
      ''the thanh vien'',
      ''so thanh vien'',
    ]) ||
    (hasCardWord && hasAnyWord(text, [''locker'', ''tu'']) && hasAnyWord(text, [''do'', ''tap'', ''the thao'', ''cau'']))

  // Locker card must be resolved before hotel room key because "phong tap" contains "phong".
  if (isLockerCard) {
    return makeSemantic({
      semanticType: ''locker_access_card'',
      title: ''Tấm Thẻ Tủ Đồ Bị Đặt Sai'',
      titleVariants: [''Tấm Thẻ Ở Tủ Đồ Phòng Tập'', ''Chiếc Thẻ Trong Khe Locker''],
      worldLabel: ''phòng tập / câu lạc bộ thể thao / khu tủ đồ'',
      settingHints: [
        ''khu tủ đồ của câu lạc bộ thể thao'',
        ''bàn quản lý thẻ thành viên ở phòng tập'',
        ''hành lang locker cạnh khu trẻ em'',
      ],
      conflictHints: [
        ''thẻ tủ đồ bị đặt sai chỗ để gán nữ chính với một việc cô không làm'',
        ''thẻ thành viên bị chuyển sang locker của người khác để tạo hiểu lầm'',
      ],
      forbiddenMeanings: [''thẻ phòng khách sạn'', ''room key'', ''khách sạn'', ''phòng VIP''],
      confidence: 0.97,
      reason: ''matched locker/gym access-card semantics before hotel-room-key semantics'',
    })
  }

  const isCafeteriaSeatTicket =
    hasTicketWord &&
    (
      hasPhrase(text, [''ve an'', ''phieu an'', ''nha an'', ''so ghe'', ''cho ngoi'', ''ban an hoc sinh'']) ||
      hasAllWords(text, [''so'', ''ghe'']) ||
      (hasWord(text, ''an'') && hasAnyWord(text, [''ghe'', ''ban'', ''nha'']))
    )

  if (isCafeteriaSeatTicket) {
    return makeSemantic({
      semanticType: ''cafeteria_seat_ticket'',
      title: ''Vé Ăn Số Ghế Lệch'',
      titleVariants: [''Tấm Vé Ăn Bị Đổi Số'', ''Dấu Mực Trên Vé Ăn''],
      worldLabel: ''trường học / nhà ăn / số ghế / phụ huynh'',
      settingHints: [
        ''quầy phát vé ăn của nhà ăn'',
        ''khu bàn ăn có đánh số ghế'',
        ''phòng họp phụ huynh cạnh nhà ăn'',
      ],
      conflictHints: [
        ''vé ăn có số ghế bị đổi để khiến nữ chính bị hiểu sai'',
        ''số ghế trên phiếu ăn bị dùng làm bằng chứng giả'',
      ],
      forbiddenMeanings: [''phiếu đặt bánh'', ''tiệm bánh'', ''thẻ phòng'', ''locker''],
      confidence: 0.95,
      reason: ''matched food-ticket/seat-number semantics with word-level token checks'',
    })
  }

  const isHotelRoomKey =
    hasCardWord &&
    hasPhrase(text, [''the phong'', ''room key'', ''khach san'', ''phong khach san'', ''suite'', ''le tan khach san'']) &&
    !hasPhrase(text, [''phong tap'', ''tu do'', ''locker''])

  if (isHotelRoomKey) {
    return makeSemantic({
      semanticType: ''hotel_room_key'',
      title: ''Tấm Thẻ Phòng Bị Bỏ Quên'',
      titleVariants: [''Thẻ Phòng Quẹt Lúc Nửa Đêm'', ''Dấu Quẹt Trên Thẻ Phòng''],
      worldLabel: ''khách sạn / thẻ phòng / hành lang riêng tư'',
      settingHints: [''hành lang khách sạn'', ''quầy lễ tân'', ''cửa phòng có thẻ từ''],
      conflictHints: [''thẻ phòng bị dùng để dựng hiểu lầm về một cuộc gặp riêng tư''],
      forbiddenMeanings: [''thẻ tủ đồ'', ''locker'', ''phòng tập''],
      confidence: 0.92,
      reason: ''matched hotel room-key semantics'',
    })
  }

  if (hasPhrase(text, [''the giat'', ''tiem giat'', ''bien lai giat'', ''ao con ghim the'']) || hasAllWords(text, [''the'', ''giat''])) {
    return makeSemantic({
      semanticType: ''laundry_tag'',
      title: ''Thẻ Giặt Còn Ghim'',
      titleVariants: [''Tấm Thẻ Ở Tiệm Giặt'', ''Dấu Vải Sau Lần Giặt''],
      worldLabel: ''tiệm giặt / đồ gửi nhầm / khu dân cư'',
      settingHints: [''quầy nhận đồ của tiệm giặt'', ''kệ áo trả khách'', ''khu dân cư trước tiệm giặt''],
      conflictHints: [''thẻ giặt bị ghim lại để đổ lỗi cho nữ chính''],
      forbiddenMeanings: [''thẻ phòng'', ''thẻ tủ đồ''],
      confidence: 0.94,
      reason: ''matched laundry-tag semantics'',
    })
  }

  if (hasPhrase(text, [''soi chi'', ''khuy ao'', ''chi con mac'', ''mui khau'', ''cuon chi''])) {
    return makeSemantic({
      semanticType: ''sewing_thread_button'',
      title: ''Sợi Chỉ Ở Khuy Áo'',
      titleVariants: [''Sợi Chỉ Còn Mắc Ở Khuy Áo'', ''Chiếc Khuy Áo Có Sợi Chỉ Lạ''],
      worldLabel: ''xưởng may / phòng thử đồ / áo bị sửa'',
      settingHints: [''phòng thử đồ của xưởng may'', ''tiệm sửa đồ'', ''khu tủ đồ có áo bị treo nhầm''],
      conflictHints: [''sợi chỉ lạ trên khuy áo bị dùng làm bằng chứng giả''],
      forbiddenMeanings: [''vé ăn'', ''thẻ phòng''],
      confidence: 0.95,
      reason: ''matched sewing thread/button semantics'',
    })
  }

  if (hasPhrase(text, [''nhan chau'', ''chau cay'', ''chau hoa'', ''tem kim loai tren chau'', ''cua hang cay''])) {
    return makeSemantic({
      semanticType: ''plant_pot_label'',
      title: ''Chậu Cây Bị Cắm Sai Nhãn'',
      titleVariants: [''Tấm Nhãn Trên Chậu Cây'', ''Chiếc Nhãn Trên Chậu Cây''],
      worldLabel: ''nhà trẻ / chậu cây / phụ huynh / cửa hàng cây'',
      settingHints: [''cổng nhà trẻ cạnh khu nhận quà'', ''cửa hàng cây'', ''lớp học có chậu cây tặng trẻ''],
      conflictHints: [''nhãn chậu cây bị đổi để vu nữ chính''],
      forbiddenMeanings: [''nhãn hồ sơ'', ''thẻ phòng''],
      confidence: 0.94,
      reason: ''matched plant-pot-label semantics'',
    })
  }

  if (hasPhrase(text, [''nap chai'', ''vet xuoc tren nap'', ''nap chai co vet xuoc''])) {
    return makeSemantic({
      semanticType: ''bottle_cap_scratch'',
      title: ''Nắp Chai Có Vết Xước'',
      titleVariants: [''Vết Xước Trên Nắp Chai'', ''Dấu Màu Trên Nắp Chai''],
      worldLabel: ''đời sống sự kiện / bàn nước / studio gia đình'',
      settingHints: [''bàn nước trong studio'', ''khu bãi xe sau sự kiện'', ''góc quầy nước''],
      conflictHints: [''nắp chai bị tráo vị trí để dựng chuyện''],
      forbiddenMeanings: [''thẻ phòng'', ''vé ăn''],
      confidence: 0.9,
      reason: ''matched bottle cap/scratch semantics'',
    })
  }

  if (hasPhrase(text, [''hat vong'', ''vong tay'', ''vong su kien'', ''hat vong bi dut''])) {
    return makeSemantic({
      semanticType: ''bracelet_bead'',
      title: hasPhrase(text, [''hat vong'']) ? ''Hạt Vòng Sai Chỗ'' : ''Vòng Tay Sự Kiện Bị Đổi Màu'',
      titleVariants: [''Hạt Vòng Còn Mắc Trong Khe Ghế'', ''Vòng Tay Sự Kiện Bị Đổi Màu''],
      worldLabel: ''trường học / sự kiện trẻ em / đồ cá nhân'',
      settingHints: [''khu gửi đồ của sự kiện trẻ em'', ''bàn phát vòng tay'', ''hàng ghế của phụ huynh''],
      conflictHints: [''hạt vòng đặt sai chỗ bị dùng để đổ lỗi cho nữ chính''],
      forbiddenMeanings: [''tín vật gia tộc'', ''trang sức hào môn''],
      confidence: 0.9,
      reason: ''matched bracelet/bead event semantics'',
    })
  }

  if (hasPhrase(text, [''goc anh'', ''anh cu'', ''ruy bang'', ''bo hoa co goc anh''])) {
    return makeSemantic({
      semanticType: ''photo_ribbon'',
      title: ''Góc Ảnh Trên Dải Ruy-Băng'',
      titleVariants: [''Mảnh Ảnh Bị Ghim Trên Bó Hoa'', ''Bó Hoa Có Góc Ảnh Cũ''],
      worldLabel: ''bó hoa / ảnh cũ / ký ức bị cắt'',
      settingHints: [''tiệm hoa'', ''sảnh sự kiện'', ''bàn nhận hoa''],
      conflictHints: [''góc ảnh bị cắt thiếu hé lộ người thật sự có mặt''],
      forbiddenMeanings: [''camera pháp lý'', ''hồ sơ bệnh án''],
      confidence: 0.88,
      reason: ''matched photo/ribbon semantics'',
    })
  }

  if (hasPhrase(text, [''khan tay'', ''theu chu'', ''net theu''])) {
    return makeSemantic({
      semanticType: ''towel_embroidery'',
      title: ''Chiếc Khăn Tay Thêu Chữ Nhỏ'',
      titleVariants: [''Nét Thêu Trên Khăn Tay'', ''Dấu Chỉ Trên Khăn Tay''],
      worldLabel: ''khăn tay / thêu chữ / vật riêng tư'',
      settingHints: [''phòng chờ'', ''tiệm may'', ''bàn đồ cá nhân''],
      conflictHints: [''nét thêu nhỏ làm lộ người đã cầm khăn''],
      forbiddenMeanings: [''giấy tờ pháp lý''],
      confidence: 0.86,
      reason: ''matched towel embroidery semantics'',
    })
  }

  if (hasPhrase(text, [''mau ghi chu'', ''ghi chu'', ''to giay'', ''mau giay''])) {
    return makeSemantic({
      semanticType: ''note_piece'',
      title: ''Mẩu Ghi Chú Bị Đổi Số'',
      titleVariants: [''Tờ Giấy Trước Thang Máy'', ''Ghi Chú Lệch Ở Sảnh Chung Cư''],
      worldLabel: ''ghi chú đời thường / giấy nhỏ / hiểu lầm công khai'',
      settingHints: [''sảnh chung cư'', ''quầy lễ tân'', ''bàn nhận đồ''],
      conflictHints: [''mẩu ghi chú bị sửa số để gán lỗi cho nữ chính''],
      forbiddenMeanings: [''hồ sơ mật'', ''mã QR''],
      confidence: 0.8,
      reason: ''matched note/paper semantics'',
    })
  }

  return makeSemantic({
    semanticType: ''unknown'',
    title: ''Chi Tiết Bị Đặt Sai'',
    titleVariants: [''Vật Chứng Bị Đặt Sai Chỗ''],
    worldLabel: ''đời sống đô thị / vật chứng cụ thể'',
    settingHints: [''một không gian đời sống cụ thể có người chứng kiến''],
    conflictHints: [''một vật chứng nhỏ bị đặt sai chỗ để tạo hiểu lầm''],
    forbiddenMeanings: [''mã QR'', ''hồ sơ mật chung chung''],
    confidence: 0.35,
    reason: ''no strong semantic evidence match'',
  })
}

'@
Write-Utf8File $semanticFile $semanticContent

$panelPath = Join-Path $ProjectRoot "src\components\admin\ai-factory\AIFactoryPanel.tsx"
$runnerPath = Join-Path $ProjectRoot "src\components\admin\ai-factory\utils\factoryStoryRunner.ts"
$seedPath = Join-Path $ProjectRoot "src\components\admin\ai-factory\prompts\factoryStorySeed.ts"

# 1) AIFactoryPanel: make panel title gate use central semantic resolver
if (Test-Path $panelPath) {
  Add-ImportIfMissing `
    -Path $panelPath `
    -ImportLine "import { buildFactoryEvidenceContextText, resolveFactoryEvidenceSemantics } from './utils/factoryEvidenceSemantics'" `
    -AfterPattern "import \{ buildFactoryPublicStoryDescription \} from './utils/factoryPublicDescription'\r?\n"

  $text = Get-Content $panelPath -Raw -Encoding UTF8

  if ($text -match "function makePanelTitleFromEvidence\(") {
    $replacement = @'
function makePanelTitleFromEvidence(storySeed?: FactoryStorySeed | null) {
  const semantic = resolveFactoryEvidenceSemantics({
    evidenceText: getFactorySeedEvidence(storySeed),
    contextText: buildFactoryEvidenceContextText(storySeed),
  })

  return semantic.title
}

function getPanelEvidenceSemanticForLog(storySeed?: FactoryStorySeed | null) {
  return resolveFactoryEvidenceSemantics({
    evidenceText: getFactorySeedEvidence(storySeed),
    contextText: buildFactoryEvidenceContextText(storySeed),
  })
}

function resolvePanelStoryTitle
'@

    $text = [regex]::Replace(
      $text,
      "function makePanelTitleFromEvidence\([\s\S]*?\r?\n\}\r?\n\r?\nfunction resolvePanelStoryTitle",
      $replacement,
      1
    )

    # Add semantic log before/near existing Panel title gate final log.
    if ($text -notmatch "Evidence semantic:") {
      $text = $text.Replace(
        "const panelStoryTitle = resolvePanelStoryTitle({
                storySeed,
                parsedTitle: parsed.storyTitle,
              })",
        "const panelStoryTitle = resolvePanelStoryTitle({
                storySeed,
                parsedTitle: parsed.storyTitle,
              })
              const evidenceSemantic = getPanelEvidenceSemanticForLog(storySeed)

              addLog(
                `Evidence semantic: ${evidenceSemantic.semanticType} → ${evidenceSemantic.title} | world=${evidenceSemantic.worldLabel} | reason=${evidenceSemantic.reason}`,
                evidenceSemantic.confidence >= 0.85 ? 'success' : 'warning',
              )"
      )
    }

    Write-Utf8File $panelPath $text
    Write-Host "Patched AIFactoryPanel.tsx"
  } else {
    Write-Warning "AIFactoryPanel.tsx chưa có makePanelTitleFromEvidence. Không patch panel title gate để tránh phá file."
  }
}

# 2) factoryStoryRunner: use same semantic resolver for final title fallback
if (Test-Path $runnerPath) {
  Add-ImportIfMissing `
    -Path $runnerPath `
    -ImportLine "import { buildFactoryEvidenceContextText, resolveFactoryEvidenceSemantics } from './factoryEvidenceSemantics'" `
    -AfterPattern "import \{ buildFactoryPublicStoryDescription \} from './factoryPublicDescription'\r?\n"

  $text = Get-Content $runnerPath -Raw -Encoding UTF8

  $patterns = @(
    "function makeFactoryTitleFromEvidence\([\s\S]*?\r?\n\}\r?\n\r?\nfunction ",
    "function makeEvidenceTitleFromSeed\([\s\S]*?\r?\n\}\r?\n\r?\nfunction ",
    "function makeStoryTitleFromEvidence\([\s\S]*?\r?\n\}\r?\n\r?\nfunction "
  )

  $patched = $false
  foreach ($pattern in $patterns) {
    $match = [regex]::Match($text, $pattern)
    if ($match.Success) {
      $nextFunction = [regex]::Match($match.Value, "function\s+\w+\s*$")
      $prefix = @'
function makeFactoryTitleFromEvidence(storySeed?: FactoryStorySeed | null) {
  const semantic = resolveFactoryEvidenceSemantics({
    evidenceText: (storySeed as any)?.evidenceObject,
    contextText: buildFactoryEvidenceContextText(storySeed),
  })

  return semantic.title
}

'@
      $rest = $match.Value -replace "^[\s\S]*?\r?\n\}\r?\n\r?\n", ""
      $text = $text.Substring(0, $match.Index) + $prefix + $rest + $text.Substring($match.Index + $match.Length)
      $patched = $true
      break
    }
  }

  if ($patched) {
    Write-Utf8File $runnerPath $text
    Write-Host "Patched factoryStoryRunner.ts"
  } else {
    Write-Warning "Không tìm thấy hàm title evidence trong factoryStoryRunner.ts. Bỏ qua runner."
  }
}

# 3) factoryStorySeed: put semantic title variants at the top of makeEvidenceTitleVariants
if (Test-Path $seedPath) {
  Add-ImportIfMissing `
    -Path $seedPath `
    -ImportLine "import { resolveFactoryEvidenceSemantics } from '../utils/factoryEvidenceSemantics';" `
    -AfterPattern "import[\s\S]*?from \"\./factoryMotifBank10000\";\r?\n"

  $text = Get-Content $seedPath -Raw -Encoding UTF8

  if ($text -notmatch "semantic.semanticType !== `"unknown`"") {
    $text = $text.Replace(
      "  const variants: string[] = [];

",
      "  const variants: string[] = [];

  const semantic = resolveFactoryEvidenceSemantics({
    evidenceText: evidenceObject,
    contextText: evidenceObject,
  });

  if (semantic.semanticType !== `"unknown`") {
    variants.push(
      semantic.title,
      ...semantic.titleVariants.filter((item) => item !== semantic.title),
    );

    return Array.from(new Set(variants));
  }

",
      1
    )
  }

  Write-Utf8File $seedPath $text
  Write-Host "Patched factoryStorySeed.ts"
}

Write-Host ""
Write-Host "DONE Evidence Semantic Resolver v30."
Write-Host "Next: npm run build"
