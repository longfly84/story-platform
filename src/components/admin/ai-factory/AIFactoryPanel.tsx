import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type {
  AIFactoryConfig,
  AvoidLibrary,
  ExistingStory,
  FactoryGenreOption,
  FactoryHeroineOption,
  FactoryJob,
  FactoryLog,
  FactoryRunSnapshot,
  FactoryStatus,
  FactoryStorySeed,
  ParsedChapterOutput,
  StoryMotifRegistryItem,
} from './aiFactoryTypes'
import {
  AI_FACTORY_STORAGE_KEY,
  DEFAULT_FACTORY_GENRES,
  DEFAULT_HEROINE_OPTIONS,
  buildAvoidLibrary,
  buildFactoryPromptIdea,
  buildMockChapterOutput,
  buildMockStorySeed,
  getLogTime,
  makeId,
  parseChapterOutput,
  pickOne,
  randomInt,
  sleep,
  validateChapterOutput,
} from './aiFactoryUtils'

import AIFactoryPanelView from './components/AIFactoryPanelView'
import type { ContinueStatusFilter, ExistingChapterRow, FactoryMode, IncompleteStory } from './types/factoryPanelTypes'
import {
  base64ToBlob,
  buildPublicChapterSummary,
  dataUrlToBlob,
  getStoryGenreLabel,
  getStoryHeroineLabel,
  getTargetChapters,
  safeJson,
} from './utils/factoryPanelHelpers'
import { getFactoryChapterProgress } from './utils/factoryProgress'
import {
  attachMotifToSeed,
  extractMotifRegistryItemsFromStories,
} from './utils/motifFingerprint'
import {
  formatMotifSimilarityForLog,
  shouldRejectMotif,
} from './utils/motifSimilarity'
import { buildFactoryPublicStoryDescription } from './utils/factoryPublicDescription'

function safeString(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim()
  return ''
}

const defaultConfig: AIFactoryConfig = {
  provider: 'mock',
  modelKey: 'economy',
  storyCount: 1,
  batchSize: 5,
  chaptersToGenerateNow: 1,
  minTargetChapters: 10,
  maxTargetChapters: 20,
  delayMs: 2000,
  generateCover: false,
  coverArtStyle: 'auto',
  coverCompositionPreset: 'auto',
  autoCompleteByTarget: false,
  storyStatus: 'draft',
  chapterStatus: 'draft',
  chapterLengthLabel: 'Tùy chỉnh — khoảng 3500–4500 ký tự',
  chapterMinChars: 3500,
  chapterMaxChars: 4500,
  cliffhangerLabel: 'Mặc định — AI tự chọn theo mạch truyện',
}

function normalizeCoverArtStyle(value: unknown): AIFactoryConfig['coverArtStyle'] {
  const raw = String(value || '').trim()

  if (
    raw === 'auto' ||
    raw === 'anime_cinematic' ||
    raw === 'manga_manhwa' ||
    raw === 'cinematic_realistic' ||
    raw === 'popular_webnovel_collage'
  ) {
    return raw as AIFactoryConfig['coverArtStyle']
  }

  if (raw === 'anime-cinematic') return 'anime_cinematic'
  if (raw === 'modern-manhwa') return 'manga_manhwa'
  if (raw === 'manga-drama') return 'manga_manhwa'
  if (raw === 'semi-realistic') return 'cinematic_realistic'
  if (raw === 'movie-poster') return 'popular_webnovel_collage'

  return 'auto'
}

function normalizeCoverCompositionPreset(value: unknown): AIFactoryConfig['coverCompositionPreset'] {
  const raw = String(value || '').trim()

  if (raw === 'auto' || raw === 'story_scene_offset' || raw === 'luxury_collage') {
    return raw as AIFactoryConfig['coverCompositionPreset']
  }

  if (raw === 'story-scene-offset' || raw === 'wide_story_scene' || raw === 'environmental') {
    return 'story_scene_offset'
  }
  if (raw === 'narrative_collage' || raw === 'story_collage' || raw === 'luxury-collage') {
    return 'luxury_collage'
  }

  return 'auto'
}

function getCoverArtStyleLabel(style: AIFactoryConfig['coverArtStyle']) {
  switch (normalizeCoverArtStyle(style)) {
    case 'anime_cinematic':
      return 'Anime — Chinese commercial webnovel cover, glossy mature anime-inspired Chinese webnovel beauty, luxury urban drama color'
    case 'manga_manhwa':
      return 'Manga — Chinese commercial webnovel cover, polished manga/manhua-inspired line art, luxury full-color rendering'
    case 'popular_webnovel_collage':
      return 'Chinese manhua luxury collage, layered storytelling, 3 to 7 story fragments, glossy premium Chinese webnovel cover'
    case 'cinematic_realistic':
      return 'Urban drama premium poster illustration, polished cinematic realism, luxury Chinese urban-drama cover'
    case 'auto':
    default:
      return 'premium Chinese commercial webnovel cover, automatically matched to story content'
  }
}

function getCoverCompositionPresetLabel(style: AIFactoryConfig['coverCompositionPreset']) {
  switch (normalizeCoverCompositionPreset(style)) {
    case 'story_scene_offset':
      return 'Story scene offset composition, heroine off-center, wider background, supporting cast and environment visible'
    case 'luxury_collage':
      return 'Luxury collage composition, one heroine anchor with layered mini-scenes and story fragments'
    case 'auto':
    default:
      return 'composition chosen automatically from story content'
  }
}



function normalizeFactoryTitleText(value: unknown) {
  return safeString(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getFactorySeedEvidence(storySeed?: FactoryStorySeed | null) {
  return safeString((storySeed as any)?.evidenceObject || (storySeed as any)?.motifFingerprint?.evidenceObject)
}

function titleCaseFactoryEvidence(input: string) {
  return input
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => {
      if (!word) return word
      if (/^(USB|QR|ADN|CEO|VIP)$/i.test(word)) return word.toUpperCase()
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

function hasFactoryEvidenceState(input: string) {
  const normalized = ` ${normalizeFactoryTitleText(input)} `
  return [
    ' bi ',
    ' co ',
    ' lech',
    ' sai',
    ' rach',
    ' xe ',
    ' roi',
    ' mat',
    ' bong',
    ' doi',
    ' sua',
    ' cat',
    ' gui nham',
    ' quay nham',
  ].some((marker) => normalized.includes(marker))
}

function cleanFactoryEvidenceForTitle(input: string) {
  return safeString(input)
    .replace(/^một\s+/i, '')
    .replace(/^một chiếc\s+/i, 'Chiếc ')
    .replace(/^một tấm\s+/i, 'Tấm ')
    .replace(/^một mẩu\s+/i, 'Mẩu ')
    .replace(/\s+có một chi tiết lệch.*$/i, '')
    .replace(/\s+co mot chi tiet lech.*$/i, '')
    .replace(/\s+mà chỉ.*$/i, '')
    .replace(/\s+ma chi.*$/i, '')
    .replace(/\s+không phải.*$/i, '')
    .replace(/\s+khong phai.*$/i, '')
    .replace(/\s+theo công thức.*$/i, '')
    .replace(/\s+theo cong thuc.*$/i, '')
    .replace(/\s+bị đặt sai chỗ$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}




function isBadFactoryStoryTitle(title: string) {
  const normalized = normalizeFactoryTitleText(title)

  return [
    'manh moi o hien truong',
    'chua dat ten',
    'vat chung bi dat sai cho',
    'mon qua bi lo',
    'ma qr dan toi thu muc an',
    'dong ma trong ho so cu',
    'cuoc goi tu so may la',
    'tu duong mo lai ho so cu',
    'dau chi khac mau',
    'tam the phong bi bo quen',
    'the phong quet luc nua dem',
    'dau quet tren the phong',
  ].includes(normalized)
}

function makePanelTitleFromEvidence(storySeed?: FactoryStorySeed | null) {
  const evidence = getFactorySeedEvidence(storySeed)
  const clean = cleanFactoryEvidenceForTitle(evidence)
  const title = titleCaseFactoryEvidence(clean)

  if (title && title.length <= 48) {
    return hasFactoryEvidenceState(title) ? title : `${title} Bị Lộ`
  }

  const shortTitle = title.split(/\s+/).slice(0, 7).join(' ').trim()
  if (shortTitle && shortTitle.length >= 8) {
    return hasFactoryEvidenceState(shortTitle) ? shortTitle : `${shortTitle} Bị Lộ`
  }

  return 'Chi Tiết Bị Đặt Sai'
}


function resolvePanelStoryTitle(params: {
  storySeed?: FactoryStorySeed | null
  parsedTitle: string
}) {
  const seedTitle = safeString(params.storySeed?.title)
  const parsedTitle = safeString(params.parsedTitle)
  const evidenceTitle = makePanelTitleFromEvidence(params.storySeed)

  const chosen =
    evidenceTitle && !isBadFactoryStoryTitle(evidenceTitle)
      ? evidenceTitle
      : seedTitle && !isBadFactoryStoryTitle(seedTitle)
        ? seedTitle
        : parsedTitle && !isBadFactoryStoryTitle(parsedTitle)
          ? parsedTitle
          : evidenceTitle || 'Chi Tiết Bị Đặt Sai'

  return {
    title: chosen,
    changed: normalizeFactoryTitleText(chosen) !== normalizeFactoryTitleText(seedTitle || parsedTitle),
    original: seedTitle || parsedTitle,
    evidenceTitle,
  }
}

function normalizeDescriptionForCheck(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s/:-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function compactPublicDescription(input: string, maxLength = 520) {
  const normalized = String(input || '').replace(/\s+/g, ' ').trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength).trim()}...`
}

function isInternalFactoryDescription(input: string) {
  const normalized = normalizeDescriptionForCheck(input)

  if (!normalized) return true

  return [
    'nu chinh thuoc kieu',
    'truyen phai uu tien drama lane',
    'drama lane',
    'khoa the loai da chon',
    'genre lock',
    'core premise',
    'story seed',
    'factory seed',
    'opening scene bat buoc',
    'inciting incident',
    'evidence object',
    'main conflict',
    'hidden truth',
    'villain type',
    'heroine arc',
    'power structure',
    'short fingerprint',
    'drama balance',
  ].some((marker) => normalized.includes(marker))
}

function buildCleanFactoryStoryDescription(params: {
  parsedDescription: string
  publicDescription: string
  storySeed?: FactoryStorySeed | null
}) {
  const candidates = [
    params.publicDescription,
    params.parsedDescription,
  ]

  for (const candidate of candidates) {
    const clean = compactPublicDescription(candidate)
    if (clean && clean.length >= 60 && !isInternalFactoryDescription(clean)) {
      return clean
    }
  }

  const storySeed = params.storySeed
  const openingScene = compactPublicDescription(storySeed?.openingScene || 'một biến cố bất ngờ', 120)
  const evidenceObject = compactPublicDescription(storySeed?.evidenceObject || 'một vật chứng bị che giấu', 120)
  const hiddenTruth = compactPublicDescription(storySeed?.hiddenTruth || 'sự thật phía sau những lời nói dối', 180)

  return compactPublicDescription(
    `Một biến cố tại ${openingScene} khiến ${evidenceObject} xuất hiện sai thời điểm, kéo nữ chính vào cuộc đối đầu với những người đang cố che giấu sự thật. Từ một điểm bất thường nhỏ, cô phải bình tĩnh gom chứng cứ, bảo vệ điều quan trọng nhất và từng bước lật lại ${hiddenTruth}.`,
  )
}


function buildFactoryStorySlug(title: string, suffix: string) {
  const base =
    safeString(title)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 70) || 'truyen-ai'

  const cleanSuffix =
    safeString(suffix)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 18) || makeId().slice(0, 6)

  return `${base}-${cleanSuffix}`
}

function normalizeCategoryText(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function uniqueSlugs(items: string[]) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const item of items) {
    const clean = String(item || '').trim()
    if (!clean || seen.has(clean)) continue
    seen.add(clean)
    result.push(clean)
  }

  return result
}

function getPreferredPublicGenreSlugs(params: {
  genreLabel: string
  storySeed?: FactoryStorySeed | null
}) {
  const source = normalizeCategoryText([
    params.genreLabel,
    params.storySeed?.genreBlend?.join(' '),
    params.storySeed?.corePremise,
    params.storySeed?.setting,
    params.storySeed?.evidenceObject,
    params.storySeed?.mainConflict,
    params.storySeed?.hiddenTruth,
    params.storySeed?.publicPressure,
  ].filter(Boolean).join(' | '))

  const slugs: string[] = []

  const add = (...items: string[]) => {
    slugs.push(...items)
  }

  if (source.includes('tai sinh') || source.includes('trong sinh') || source.includes('lam lai cuoc doi')) {
    add('trong-sinh')
  }

  if (source.includes('xuyen khong')) {
    add('xuyen-khong')
  }

  if (
    source.includes('showbiz') ||
    source.includes('hot search') ||
    source.includes('livestream') ||
    source.includes('idol') ||
    source.includes('kol') ||
    source.includes('phim truong') ||
    source.includes('hop bao') ||
    source.includes('truyen thong') ||
    source.includes('pr scandal')
  ) {
    add('showbiz', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('thuong chien') ||
    source.includes('co phan') ||
    source.includes('hoi dong') ||
    source.includes('ngan hang') ||
    source.includes('tai chinh') ||
    source.includes('startup') ||
    source.includes('doanh nghiep') ||
    source.includes('tong tai')
  ) {
    add('thuong-chien', 'nu-cuong', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('hao mon') ||
    source.includes('gia toc') ||
    source.includes('biet thu') ||
    source.includes('me chong') ||
    source.includes('nha chong') ||
    source.includes('di chuc') ||
    source.includes('thua ke') ||
    source.includes('lien hon') ||
    source.includes('thien kim')
  ) {
    add('hao-mon', 'gia-dau', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('hon nhan') ||
    source.includes('ngoai tinh') ||
    source.includes('tieu tam') ||
    source.includes('ly hon') ||
    source.includes('chong cu') ||
    source.includes('dam cuoi') ||
    source.includes('hon le') ||
    source.includes('hon uoc') ||
    source.includes('hon the') ||
    source.includes('cuoi')
  ) {
    add('hon-nhan', 'ngoai-tinh', 'hao-mon', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('me con') ||
    source.includes('quyen nuoi') ||
    source.includes('me don than') ||
    source.includes('bao mau') ||
    source.includes('con nho') ||
    source.includes('dua tre')
  ) {
    add('me-con', 'gia-dinh', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('than the') ||
    source.includes('adn') ||
    source.includes('dna') ||
    source.includes('con ruot') ||
    source.includes('con nuoi') ||
    source.includes('nhan nuoi') ||
    source.includes('song sinh') ||
    source.includes('co nhi vien') ||
    source.includes('trao than phan') ||
    source.includes('nguoi thua ke that lac')
  ) {
    add('bi-mat-than-the', 'than-the', 'hao-mon', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('phap ly') ||
    source.includes('luat su') ||
    source.includes('toa an') ||
    source.includes('don to cao') ||
    source.includes('canh sat') ||
    source.includes('kien') ||
    source.includes('thang kien')
  ) {
    add('phap-ly', 'nu-cuong', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('benh vien') ||
    source.includes('benh an') ||
    source.includes('khoa san') ||
    source.includes('phong kham') ||
    source.includes('xet nghiem') ||
    source.includes('thai san') ||
    source.includes('kham thai')
  ) {
    add('benh-vien', 'bi-mat-than-the', 'me-con', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('khach san') ||
    source.includes('resort') ||
    source.includes('san bay') ||
    source.includes('du thuyen') ||
    source.includes('mat tich') ||
    source.includes('tro ve')
  ) {
    add('tra-thu', 'bi-mat-than-the', 'hien-dai', 'ngon-tinh')
  }

  if (
    source.includes('tra thu') ||
    source.includes('va mat') ||
    source.includes('phan don') ||
    source.includes('lat mat') ||
    source.includes('boc phot') ||
    source.includes('minh oan')
  ) {
    add('tra-thu', 'nu-cuong', 'hien-dai', 'ngon-tinh')
  }

  add('hien-dai', 'ngon-tinh')

  return uniqueSlugs(slugs)
}

async function resolvePublicGenreSlugs(params: {
  genreLabel: string
  storySeed?: FactoryStorySeed | null
}) {
  const preferredSlugs = getPreferredPublicGenreSlugs(params)

  const categoryResult = await supabase
    .from('categories')
    .select('slug')

  if (categoryResult.error) {
    return preferredSlugs.slice(0, 2)
  }

  const availableSlugs = (categoryResult.data ?? [])
    .map((item: any) => String(item?.slug || '').trim())
    .filter(Boolean)

  if (!availableSlugs.length) {
    return preferredSlugs.slice(0, 2)
  }

  const availableSet = new Set(availableSlugs)
  const matched = preferredSlugs.filter((slug) => availableSet.has(slug))

  if (matched.length) {
    return matched.slice(0, 2)
  }

  if (availableSet.has('hien-dai')) return ['hien-dai']
  if (availableSet.has('ngon-tinh')) return ['ngon-tinh']

  return [availableSlugs[0]]
}

const STORY_SEED_MAX_ATTEMPTS = 10

export default function AIFactoryPanel() {
  const stopRequestedRef = useRef(false)

  const [config, setConfig] = useState<AIFactoryConfig>(defaultConfig)
  const [selectedGenres, setSelectedGenres] = useState<FactoryGenreOption[]>(DEFAULT_FACTORY_GENRES)
  const [selectedHeroines, setSelectedHeroines] =
    useState<FactoryHeroineOption[]>(DEFAULT_HEROINE_OPTIONS)

  const [existingStories, setExistingStories] = useState<ExistingStory[]>([])
  const [avoidLibrary, setAvoidLibrary] = useState<AvoidLibrary>({
    titles: [],
    motifs: [],
    characterNames: [],
    companyNames: [],
    motifFingerprints: [],
    motifTexts: [],
  })

  const [jobs, setJobs] = useState<FactoryJob[]>([])
  const [logs, setLogs] = useState<FactoryLog[]>([])
  const [status, setStatus] = useState<FactoryStatus>('idle')
  const [currentAction, setCurrentAction] = useState('Chưa chạy')
  const [openaiConfirmed, setOpenaiConfirmed] = useState(false)
  const [factoryMode, setFactoryMode] = useState<FactoryMode>('create-new')
  const [continueStoryLimit, setContinueStoryLimit] = useState(5)
  const [continueChaptersPerStory, setContinueChaptersPerStory] = useState(3)
  const [continueStatusFilter, setContinueStatusFilter] = useState<ContinueStatusFilter>('draft')
  const [selectedContinueStoryId, setSelectedContinueStoryId] = useState('auto')
  const [expensiveModelConfirmed, setExpensiveModelConfirmed] = useState(false)
  const [incompleteStories, setIncompleteStories] = useState<IncompleteStory[]>([])

  const isRunning = status === 'running'

  const safeBatchSize = Number.isFinite(config.batchSize) && config.batchSize > 0 ? config.batchSize : 5
  const averageTargetChapters = Math.round(
    (config.minTargetChapters + config.maxTargetChapters) / 2,
  )
  const createNewTextRequests = config.autoCompleteByTarget
    ? config.storyCount * averageTargetChapters
    : config.storyCount * config.chaptersToGenerateNow
  const selectedContinueStoryCount = selectedContinueStoryId === 'auto' ? Math.max(1, continueStoryLimit) : 1
  const totalTextRequests =
    factoryMode === 'create-new'
      ? createNewTextRequests
      : selectedContinueStoryCount * Math.max(1, continueChaptersPerStory)
  const totalCoverRequests = factoryMode === 'create-new' && config.generateCover ? config.storyCount : 0
  const totalRequests = totalTextRequests + totalCoverRequests
  const totalBatches = Math.ceil(config.storyCount / safeBatchSize)
  const expensiveModelRequiresConfirmation =
    config.provider === 'openai' && (config.modelKey === 'premium' || config.modelKey === 'auto')

  const canStart =
    !isRunning &&
    (factoryMode === 'create-new'
      ? selectedGenres.length > 0 && selectedHeroines.length > 0
      : true) &&
    (config.provider === 'mock' || openaiConfirmed) &&
    (!expensiveModelRequiresConfirmation || expensiveModelConfirmed)

  const progressText = useMemo(() => {
    if (!jobs.length) return '0%'
    const done = jobs.filter((job) => ['success', 'failed', 'stopped'].includes(job.status)).length
    return `${Math.round((done / jobs.length) * 100)}%`
  }, [jobs])

  useEffect(() => {
    const raw = localStorage.getItem(AI_FACTORY_STORAGE_KEY)
    if (!raw) return

    try {
      const snapshot = JSON.parse(raw) as FactoryRunSnapshot
      if (snapshot.config) {
        setConfig({
          ...defaultConfig,
          ...snapshot.config,
          coverArtStyle: normalizeCoverArtStyle((snapshot.config as any).coverArtStyle),
          coverCompositionPreset: normalizeCoverCompositionPreset(
            (snapshot.config as any).coverCompositionPreset,
          ),
          autoCompleteByTarget: Boolean((snapshot.config as any).autoCompleteByTarget),
        })
      }
      if (Array.isArray(snapshot.jobs)) setJobs(snapshot.jobs)
      if (Array.isArray(snapshot.logs)) setLogs(snapshot.logs)
      if (snapshot.status && snapshot.status !== 'running') setStatus(snapshot.status)
    } catch {
      // ignore broken localStorage
    }
  }, [])

  useEffect(() => {
    const snapshot: FactoryRunSnapshot = {
      config,
      jobs,
      logs,
      status,
      finishedAt: status === 'running' ? undefined : new Date().toISOString(),
    }

    localStorage.setItem(AI_FACTORY_STORAGE_KEY, JSON.stringify(snapshot))
  }, [config, jobs, logs, status])

  function addLog(message: string, type: FactoryLog['type'] = 'info') {
    setLogs((prev) => [
      {
        id: makeId('log'),
        time: getLogTime(),
        message,
        type,
      },
      ...prev,
    ])
  }

  function updateJob(jobId: string, patch: Partial<FactoryJob>) {
    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, ...patch } : job)))
  }

  function updateConfig<K extends keyof AIFactoryConfig>(key: K, value: AIFactoryConfig[K]) {
    if (key === 'modelKey' || key === 'provider') {
      setExpensiveModelConfirmed(false)
    }

    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  async function uploadCoverToStorage(params: {
    storyId: string
    storySlug: string
    fileBlob: Blob
  }) {
    const filePath = `ai-factory/${params.storyId}/${Date.now()}-${params.storySlug}.png`

    const uploadResult = await supabase.storage
      .from('story-covers')
      .upload(filePath, params.fileBlob, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadResult.error) {
      throw new Error(`Upload cover lỗi: ${uploadResult.error.message}`)
    }

    const publicUrlResult = supabase.storage.from('story-covers').getPublicUrl(filePath)
    const publicUrl = publicUrlResult.data?.publicUrl

    if (!publicUrl) {
      throw new Error('Không lấy được public URL của cover.')
    }

    return publicUrl
  }

  async function updateStoryCover(params: {
    storyId: string
    coverUrl: string
  }) {
    const updateBoth = await supabase
      .from('stories')
      .update({
        cover_image: params.coverUrl,
        cover_url: params.coverUrl,
      })
      .eq('id', params.storyId)

    if (!updateBoth.error) return

    const updateCoverImage = await supabase
      .from('stories')
      .update({
        cover_image: params.coverUrl,
      })
      .eq('id', params.storyId)

    if (!updateCoverImage.error) return

    const updateCoverUrl = await supabase
      .from('stories')
      .update({
        cover_url: params.coverUrl,
      })
      .eq('id', params.storyId)

    if (!updateCoverUrl.error) return

    throw new Error(
      `Update story cover lỗi: ${updateBoth.error.message} | ${updateCoverImage.error.message} | ${updateCoverUrl.error.message}`,
    )
  }


  async function embedMotifTexts(texts: string[]) {
    const cleanTexts = texts.map((text) => text.trim()).filter(Boolean)

    if (!cleanTexts.length) return []

    const response = await fetch('/api/ai/embed-motif', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: cleanTexts }),
    })

    const rawText = await response.text()
    let data: any = null

    try {
      data = rawText ? JSON.parse(rawText) : null
    } catch {
      throw new Error(
        `Embed motif trả về không phải JSON. Status: ${response.status}. Preview: ${rawText.slice(0, 180)}`,
      )
    }

    if (!response.ok) {
      throw new Error(data?.error || `Embed motif lỗi HTTP ${response.status}`)
    }

    const embeddings = Array.isArray(data?.embeddings) ? data.embeddings : []

    return embeddings.filter(Array.isArray) as number[][]
  }

  async function evaluateStorySeedMotif(params: {
    seed: FactoryStorySeed
    existingMotifs: StoryMotifRegistryItem[]
    provider: AIFactoryConfig['provider']
  }) {
    const enrichedSeed = attachMotifToSeed(params.seed)

    const candidate: StoryMotifRegistryItem = {
      title: enrichedSeed.title,
      fingerprint: enrichedSeed.motifFingerprint!,
      motifText: enrichedSeed.motifText || enrichedSeed.shortFingerprint,
      source: 'generated',
    }

    const comparisonPool = params.existingMotifs.slice(0, 40)

    if (params.provider === 'openai' && comparisonPool.length > 0) {
      try {
        const textsToEmbed = [
          candidate.motifText,
          ...comparisonPool.map((item) => item.motifText).filter(Boolean),
        ]

        const embeddings = await embedMotifTexts(textsToEmbed)

        candidate.embedding = embeddings[0]

        comparisonPool.forEach((item, index) => {
          if (!item.embedding && embeddings[index + 1]) {
            item.embedding = embeddings[index + 1]
          }
        })

        enrichedSeed.motifEmbedding = candidate.embedding
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        addLog(`Embedding motif lỗi, fallback sang field similarity: ${message}`, 'warning')
      }
    }

    const rejectResult = shouldRejectMotif({
      candidate,
      existing: comparisonPool,
      threshold: 0.62,
    })

    enrichedSeed.motifSimilarity = rejectResult.best

    return {
      seed: enrichedSeed,
      candidate,
      rejectResult,
    }
  }

  async function buildUniqueStorySeed(params: {
    genreLabel: string
    heroineLabel: string
    avoidLibrary: AvoidLibrary
    factoryRunId: string
    storyIndex: number
    premiseSeed: string
    provider: AIFactoryConfig['provider']
  }) {
    const existingMotifs = params.avoidLibrary.motifFingerprints || []
    let lastRejected: Awaited<ReturnType<typeof evaluateStorySeedMotif>> | null = null
    const rejectedHints: string[] = []

    for (let attempt = 1; attempt <= STORY_SEED_MAX_ATTEMPTS; attempt += 1) {
      const retryHint = rejectedHints.slice(-3).join('__avoid__')
      const rawSeed = buildMockStorySeed({
        genreLabel: params.genreLabel,
        heroineLabel: params.heroineLabel,
        avoidLibrary: params.avoidLibrary,
        seed: `${params.factoryRunId}-${params.storyIndex}-${params.premiseSeed}-motif-${attempt}-${retryHint}`,
      })

      const evaluated = await evaluateStorySeedMotif({
        seed: rawSeed,
        existingMotifs,
        provider: params.provider,
      })

      if (!evaluated.rejectResult.reject) {
        if (evaluated.rejectResult.best) {
          addLog(
            `Motif check pass attempt ${attempt}/${STORY_SEED_MAX_ATTEMPTS}: ${formatMotifSimilarityForLog(evaluated.rejectResult.best)}`,
            'success',
          )
        } else {
          addLog(
            `Motif check pass attempt ${attempt}/${STORY_SEED_MAX_ATTEMPTS}: chưa có motif cũ đủ dữ liệu để so.`,
            'success',
          )
        }

        return evaluated.seed
      }

      lastRejected = evaluated

      const best = evaluated.rejectResult.best
      const fingerprint = evaluated.seed.motifFingerprint
      rejectedHints.push(
        [
          best?.item?.title || 'unknown-title',
          fingerprint?.openingArena,
          fingerprint?.mainArena,
          fingerprint?.villainAttackType,
          fingerprint?.heroineCounterType,
          fingerprint?.powerStructure,
          fingerprint?.publicPressure,
          fingerprint?.deadlineStyle,
        ]
          .filter(Boolean)
          .join('|'),
      )

      addLog(
        `Reject story seed attempt ${attempt}/${STORY_SEED_MAX_ATTEMPTS} vì motif quá giống: ${formatMotifSimilarityForLog(
          evaluated.rejectResult.best,
        )}`,
        'warning',
      )
    }

    throw new Error(
      `Không tạo được story seed đủ khác motif sau ${STORY_SEED_MAX_ATTEMPTS} lần. ${
        lastRejected?.rejectResult.best
          ? formatMotifSimilarityForLog(lastRejected.rejectResult.best)
          : ''
      }`,
    )
  }

  async function scanExistingStories() {
    setCurrentAction('Đang quét kho truyện...')
    addLog('Quét kho truyện gần nhất từ Supabase...')

    const extendedSelect =
      'id, title, description, genres, story_dna, story_memory, completion_status, target_chapters, created_at'

    let result: {
      data: ExistingStory[] | null
      error: { message: string } | null
    } = await supabase
      .from('stories')
      .select(extendedSelect)
      .order('created_at', { ascending: false })
      .limit(100)

    if (result.error) {
      addLog(`Select mở rộng lỗi, thử select tối thiểu: ${result.error.message}`, 'warning')

      const fallbackResult = await supabase
        .from('stories')
        .select('id, title, description, genres, created_at')
        .order('created_at', { ascending: false })
        .limit(100)

      result = {
        data: (fallbackResult.data ?? []) as ExistingStory[],
        error: fallbackResult.error,
      }
    }

    if (result.error) {
      addLog(`Không quét được kho truyện: ${result.error.message}`, 'error')
      setCurrentAction('Quét kho truyện thất bại')
      return {
        stories: [] as ExistingStory[],
        avoid: {
          titles: [],
          motifs: [],
          characterNames: [],
          companyNames: [],
          motifFingerprints: [],
          motifTexts: [],
        } satisfies AvoidLibrary,
      }
    }

    const stories = (result.data ?? []) as ExistingStory[]
    const motifItems = extractMotifRegistryItemsFromStories(stories)
    const avoid = {
      ...buildAvoidLibrary(stories),
      motifFingerprints: motifItems,
      motifTexts: motifItems.map((item) => item.motifText).filter(Boolean),
    }

    setExistingStories(stories)
    setAvoidLibrary(avoid)

    addLog(
      `Đã quét ${stories.length} truyện. Gom ${avoid.titles.length} title, ${avoid.motifs.length} motif, ${motifItems.length} motif DNA.`,
      'success',
    )

    setCurrentAction('Đã quét xong kho truyện')

    return { stories, avoid }
  }

  async function generateChapter(params: {
    provider: AIFactoryConfig['provider']
    modelKey: AIFactoryConfig['modelKey']
    storyTitle: string
    storyDescription: string
    genreLabel: string
    heroineLabel: string
    chapterNumber: number
    targetChapters: number
    isFinalChapter?: boolean
    recentChapters: Array<{
      chapter_number: number
      title: string
      content: string
      summary?: string
    }>
    storyMemory: string
    factoryPromptIdea: string
    runShortId: string
    storySeed?: FactoryStorySeed | null
  }) {
    if (params.provider === 'mock') {
      await sleep(500)
      return buildMockChapterOutput({
        chapterNumber: params.chapterNumber,
        genreLabel: params.genreLabel,
        heroineLabel: params.heroineLabel,
        runShortId: params.runShortId,
      })
    }

    const finalChapterInstruction = params.isFinalChapter
      ? `
ĐÂY LÀ CHƯƠNG CUỐI CỦA TRUYỆN.

Yêu cầu bắt buộc:
- Đây là chương ${params.chapterNumber}/${params.targetChapters}, phải kết thúc toàn bộ truyện.
- Phải giải quyết xung đột chính.
- Phải trả giá/payoff các bí mật, bằng chứng, mâu thuẫn đã cài từ các chương trước.
- Phản diện phải nhận hậu quả rõ ràng.
- Nữ chính phải có kết cục rõ ràng.
- Không mở thêm tuyến truyện mới.
- Không tạo cliffhanger giả.
- Không kết bằng kiểu "mọi chuyện chỉ mới bắt đầu".
- Kết chương phải cho độc giả cảm giác truyện đã hoàn thành.
- Trong bản kỹ thuật ghi completion_status = full.
`
      : `
Đây chưa phải chương cuối.
Vị trí hiện tại: chương ${params.chapterNumber}/${params.targetChapters}.
Yêu cầu:
- Không kết thúc toàn bộ truyện quá sớm.
- Không cho phản diện sụp đổ hoàn toàn quá sớm.
- Vẫn phải giữ mạch để đọc tiếp chương sau.
- Trong bản kỹ thuật ghi completion_status = ongoing.
`

    const payload = {
      mode: 'chapter',
      provider: params.provider,
      modelKey: params.modelKey,
      moduleId: 'female-urban-viral',
      title: params.storyTitle,
      storySummary: params.storyDescription,
      promptIdea: [
        params.chapterNumber === 1 ? params.factoryPromptIdea : '',
        params.isFinalChapter ? finalChapterInstruction : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
      genreLabel: params.genreLabel,
      mainCharacterStyleLabel: params.heroineLabel,
      chapterLengthLabel: config.chapterLengthLabel,
      cliffhangerLabel: config.cliffhangerLabel,
      humiliationLevel: randomInt(3, 5),
      revengeIntensity: randomInt(3, 5),
      nextChapterNumber: params.chapterNumber,
      targetChapters: params.targetChapters,
      isFinalChapter: Boolean(params.isFinalChapter),
      storySeed: params.storySeed ?? null,
      recentChapters: params.recentChapters,
      storyMemory: [params.storyMemory, finalChapterInstruction].filter(Boolean).join('\n\n---\n\n'),
    }

    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.error || data?.message || 'OpenAI generate request failed')
    }

    const text = data?.text || data?.output_text || data?.content

    if (!text || typeof text !== 'string') {
      throw new Error('API không trả về text hợp lệ.')
    }

    return text
  }

  async function insertStoryDraft(params: {
    parsed: ParsedChapterOutput
    genre: FactoryGenreOption
    heroine: FactoryHeroineOption
    config: AIFactoryConfig
    factoryRunId: string
    storyIndex: number
    targetChapters: number
    technicalReport: string
    premiseSeed: string
    nameSeed: string
    storySeed?: FactoryStorySeed | null
  }) {
    const generatedChaptersNow = params.config.autoCompleteByTarget
      ? params.targetChapters
      : params.config.chaptersToGenerateNow

    const storyDna = {
      source: 'ai-factory',
      factory_run_id: params.factoryRunId,
      story_index: params.storyIndex,
      genre_key: params.genre.key,
      genre_label: params.genre.label,
      genre_slug: params.genre.slug,
      heroine_style_key: params.heroine.key,
      heroine_style_label: params.heroine.label,
      model_key: params.config.modelKey,
      module_id: 'female-urban-viral',
      target_chapters: params.targetChapters,
      factory_seed: params.storySeed ?? null,
      motifFingerprint: params.storySeed?.motifFingerprint ?? null,
      motifText: params.storySeed?.motifText ?? null,
      motifEmbedding: params.storySeed?.motifEmbedding ?? null,
      motifSimilarity: params.storySeed?.motifSimilarity ?? null,
      generated_chapters_now: generatedChaptersNow,
      auto_complete_by_target: params.config.autoCompleteByTarget,
      chapter_length_label: params.config.chapterLengthLabel,
      cliffhanger_type_key: 'auto',
      humiliation_level: 'random_3_5',
      revenge_intensity: 'random_3_5',
      premise_seed: params.premiseSeed,
      name_seed: params.nameSeed,
      avoid_context_used: {
        titles_count: avoidLibrary.titles.length,
        motifs_count: avoidLibrary.motifs.length,
        character_names_count: avoidLibrary.characterNames.length,
        company_names_count: avoidLibrary.companyNames.length,
        motif_fingerprints_count: avoidLibrary.motifFingerprints?.length ?? 0,
        motif_texts_count: avoidLibrary.motifTexts?.length ?? 0,
      },
      character_names: [],
      company_names: [],
    }

    const publicGenreSlugs = await resolvePublicGenreSlugs({
      genreLabel: params.genre.label,
      storySeed: params.storySeed,
    })
    const finalStoryTitle = safeString(params.parsed.storyTitle) || params.storySeed?.title || 'Truyện AI'
    const finalStorySlug = buildFactoryStorySlug(
      finalStoryTitle,
      `${params.factoryRunId}-${params.storyIndex}`,
    )

    const fullPayload = {
      title: finalStoryTitle,
      slug: finalStorySlug,
      description: params.parsed.storyDescription,
      author: 'Sưu Tầm',
      status: params.config.storyStatus,
      completion_status: 'ongoing',
      target_chapters: params.targetChapters,
      genres: publicGenreSlugs,
      story_dna: storyDna,
      story_memory: params.technicalReport,
      current_arc: 'Factory draft — chapter 1 generated',
      emotion_tags: [params.genre.label, params.heroine.label],
    }

    let result = await supabase.from('stories').insert(fullPayload).select('id, title, slug').single()

    if (result.error) {
      addLog(`Insert story mở rộng lỗi, thử insert tối thiểu: ${result.error.message}`, 'warning')

      result = await supabase
        .from('stories')
        .insert({
          title: finalStoryTitle,
          slug: finalStorySlug,
          description: params.parsed.storyDescription,
          author: 'Sưu Tầm',
          status: params.config.storyStatus,
          genres: publicGenreSlugs,
        })
        .select('id, title, slug')
        .single()
    }

    if (result.error || !result.data?.id) {
      throw new Error(result.error?.message || 'Không insert được story draft.')
    }

    return result.data as { id: string; title: string; slug: string }
  }

  async function insertChapterDraft(params: {
    storyId: string
    parsed: ParsedChapterOutput
    chapterNumber: number
    status: 'draft'
  }) {
    let result = await supabase
      .from('chapters')
      .insert({
        story_id: params.storyId,
        title: params.parsed.chapterTitle,
        slug: params.parsed.chapterSlug,
        content: params.parsed.readerOnly,
        summary: buildPublicChapterSummary(params.parsed.readerOnly),
        chapter_number: params.chapterNumber,
        status: params.status,
      })
      .select('id, title, chapter_number')
      .single()

    if (result.error) {
      addLog(`Insert chapter có status lỗi, thử bỏ status: ${result.error.message}`, 'warning')

      result = await supabase
        .from('chapters')
        .insert({
          story_id: params.storyId,
          title: params.parsed.chapterTitle,
          slug: params.parsed.chapterSlug,
          content: params.parsed.readerOnly,
          summary: buildPublicChapterSummary(params.parsed.readerOnly),
          chapter_number: params.chapterNumber,
        })
        .select('id, title, chapter_number')
        .single()
    }

    if (result.error || !result.data?.id) {
      throw new Error(result.error?.message || 'Không insert được chapter draft.')
    }

    return result.data as { id: string; title: string; chapter_number: number }
  }

  async function generateAndAttachCover(params: {
    storyId: string
    storyTitle: string
    storySlug: string
    storyDescription: string
    genreLabel: string
    heroineLabel: string
    storySeed?: FactoryStorySeed | null
  }) {
    const response = await fetch('/api/ai/generate-cover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'openai',
        modelKey: config.modelKey,
        title: params.storyTitle,
        storySummary: params.storyDescription,
        genreLabel: params.genreLabel,
        heroineLabel: params.heroineLabel,
        story_dna: params.storySeed
          ? {
              ...params.storySeed,
              factory_seed: params.storySeed,
              motifFingerprint: params.storySeed.motifFingerprint ?? null,
              motifText: params.storySeed.motifText ?? null,
              coverConcept: (params.storySeed as any).coverConcept ?? null,
              coverArtStyle: normalizeCoverArtStyle(config.coverArtStyle),
              coverCompositionPreset: normalizeCoverCompositionPreset(config.coverCompositionPreset),
            }
          : {
              coverArtStyle: normalizeCoverArtStyle(config.coverArtStyle),
              coverCompositionPreset: normalizeCoverCompositionPreset(config.coverCompositionPreset),
            },
        story: {
          id: params.storyId,
          title: params.storyTitle,
          slug: params.storySlug,
          summary: params.storyDescription,
          genreLabel: params.genreLabel,
          tags: [params.genreLabel, params.heroineLabel].filter(Boolean),
          coverArtStyle: normalizeCoverArtStyle(config.coverArtStyle),
          coverCompositionPreset: normalizeCoverCompositionPreset(config.coverCompositionPreset),
          story_dna: params.storySeed
            ? {
                ...params.storySeed,
                factory_seed: params.storySeed,
                motifFingerprint: params.storySeed.motifFingerprint ?? null,
                motifText: params.storySeed.motifText ?? null,
                coverConcept: (params.storySeed as any).coverConcept ?? null,
                coverArtStyle: normalizeCoverArtStyle(config.coverArtStyle),
                coverCompositionPreset: normalizeCoverCompositionPreset(config.coverCompositionPreset),
              }
            : {
                coverArtStyle: normalizeCoverArtStyle(config.coverArtStyle),
                coverCompositionPreset: normalizeCoverCompositionPreset(config.coverCompositionPreset),
              },
        },
        cover_art_style: normalizeCoverArtStyle(config.coverArtStyle),
        visual_style: normalizeCoverArtStyle(config.coverArtStyle),
        style: normalizeCoverArtStyle(config.coverArtStyle),
        styleLabel: getCoverArtStyleLabel(config.coverArtStyle),
        cover_composition_preset: normalizeCoverCompositionPreset(config.coverCompositionPreset),
        compositionPreset: normalizeCoverCompositionPreset(config.coverCompositionPreset),
        compositionLabel: getCoverCompositionPresetLabel(config.coverCompositionPreset),
        aspectRatio: '2:3',
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.error || data?.message || 'Generate cover API failed.')
    }

    if (data?.publicUrl && typeof data.publicUrl === 'string') {
      await updateStoryCover({
        storyId: params.storyId,
        coverUrl: data.publicUrl,
      })
      return data.publicUrl as string
    }

    if (data?.imageUrl && typeof data.imageUrl === 'string') {
      await updateStoryCover({
        storyId: params.storyId,
        coverUrl: data.imageUrl,
      })
      return data.imageUrl as string
    }

    let imageBlob: Blob | null = null

    if (data?.b64_json && typeof data.b64_json === 'string') {
      imageBlob = base64ToBlob(data.b64_json, 'image/png')
    } else if (data?.dataUrl && typeof data.dataUrl === 'string') {
      imageBlob = dataUrlToBlob(data.dataUrl)
    }

    if (!imageBlob) {
      throw new Error('API cover không trả imageUrl/publicUrl/b64_json/dataUrl hợp lệ.')
    }

    const publicUrl = await uploadCoverToStorage({
      storyId: params.storyId,
      storySlug: params.storySlug,
      fileBlob: imageBlob,
    })

    await updateStoryCover({
      storyId: params.storyId,
      coverUrl: publicUrl,
    })

    return publicUrl
  }

  async function scanIncompleteStories() {
    setCurrentAction('Đang quét truyện dang dở...')
    addLog('Quét truyện chưa đủ số chương mục tiêu...')

    let query = supabase
      .from('stories')
      .select(
        'id, title, slug, description, status, completion_status, target_chapters, genres, story_dna, story_memory, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(100)

    if (continueStatusFilter !== 'all') {
      query = query.eq('status', continueStatusFilter)
    }

    const storiesResult = await query

    if (storiesResult.error) {
      addLog(`Không quét được truyện dang dở: ${storiesResult.error.message}`, 'error')
      setCurrentAction('Quét truyện dang dở thất bại')
      setIncompleteStories([])
      return [] as IncompleteStory[]
    }

    const storyRows = (storiesResult.data ?? []) as ExistingStory[]
    const incomplete: IncompleteStory[] = []

    for (const story of storyRows) {
      const storyId = (story as any).id
      if (!storyId) continue

      const chaptersResult = await supabase
        .from('chapters')
        .select('id, story_id, title, slug, content, summary, chapter_number, created_at')
        .eq('story_id', storyId)
        .order('chapter_number', { ascending: true })

      if (chaptersResult.error) {
        addLog(`Không đọc được chapters của ${story.title}: ${chaptersResult.error.message}`, 'warning')
        continue
      }

      const chapters = (chaptersResult.data ?? []) as ExistingChapterRow[]
      const targetChapters = getTargetChapters(story, config.maxTargetChapters)
      const currentChapters = chapters.length
      const maxChapterNumber = chapters.reduce((max, chapter, index) => {
        const chapterNumber = Number(chapter.chapter_number ?? index + 1)
        return Number.isFinite(chapterNumber) ? Math.max(max, chapterNumber) : max
      }, 0)
      const missingChapters = Math.max(0, targetChapters - currentChapters)

      if (missingChapters > 0) {
        incomplete.push({
          ...(story as any),
          targetChapters,
          currentChapters,
          missingChapters,
          nextChapterNumber: maxChapterNumber + 1,
          chapters,
        })
      }
    }

    setIncompleteStories(incomplete)
    setCurrentAction(`Đã quét ${incomplete.length} truyện dang dở`)
    addLog(`Tìm thấy ${incomplete.length} truyện chưa hoàn thành.`, incomplete.length ? 'success' : 'warning')

    incomplete.slice(0, 10).forEach((story) => {
      const progress = getFactoryChapterProgress({
        currentChapters: story.currentChapters,
        targetChapters: story.targetChapters,
        maxCreateNow: continueChaptersPerStory,
      })

      addLog(
        `${story.title || 'Truyện chưa có tên'}: ${progress.progressLabel} chương, ${progress.remainingLabel}. ${progress.createRangeLabel}.`,
        progress.isFull ? 'info' : 'success',
      )
    })

    return incomplete
  }

  async function continueExistingStories() {
    stopRequestedRef.current = false
    setStatus('running')
    setCurrentAction('Chuẩn bị viết tiếp truyện dang dở')
    setLogs([])

    addLog(
      selectedContinueStoryId === 'auto'
        ? `Factory sẽ viết tiếp tối đa ${continueStoryLimit} truyện, mỗi truyện thêm tối đa ${continueChaptersPerStory} chương.`
        : `Factory sẽ viết tiếp truyện đã chọn, thêm tối đa ${continueChaptersPerStory} chương.`,
      'info',
    )

    try {
      const scannedStories = await scanIncompleteStories()
      const candidates =
        selectedContinueStoryId === 'auto'
          ? scannedStories.slice(0, Math.max(1, continueStoryLimit))
          : scannedStories.filter((story) => String((story as any).id) === selectedContinueStoryId)

      if (!candidates.length) {
        setStatus('success')
        setCurrentAction('Không có truyện dang dở cần viết tiếp')
        addLog(
          selectedContinueStoryId === 'auto'
            ? 'Không có truyện nào thiếu chương theo target.'
            : 'Truyện đã chọn không còn thiếu chương hoặc không tìm thấy trong danh sách scan.',
          'warning',
        )
        setJobs([])
        return
      }

      const initialJobs: FactoryJob[] = candidates.map((story, index) => ({
        id: makeId('job'),
        index: index + 1,
        title: story.title || 'Truyện chưa có tên',
        genreLabel: getStoryGenreLabel(story),
        genreSlug: Array.isArray((story as any).genres)
          ? String((story as any).genres[0] ?? '')
          : String((story as any).genres ?? ''),
        heroineLabel: getStoryHeroineLabel(story),
        status: 'pending',
        storyId: String((story as any).id),
        storySlug: String((story as any).slug || ''),
        chapterProgress: `${story.currentChapters}/${story.targetChapters}`,
        coverStatus: 'off',
        targetChapters: story.targetChapters,
        createdChapters: story.currentChapters,
        completionStatus: 'ongoing',
      }))

      setJobs(initialJobs)

      for (let storyIndex = 0; storyIndex < candidates.length; storyIndex += 1) {
        if (stopRequestedRef.current) {
          addLog('Đã nhận lệnh stop. Dừng trước truyện tiếp theo.', 'warning')
          break
        }

        const story = candidates[storyIndex]
        const job = initialJobs[storyIndex]
        const storyId = String((story as any).id)
        const storyTitle = story.title || 'Truyện chưa có tên'
        const genreLabel = getStoryGenreLabel(story)
        const heroineLabel = getStoryHeroineLabel(story)
        const chaptersToCreate = Math.min(
          Math.max(1, continueChaptersPerStory),
          story.missingChapters,
        )
        const continueProgress = getFactoryChapterProgress({
          currentChapters: story.currentChapters,
          targetChapters: story.targetChapters,
          maxCreateNow: chaptersToCreate,
        })
        let storyMemory =
          typeof (story as any).story_memory === 'string'
            ? (story as any).story_memory
            : safeJson((story as any).story_memory)
        const recentChapters = story.chapters.slice(-5).map((chapter, index) => ({
          chapter_number: Number(chapter.chapter_number ?? story.nextChapterNumber - 5 + index),
          title: chapter.title || `Chương ${chapter.chapter_number ?? index + 1}`,
          content: chapter.content || '',
          summary: chapter.summary || '',
        }))
        let nextChapterNumber = story.nextChapterNumber

        updateJob(job.id, {
          status: 'running',
          chapterProgress: `${story.currentChapters}/${story.targetChapters}`,
        })

        addLog(
          `Viết tiếp ${storyTitle}: ${continueProgress.progressLabel}, ${continueProgress.remainingLabel}. ${continueProgress.createRangeLabel}.`,
          'info',
        )

        try {
          for (let offset = 0; offset < chaptersToCreate; offset += 1) {
            if (stopRequestedRef.current) {
              updateJob(job.id, {
                status: 'stopped',
                chapterProgress: `${story.currentChapters + offset}/${story.targetChapters}`,
              })
              addLog(`Dừng sau request hiện tại tại truyện ${storyTitle}.`, 'warning')
              break
            }

            const isFinalChapter = nextChapterNumber >= story.targetChapters

            setCurrentAction(`${storyTitle}: generate chương ${nextChapterNumber}`)
            addLog(
              `${storyTitle}: generate chương ${nextChapterNumber}${isFinalChapter ? ' — chương cuối' : ''}...`,
            )

            let output = ''
            let parsed: ParsedChapterOutput | null = null
            let validationErrors: string[] = []

            for (let attempt = 1; attempt <= 2; attempt += 1) {
              output = await generateChapter({
                provider: config.provider,
                modelKey: config.modelKey,
                storyTitle,
                storyDescription: (story as any).description || '',
                genreLabel,
                heroineLabel,
                chapterNumber: nextChapterNumber,
                targetChapters: story.targetChapters,
                isFinalChapter,
                recentChapters,
                storyMemory,
                factoryPromptIdea: '',
                runShortId: `${storyId}-${nextChapterNumber}`,
              })

              parsed = parseChapterOutput({
                output,
                genreLabel,
                chapterNumber: nextChapterNumber,
                runShortId: `${storyId}-${nextChapterNumber}`,
              })

              const validation = validateChapterOutput({
                output,
                readerOnly: parsed.readerOnly,
                chapterNumber: nextChapterNumber,
                storyTitle,
              })

              if (validation.ok) {
                validationErrors = []
                break
              }

              validationErrors = validation.errors
              addLog(`Validate fail lần ${attempt}: ${validation.errors.join(' | ')}`, 'warning')
            }

            if (!parsed || validationErrors.length) {
              throw new Error(`Output không đạt validation: ${validationErrors.join(' | ')}`)
            }

            await insertChapterDraft({
              storyId,
              parsed,
              chapterNumber: nextChapterNumber,
              status: config.chapterStatus,
            })

            recentChapters.push({
              chapter_number: nextChapterNumber,
              title: parsed.chapterTitle,
              content: parsed.readerOnly,
              summary: buildPublicChapterSummary(parsed.readerOnly),
            })

            while (recentChapters.length > 5) recentChapters.shift()

            storyMemory = [storyMemory, parsed.technicalReport].filter(Boolean).join('\n\n---\n\n')

            await supabase
              .from('stories')
              .update({
                story_memory: storyMemory,
                current_arc: `Factory continue — chapter ${nextChapterNumber} generated`,
              })
              .eq('id', storyId)

            updateJob(job.id, {
              chapterProgress: `${story.currentChapters + offset + 1}/${story.targetChapters}`,
              createdChapters: story.currentChapters + offset + 1,
              targetChapters: story.targetChapters,
            })

            addLog(`Insert chương ${nextChapterNumber} thành công`, 'success')
            nextChapterNumber += 1

            if (offset < chaptersToCreate - 1 && config.delayMs > 0) {
              addLog(`Delay ${config.delayMs}ms trước request tiếp theo...`)
              await sleep(config.delayMs)
            }
          }

          if (!stopRequestedRef.current) {
            const finalChapterCount = Math.min(story.currentChapters + chaptersToCreate, story.targetChapters)
            const isStoryFull = finalChapterCount >= story.targetChapters

            await supabase
              .from('stories')
              .update({
                story_memory: storyMemory,
                current_arc: isStoryFull
                  ? `Factory continue — completed at chapter ${finalChapterCount}`
                  : `Factory continue — chapter ${finalChapterCount} generated`,
                completion_status: isStoryFull ? 'full' : 'ongoing',
                target_chapters: story.targetChapters,
              })
              .eq('id', storyId)

            updateJob(job.id, {
              status: 'success',
              chapterProgress: `${finalChapterCount}/${story.targetChapters}`,
              createdChapters: finalChapterCount,
              targetChapters: story.targetChapters,
              completionStatus: isStoryFull ? 'full' : 'ongoing',
            })

            addLog(
              isStoryFull
                ? `Xong viết tiếp ${storyTitle} — truyện đã Full.`
                : `Xong viết tiếp ${storyTitle}`,
              'success',
            )
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          updateJob(job.id, {
            status: 'failed',
            error: message,
          })
          addLog(`Viết tiếp ${storyTitle} lỗi: ${message}`, 'error')
        }
      }

      if (stopRequestedRef.current) {
        setStatus('stopped')
        setCurrentAction('Factory đã dừng theo yêu cầu')
        addLog('Factory đã dừng.', 'warning')
      } else {
        setStatus('success')
        setCurrentAction('Factory viết tiếp truyện xong')
        addLog('Factory viết tiếp truyện xong toàn bộ job.', 'success')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setStatus('failed')
      setCurrentAction('Factory viết tiếp lỗi')
      addLog(`Factory viết tiếp lỗi: ${message}`, 'error')
    }
  }

  async function startFactory() {
    if (!canStart) return

    if (factoryMode === 'continue-existing') {
      await continueExistingStories()
      return
    }

    stopRequestedRef.current = false
    setStatus('running')
    setCurrentAction('Chuẩn bị chạy Factory')
    setLogs([])

    const factoryRunId = makeId('factory')
    const totalBatchesForRun = Math.ceil(config.storyCount / Math.max(1, config.batchSize))

    addLog(
      `Factory sẽ tạo ${config.storyCount} truyện, chia thành ${totalBatchesForRun} batch, mỗi batch tối đa ${config.batchSize} truyện.`,
      'info',
    )

    if (config.autoCompleteByTarget) {
      addLog(
        `Đang bật full target mode: mỗi truyện sẽ random ${config.minTargetChapters}-${config.maxTargetChapters} chương và tạo đủ để kết truyện.`,
        'warning',
      )
    }

    const initialJobs: FactoryJob[] = Array.from({ length: config.storyCount }).map((_, index) => ({
      id: makeId('job'),
      index: index + 1,
      title: 'Chưa tạo',
      genreLabel: 'Chưa chọn',
      genreSlug: '',
      heroineLabel: 'Chưa chọn',
      status: 'pending',
      chapterProgress: config.autoCompleteByTarget
        ? `0/${config.minTargetChapters}-${config.maxTargetChapters}`
        : `0/${config.chaptersToGenerateNow}`,
      coverStatus: config.generateCover ? (config.provider === 'openai' ? 'pending' : 'skipped') : 'off',
      completionStatus: 'ongoing',
    }))

    setJobs(initialJobs)

    try {
      const scanResult = await scanExistingStories()
      let activeAvoidLibrary = scanResult.avoid

      for (let storyIndex = 1; storyIndex <= config.storyCount; storyIndex += 1) {
        const currentBatch = Math.ceil(storyIndex / Math.max(1, config.batchSize))
        const indexInBatch = ((storyIndex - 1) % Math.max(1, config.batchSize)) + 1

        if (indexInBatch === 1) {
          addLog(`Bắt đầu batch ${currentBatch}/${totalBatchesForRun}`, 'info')
        }

        if (stopRequestedRef.current) {
          addLog('Đã nhận lệnh stop. Dừng trước story tiếp theo.', 'warning')
          break
        }

        const job = initialJobs[storyIndex - 1]
        const genre = pickOne(selectedGenres, DEFAULT_FACTORY_GENRES[0])
        const heroine = pickOne(selectedHeroines, DEFAULT_HEROINE_OPTIONS[0])
        const targetChapters = randomInt(config.minTargetChapters, config.maxTargetChapters)
        const chaptersToCreate = config.autoCompleteByTarget
          ? targetChapters
          : config.chaptersToGenerateNow
        const createProgress = getFactoryChapterProgress({
          currentChapters: 0,
          targetChapters,
          maxCreateNow: chaptersToCreate,
        })
        const runShortId = `${new Date().getMonth() + 1}${new Date().getDate()}${storyIndex}${Math.random()
          .toString(36)
          .slice(2, 5)}`
        const premiseSeed = makeId('premise')
        const nameSeed = makeId('name')
        let storySeed: FactoryStorySeed

        try {
          storySeed = await buildUniqueStorySeed({
            genreLabel: genre.label,
            heroineLabel: heroine.label,
            avoidLibrary: activeAvoidLibrary,
            factoryRunId,
            storyIndex,
            premiseSeed,
            provider: config.provider,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)

          updateJob(job.id, {
            status: 'failed',
            genreLabel: genre.label,
            genreSlug: genre.slug,
            heroineLabel: heroine.label,
            chapterProgress: `0/${targetChapters}`,
            targetChapters,
            createdChapters: 0,
            completionStatus: 'ongoing',
            error: `Seed lỗi: ${message}`,
          })

          addLog(
            `Story ${storyIndex}: bỏ qua vì không tạo được seed đủ khác motif sau ${STORY_SEED_MAX_ATTEMPTS} lần. Factory sẽ chạy tiếp story sau.`,
            'error',
          )
          addLog(`Chi tiết seed lỗi: ${message}`, 'warning')

          if (storyIndex < config.storyCount && config.delayMs > 0) {
            await sleep(config.delayMs)
          }

          continue
        }

        updateJob(job.id, {
          status: 'running',
          genreLabel: genre.label,
          genreSlug: genre.slug,
          heroineLabel: heroine.label,
          chapterProgress: `0/${targetChapters}`,
          targetChapters,
          createdChapters: 0,
          completionStatus: 'ongoing',
        })

        addLog(
          `Batch ${currentBatch}/${totalBatchesForRun} — bắt đầu story ${storyIndex}/${config.storyCount}: ${genre.label}. Target: ${targetChapters} chương. ${createProgress.createRangeLabel}.`,
          'info',
        )
        
        addLog(`Story seed fingerprint: ${storySeed.shortFingerprint}`, 'info')
        if (storySeed.motifFingerprint?.fingerprint) {
          addLog(`Motif fingerprint: ${storySeed.motifFingerprint.fingerprint}`, 'info')
        }

        setCurrentAction(
          `Batch ${currentBatch}/${totalBatchesForRun} — đang tạo story ${storyIndex}/${config.storyCount}`,
        )

        let createdStory: { id: string; title: string; slug: string } | null = null
        let storyMemory = ''
        let createdChapterCount = 0
        const recentChapters: Array<{
          chapter_number: number
          title: string
          content: string
          summary?: string
        }> = []

        try {
          for (let chapterNumber = 1; chapterNumber <= chaptersToCreate; chapterNumber += 1) {
            if (stopRequestedRef.current) {
              updateJob(job.id, {
                status: 'stopped',
                chapterProgress: `${chapterNumber - 1}/${targetChapters}`,
              })
              addLog(`Dừng sau request hiện tại tại story ${storyIndex}.`, 'warning')
              break
            }

            const isFinalChapter = config.autoCompleteByTarget && chapterNumber === chaptersToCreate

            setCurrentAction(`Story ${storyIndex}: generate chương ${chapterNumber}`)
            addLog(
              `Story ${storyIndex}: generate chương ${chapterNumber}${isFinalChapter ? ' — chương cuối' : ''}...`,
            )

            const factoryPromptIdea = buildFactoryPromptIdea({
              genreLabel: genre.label,
              heroineLabel: heroine.label,
              targetChapters,
              avoidLibrary: activeAvoidLibrary,
              premiseSeed,
              storySeed,
            })

            let output = ''
            let parsed: ParsedChapterOutput | null = null
            let validationErrors: string[] = []

            for (let attempt = 1; attempt <= 2; attempt += 1) {
              output = await generateChapter({
                provider: config.provider,
                modelKey: config.modelKey,
                storyTitle: createdStory?.title || '',
                storyDescription: '',
                genreLabel: genre.label,
                heroineLabel: heroine.label,
                chapterNumber,
                targetChapters,
                isFinalChapter,
                recentChapters,
                storyMemory,
                factoryPromptIdea,
                runShortId,
                storySeed,
              })

              parsed = parseChapterOutput({
                output,
                genreLabel: genre.label,
                chapterNumber,
                runShortId,
              })

              const validation = validateChapterOutput({
                output,
                readerOnly: parsed.readerOnly,
                chapterNumber,
                storyTitle: parsed.storyTitle,
              })

              if (validation.ok) {
                validationErrors = []
                break
              }

              validationErrors = validation.errors
              addLog(
                `Validate fail lần ${attempt}: ${validation.errors.join(' | ')}`,
                'warning',
              )

              if (attempt < 2) {
                addLog('Thử regenerate thêm 1 lần...', 'warning')
              }
            }

            if (!parsed || validationErrors.length) {
              throw new Error(`Output không đạt validation: ${validationErrors.join(' | ')}`)
            }

            if (chapterNumber === 1) {
              addLog(`Parse title: ${parsed.storyTitle}`, 'success')

              const panelStoryTitle = resolvePanelStoryTitle({
                storySeed,
                parsedTitle: parsed.storyTitle,
              })

              addLog(
                `Panel title gate final: "${panelStoryTitle.title}" | seed="${storySeed.title || ''}" | parsed="${parsed.storyTitle}" | evidence="${panelStoryTitle.evidenceTitle}"`,
                panelStoryTitle.changed ? 'warning' : 'success',
              )

              if (panelStoryTitle.changed) {
                addLog(
                  `Panel title gate changed: "${panelStoryTitle.original}" → "${panelStoryTitle.title}"`,
                  'warning',
                )
              }

              setCurrentAction(`Insert story draft: ${panelStoryTitle.title}`)

              const publicStoryDescription = buildFactoryPublicStoryDescription({
                parsed: {
                  ...parsed,
                  storyTitle: panelStoryTitle.title,
                },
                genreLabel: genre.label,
                heroineLabel: heroine.label,
                storySeed,
              })
              const cleanStoryDescription = buildCleanFactoryStoryDescription({
                parsedDescription: parsed.storyDescription,
                publicDescription: publicStoryDescription,
                storySeed,
              })

              createdStory = await insertStoryDraft({
                parsed: {
                  ...parsed,
                  storyTitle: panelStoryTitle.title,
                  storyDescription: cleanStoryDescription,
                },
                genre,
                heroine,
                config,
                factoryRunId,
                storyIndex,
                targetChapters,
                technicalReport: parsed.technicalReport,
                premiseSeed,
                nameSeed,
                storySeed,
              })

              updateJob(job.id, {
                title: createdStory.title,
                storyId: createdStory.id,
                storySlug: createdStory.slug,
              })

              addLog(`Insert story draft thành công: ${createdStory.title}`, 'success')
            }

            if (!createdStory) {
              throw new Error('Không có storyId để insert chapter.')
            }

            setCurrentAction(`Insert chapter ${chapterNumber}`)
            await insertChapterDraft({
              storyId: createdStory.id,
              parsed,
              chapterNumber,
              status: config.chapterStatus,
            })

            recentChapters.push({
              chapter_number: chapterNumber,
              title: parsed.chapterTitle,
              content: parsed.readerOnly,
              summary: buildPublicChapterSummary(parsed.readerOnly),
            })

            storyMemory = [storyMemory, parsed.technicalReport].filter(Boolean).join('\n\n---\n\n')
            createdChapterCount = chapterNumber

            updateJob(job.id, {
              chapterProgress: `${chapterNumber}/${targetChapters}`,
              createdChapters: chapterNumber,
              targetChapters,
              completionStatus:
                config.autoCompleteByTarget && chapterNumber >= chaptersToCreate ? 'full' : 'ongoing',
            })

            addLog(`Insert chapter ${chapterNumber} thành công`, 'success')

            if (chapterNumber < chaptersToCreate && config.delayMs > 0) {
              addLog(`Delay ${config.delayMs}ms trước request tiếp theo...`)
              await sleep(config.delayMs)
            }
          }

          if (createdStory) {
            const isStoryFull = config.autoCompleteByTarget && createdChapterCount >= targetChapters

            await supabase
              .from('stories')
              .update({
                story_memory: storyMemory,
                current_arc: isStoryFull
                  ? `Factory completed — full at chapter ${createdChapterCount}/${targetChapters}`
                  : `Factory draft — chapter ${createdChapterCount}/${targetChapters} generated`,
                completion_status: isStoryFull ? 'full' : 'ongoing',
                target_chapters: targetChapters,
              })
              .eq('id', createdStory.id)

            addLog(
              isStoryFull
                ? `Story ${storyIndex}: đã tạo đủ ${targetChapters}/${targetChapters} chương và đánh dấu Full.`
                : `Story ${storyIndex}: lưu trạng thái ongoing ${createdChapterCount}/${targetChapters}.`,
              isStoryFull ? 'success' : 'info',
            )
          }

          if (config.generateCover) {
            if (config.provider === 'mock') {
              updateJob(job.id, { coverStatus: 'skipped' })
              addLog('Mock mode: skip cover generation.', 'warning')
            } else if (createdStory) {
              try {
                updateJob(job.id, { coverStatus: 'pending' })
                setCurrentAction(`Story ${storyIndex}: generate cover`)
                addLog(`Story ${storyIndex}: generate cover...`)

                const coverUrl = await generateAndAttachCover({
                  storyId: createdStory.id,
                  storyTitle: createdStory.title,
                  storySlug: createdStory.slug,
                  storyDescription: recentChapters[0]?.content?.slice(0, 500) || '',
                  genreLabel: genre.label,
                  heroineLabel: heroine.label,
                  storySeed,
                })

                updateJob(job.id, {
                  coverStatus: 'success',
                  coverUrl,
                })

                addLog(`Generate cover thành công`, 'success')
              } catch (error) {
                const message = error instanceof Error ? error.message : String(error)

                updateJob(job.id, {
                  coverStatus: 'failed',
                  error: `Cover lỗi: ${message}`,
                })

                addLog(`Generate cover lỗi: ${message}`, 'error')
              }
            }
          }

          if (stopRequestedRef.current) {
            updateJob(job.id, { status: 'stopped' })
          } else {
            const isStoryFull = config.autoCompleteByTarget && createdChapterCount >= targetChapters

            updateJob(job.id, {
              status: 'success',
              chapterProgress: `${createdChapterCount}/${targetChapters}`,
              createdChapters: createdChapterCount,
              targetChapters,
              completionStatus: isStoryFull ? 'full' : 'ongoing',
            })
            addLog(`Xong story ${storyIndex}/${config.storyCount}`, 'success')
          }

          {
            const updatedStoriesForAvoid = [
              {
                id: createdStory?.id || makeId('story'),
                title: createdStory?.title || '',
                description: recentChapters[0]?.content?.slice(0, 260) || '',
                genres: [genre.slug],
                story_dna: {
                  factory_seed: storySeed,
                  motifFingerprint: storySeed.motifFingerprint ?? null,
                  motifText: storySeed.motifText ?? null,
                  motifEmbedding: storySeed.motifEmbedding ?? null,
                },
                story_memory: storyMemory,
                created_at: new Date().toISOString(),
              },
              ...scanResult.stories,
            ] as ExistingStory[]

            const motifItems = extractMotifRegistryItemsFromStories(updatedStoriesForAvoid)

            activeAvoidLibrary = {
              ...buildAvoidLibrary(updatedStoriesForAvoid),
              motifFingerprints: motifItems,
              motifTexts: motifItems.map((item) => item.motifText).filter(Boolean),
            }
          }

          if (storyIndex < config.storyCount && config.delayMs > 0) {
            const isEndOfBatch = storyIndex % Math.max(1, config.batchSize) === 0

            if (isEndOfBatch) {
              addLog(
                `Xong batch ${currentBatch}/${totalBatchesForRun}. Delay ${config.delayMs}ms trước batch tiếp theo...`,
                'info',
              )
            }

            await sleep(config.delayMs)
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)

          updateJob(job.id, {
            status: 'failed',
            error: message,
          })

          addLog(`Story ${storyIndex} lỗi: ${message}`, 'error')
        }
      }

      if (stopRequestedRef.current) {
        setStatus('stopped')
        setCurrentAction('Factory đã dừng theo yêu cầu')
        addLog('Factory đã dừng.', 'warning')
      } else {
        setStatus('success')
        setCurrentAction('Factory chạy xong')
        addLog('Factory chạy xong toàn bộ job.', 'success')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setStatus('failed')
      setCurrentAction('Factory lỗi')
      addLog(`Factory lỗi: ${message}`, 'error')
    }
  }

  function stopFactory() {
    stopRequestedRef.current = true
    addLog('Đã yêu cầu stop. Factory sẽ dừng sau request hiện tại.', 'warning')
    setCurrentAction('Đang chờ dừng sau request hiện tại')
  }

  function clearLog() {
    setLogs([])
    setJobs([])
    setStatus('idle')
    setCurrentAction('Đã clear log')
    localStorage.removeItem(AI_FACTORY_STORAGE_KEY)
  }

  function toggleGenre(item: FactoryGenreOption) {
    setSelectedGenres((prev) => {
      const exists = prev.some((genre) => genre.key === item.key)
      if (exists) return prev.filter((genre) => genre.key !== item.key)
      return [...prev, item]
    })
  }

  function toggleHeroine(item: FactoryHeroineOption) {
    setSelectedHeroines((prev) => {
      const exists = prev.some((heroine) => heroine.key === item.key)
      if (exists) return prev.filter((heroine) => heroine.key !== item.key)
      return [...prev, item]
    })
  }

  return (
    <AIFactoryPanelView
      status={status}
      progressText={progressText}
      factoryMode={factoryMode}
      setFactoryMode={setFactoryMode}
      isRunning={isRunning}
      continueStoryLimit={continueStoryLimit}
      setContinueStoryLimit={setContinueStoryLimit}
      continueChaptersPerStory={continueChaptersPerStory}
      setContinueChaptersPerStory={setContinueChaptersPerStory}
      continueStatusFilter={continueStatusFilter}
      setContinueStatusFilter={setContinueStatusFilter}
      selectedContinueStoryId={selectedContinueStoryId}
      setSelectedContinueStoryId={setSelectedContinueStoryId}
      config={config}
      updateConfig={updateConfig}
      setOpenaiConfirmed={setOpenaiConfirmed}
      selectedGenres={selectedGenres}
      selectedHeroines={selectedHeroines}
      toggleGenre={toggleGenre}
      toggleHeroine={toggleHeroine}
      existingStories={existingStories}
      avoidLibrary={avoidLibrary}
      scanExistingStories={scanExistingStories}
      incompleteStories={incompleteStories}
      scanIncompleteStories={scanIncompleteStories}
      openaiConfirmed={openaiConfirmed}
      expensiveModelRequiresConfirmation={expensiveModelRequiresConfirmation}
      expensiveModelConfirmed={expensiveModelConfirmed}
      setExpensiveModelConfirmed={setExpensiveModelConfirmed}
      totalBatches={totalBatches}
      totalTextRequests={totalTextRequests}
      totalCoverRequests={totalCoverRequests}
      totalRequests={totalRequests}
      canStart={canStart}
      startFactory={startFactory}
      stopFactory={stopFactory}
      clearLog={clearLog}
      currentAction={currentAction}
      jobs={jobs}
      logs={logs}
    />
  )

}