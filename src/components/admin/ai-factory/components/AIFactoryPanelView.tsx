import { Link } from 'react-router-dom'
import type { Dispatch, SetStateAction } from 'react'
import type {
  AIFactoryConfig,
  AvoidLibrary,
  ExistingStory,
  FactoryGenreOption,
  FactoryHeroineOption,
  FactoryJob,
  FactoryLog,
  FactoryStatus,
} from '../aiFactoryTypes'
import {
  DEFAULT_FACTORY_GENRES,
  DEFAULT_HEROINE_OPTIONS,
  clampNumber,
} from '../aiFactoryUtils'
import type { ContinueStatusFilter, FactoryMode, IncompleteStory } from '../types/factoryPanelTypes'
import { cx, FieldLabel, Section, SmallHint, ToggleChip } from './FactoryUi'

type AIFactoryPanelViewProps = {
  status: FactoryStatus
  progressText: string
  factoryMode: FactoryMode
  setFactoryMode: Dispatch<SetStateAction<FactoryMode>>
  isRunning: boolean
  continueStoryLimit: number
  setContinueStoryLimit: Dispatch<SetStateAction<number>>
  continueChaptersPerStory: number
  setContinueChaptersPerStory: Dispatch<SetStateAction<number>>
  continueStatusFilter: ContinueStatusFilter
  setContinueStatusFilter: Dispatch<SetStateAction<ContinueStatusFilter>>
  config: AIFactoryConfig
  updateConfig: <K extends keyof AIFactoryConfig>(key: K, value: AIFactoryConfig[K]) => void
  setOpenaiConfirmed: Dispatch<SetStateAction<boolean>>
  selectedGenres: FactoryGenreOption[]
  selectedHeroines: FactoryHeroineOption[]
  toggleGenre: (item: FactoryGenreOption) => void
  toggleHeroine: (item: FactoryHeroineOption) => void
  existingStories: ExistingStory[]
  avoidLibrary: AvoidLibrary
  scanExistingStories: () => Promise<{ stories: ExistingStory[]; avoid: AvoidLibrary }>
  incompleteStories: IncompleteStory[]
  scanIncompleteStories: () => Promise<IncompleteStory[]>
  openaiConfirmed: boolean
  totalBatches: number
  totalTextRequests: number
  totalCoverRequests: number
  totalRequests: number
  canStart: boolean
  startFactory: () => Promise<void>
  stopFactory: () => void
  clearLog: () => void
  currentAction: string
  jobs: FactoryJob[]
  logs: FactoryLog[]
}

export default function AIFactoryPanelView({
  status,
  progressText,
  factoryMode,
  setFactoryMode,
  isRunning,
  continueStoryLimit,
  setContinueStoryLimit,
  continueChaptersPerStory,
  setContinueChaptersPerStory,
  continueStatusFilter,
  setContinueStatusFilter,
  config,
  updateConfig,
  setOpenaiConfirmed,
  selectedGenres,
  selectedHeroines,
  toggleGenre,
  toggleHeroine,
  existingStories,
  avoidLibrary,
  scanExistingStories,
  incompleteStories,
  scanIncompleteStories,
  openaiConfirmed,
  totalBatches,
  totalTextRequests,
  totalCoverRequests,
  totalRequests,
  canStart,
  startFactory,
  stopFactory,
  clearLog,
  currentAction,
  jobs,
  logs,
}: AIFactoryPanelViewProps) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-yellow-300">Admin AI Factory</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            AI Writer Factory
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
            Tạo truyện/chương hàng loạt theo batch. MVP chạy tuần tự, lưu story/chapter
            dạng draft vào Supabase.
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-4 py-3 text-sm text-yellow-100">
          <div className="font-semibold">Trạng thái: {status}</div>
          <div className="text-yellow-100/80">Tiến độ: {progressText}</div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <Section title="Factory Config" desc="Cấu hình số truyện, số chương, provider và delay.">
            <div className="mb-4 rounded-xl border border-yellow-300/20 bg-yellow-300/10 p-3">
              <FieldLabel>Factory mode</FieldLabel>
              <select
                value={factoryMode}
                disabled={isRunning}
                onChange={(event) => setFactoryMode(event.target.value as FactoryMode)}
                className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
              >
                <option value="create-new">Tạo truyện mới</option>
                <option value="continue-existing">Viết tiếp truyện dang dở</option>
              </select>
              <SmallHint>
                Tạo truyện mới sẽ insert story mới. Viết tiếp truyện dang dở sẽ quét target_chapters trong story_dna hoặc cột target_chapters và tạo chương còn thiếu.
              </SmallHint>
            </div>

            {factoryMode === 'continue-existing' ? (
              <div className="mb-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <FieldLabel>Số truyện dang dở cần xử lý</FieldLabel>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    disabled={isRunning}
                    value={continueStoryLimit}
                    onChange={(event) => setContinueStoryLimit(clampNumber(Number(event.target.value), 1, 50))}
                    className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                  />
                  <SmallHint>Factory sẽ lấy tối đa số truyện thiếu chương theo thứ tự mới nhất.</SmallHint>
                </div>

                <div>
                  <FieldLabel>Tạo thêm tối đa mỗi truyện</FieldLabel>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    disabled={isRunning}
                    value={continueChaptersPerStory}
                    onChange={(event) => setContinueChaptersPerStory(clampNumber(Number(event.target.value), 1, 25))}
                    className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                  />
                  <SmallHint>Ví dụ truyện 1/15, nhập 3 sẽ tạo chương 2–4.</SmallHint>
                </div>

                <div>
                  <FieldLabel>Lọc trạng thái truyện</FieldLabel>
                  <select
                    value={continueStatusFilter}
                    disabled={isRunning}
                    onChange={(event) => setContinueStatusFilter(event.target.value as ContinueStatusFilter)}
                    className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="all">Tất cả</option>
                  </select>
                  <SmallHint>Nên để Draft để tránh tự thêm chương vào truyện đã public nếu chưa duyệt.</SmallHint>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Provider</FieldLabel>
                <select
                  value={config.provider}
                  disabled={isRunning}
                  onChange={(event) => {
                    updateConfig('provider', event.target.value as AIFactoryConfig['provider'])
                    setOpenaiConfirmed(false)
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                >
                  <option value="mock">Mock — không gửi API</option>
                  <option value="openai">OpenAI — gọi /api/ai/generate</option>
                </select>
              </div>

              <div>
                <FieldLabel>Model profile</FieldLabel>
                <select
                  value={config.modelKey}
                  disabled={isRunning}
                  onChange={(event) =>
                    updateConfig('modelKey', event.target.value as AIFactoryConfig['modelKey'])
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                >
                  <option value="economy">Tiết kiệm — economy</option>
                  <option value="premium">Cao cấp — premium</option>
                  <option value="auto">Tự động — auto</option>
                </select>
              </div>

              <div>
                <FieldLabel>Tổng số truyện cần tạo</FieldLabel>
                <input
                  type="number"
                  min={1}
                  max={50}
                  disabled={isRunning}
                  value={config.storyCount}
                  onChange={(event) =>
                    updateConfig(
                      'storyCount',
                      clampNumber(Number(event.target.value), 1, 50),
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                />
                <SmallHint>Tối đa 50 truyện/lần chạy. Factory sẽ tự chia batch và chạy tuần tự.</SmallHint>
              </div>

              <div>
                <FieldLabel>Số truyện mỗi batch</FieldLabel>
                <input
                  type="number"
                  min={1}
                  max={5}
                  disabled={isRunning}
                  value={config.batchSize}
                  onChange={(event) =>
                    updateConfig(
                      'batchSize',
                      clampNumber(Number(event.target.value), 1, 5),
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                />
                <SmallHint>Mỗi batch nên để 3–5 truyện để dễ kiểm soát và tránh spam request.</SmallHint>
              </div>

              <div>
                <FieldLabel>Số chương tạo NGAY mỗi truyện</FieldLabel>
                <input
                  type="number"
                  min={1}
                  max={25}
                  disabled={isRunning || config.autoCompleteByTarget}
                  value={config.chaptersToGenerateNow}
                  onChange={(event) =>
                    updateConfig(
                      'chaptersToGenerateNow',
                      clampNumber(Number(event.target.value), 1, 25),
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300 disabled:opacity-50"
                />
                <SmallHint>
                  {config.autoCompleteByTarget
                    ? 'Đang bật mode full target random: ô này sẽ bị bỏ qua. Số chương thật sẽ lấy theo target random của từng truyện.'
                    : 'Đây là số chương tạo thật ngay mỗi truyện. Hai ô mục tiêu bên dưới chỉ là kế hoạch cho AI, không tự tạo thêm chương.'}
                </SmallHint>
              </div>

              <div>
                <FieldLabel>Số chương mục tiêu tối thiểu</FieldLabel>
                <input
                  type="number"
                  min={5}
                  max={50}
                  disabled={isRunning}
                  value={config.minTargetChapters}
                  onChange={(event) =>
                    updateConfig(
                      'minTargetChapters',
                      clampNumber(Number(event.target.value), 5, 50),
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                />
                <SmallHint>
                  Khi bật full target mode, đây là số chương tối thiểu có thể tạo thật cho mỗi truyện.
                </SmallHint>
              </div>

              <div>
                <FieldLabel>Số chương mục tiêu tối đa</FieldLabel>
                <input
                  type="number"
                  min={5}
                  max={60}
                  disabled={isRunning}
                  value={config.maxTargetChapters}
                  onChange={(event) =>
                    updateConfig(
                      'maxTargetChapters',
                      clampNumber(Number(event.target.value), 5, 60),
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                />
                <SmallHint>Factory sẽ random target trong khoảng này và lưu vào story_dna + cột target_chapters.</SmallHint>
              </div>

              <div>
                <FieldLabel>Delay giữa request</FieldLabel>
                <input
                  type="number"
                  min={0}
                  max={10000}
                  step={500}
                  disabled={isRunning}
                  value={config.delayMs}
                  onChange={(event) =>
                    updateConfig('delayMs', clampNumber(Number(event.target.value), 0, 10000))
                  }
                  className="w-full rounded-xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-yellow-300"
                />
                <SmallHint>Đơn vị ms. 2000ms = 2 giây.</SmallHint>
              </div>

              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 sm:col-span-2">
                <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    disabled={isRunning}
                    checked={config.autoCompleteByTarget}
                    onChange={(event) => updateConfig('autoCompleteByTarget', event.target.checked)}
                    className="mt-1 h-4 w-4 accent-emerald-300"
                  />

                  <span>
                    <span className="block font-bold text-emerald-200">
                      Tạo full truyện theo target random
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-slate-400">
                      Khi bật, mỗi truyện sẽ random số chương trong khoảng tối thiểu/tối đa.
                      Ví dụ random 15 thì Factory sẽ tạo đủ 15 chương, chương cuối kết truyện
                      và lưu completion_status = full.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    disabled={isRunning}
                    checked={config.generateCover}
                    onChange={(event) => updateConfig('generateCover', event.target.checked)}
                    className="h-4 w-4 accent-yellow-300"
                  />
                  Generate cover
                </label>
                <span className="ml-2 text-xs text-slate-500">
                  Mock sẽ skip, OpenAI sẽ tạo ảnh thật + upload public
                </span>
              </div>
            </div>
          </Section>

          <Section title="Genre Pool" desc="Factory sẽ random mỗi truyện một thể loại trong pool.">
            <div className="max-h-44 overflow-auto rounded-xl border border-white/10 bg-black/20 p-2">
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_FACTORY_GENRES.map((genre) => (
                  <ToggleChip
                    key={genre.key}
                    active={selectedGenres.some((item) => item.key === genre.key)}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre.label}
                  </ToggleChip>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Đang chọn {selectedGenres.length}/{DEFAULT_FACTORY_GENRES.length} thể loại.
            </p>
          </Section>

          <Section title="Heroine Pool" desc="Factory sẽ random kiểu nữ chính để tránh truyện bị trùng vibe.">
            <div className="max-h-36 overflow-auto rounded-xl border border-white/10 bg-black/20 p-2">
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_HEROINE_OPTIONS.map((heroine) => (
                  <ToggleChip
                    key={heroine.key}
                    active={selectedHeroines.some((item) => item.key === heroine.key)}
                    onClick={() => toggleHeroine(heroine)}
                  >
                    {heroine.label}
                  </ToggleChip>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Đang chọn {selectedHeroines.length}/{DEFAULT_HEROINE_OPTIONS.length} kiểu nữ chính.
            </p>
          </Section>

          <Section title="Existing Library Scan" desc="Quét truyện gần nhất để build avoid context chống trùng.">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-2xl font-black text-white">{existingStories.length}</div>
                <div className="text-xs text-slate-400">truyện đã quét</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-2xl font-black text-white">{avoidLibrary.titles.length}</div>
                <div className="text-xs text-slate-400">title cần tránh</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-2xl font-black text-white">{avoidLibrary.motifs.length}</div>
                <div className="text-xs text-slate-400">motif/premise</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-2xl font-black text-white">
                  {avoidLibrary.characterNames.length + avoidLibrary.companyNames.length}
                </div>
                <div className="text-xs text-slate-400">tên/công ty</div>
              </div>
            </div>

            <button
              type="button"
              disabled={isRunning}
              onClick={scanExistingStories}
              className="mt-4 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:border-yellow-300/60 hover:bg-yellow-300/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Quét lại kho truyện
            </button>
          </Section>

          <Section title="Continue Existing Stories" desc="Quét truyện chưa đủ target_chapters để viết tiếp chương còn thiếu.">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={isRunning}
                onClick={scanIncompleteStories}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white transition hover:border-yellow-300/60 hover:bg-yellow-300/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Scan truyện dang dở
              </button>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-300">
                Đã tìm thấy: <span className="font-bold text-white">{incompleteStories.length}</span> truyện
              </div>
            </div>

            <div className="mt-4 max-h-64 space-y-2 overflow-auto rounded-xl border border-white/10 bg-black/20 p-2">
              {incompleteStories.length ? (
                incompleteStories.slice(0, 20).map((story) => (
                  <div
                    key={(story as any).id || story.slug || story.title}
                    className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div className="text-sm font-bold text-white">{story.title}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {story.currentChapters}/{story.targetChapters} chương • thiếu {story.missingChapters} • chương tiếp theo {story.nextChapterNumber}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">Chưa scan hoặc không có truyện dang dở.</div>
              )}
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="API Cost Guard" desc="Chống bấm nhầm khi dùng OpenAI thật.">
            {config.provider === 'openai' ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
                  <div className="font-bold">SẼ GỌI OPENAI API</div>
                  <div>Mode: {factoryMode === 'continue-existing' ? 'Viết tiếp truyện dang dở' : 'Tạo truyện mới'}</div>
                  <div className="mt-2 grid gap-1 text-red-100/90">
                    <div>Tổng số truyện: {factoryMode === 'create-new' ? config.storyCount : continueStoryLimit}</div>
                    <div>Số truyện mỗi batch: {factoryMode === 'create-new' ? config.batchSize : continueStoryLimit}</div>
                    <div>Tổng batch dự kiến: {totalBatches}</div>
                    <div>
                      Mode chương:{' '}
                      {factoryMode === 'create-new' && config.autoCompleteByTarget
                        ? `Full random target ${config.minTargetChapters}-${config.maxTargetChapters} chương/truyện`
                        : factoryMode === 'create-new'
                          ? `${config.chaptersToGenerateNow} chương tạo ngay/truyện`
                          : `Viết tiếp tối đa ${continueChaptersPerStory} chương/truyện`}
                    </div>
                    <div>Số chương thật sự sẽ tạo: {totalTextRequests}</div>
                    <div>Text request: {totalTextRequests}</div>
                    <div>Cover request: {totalCoverRequests}</div>
                    <div>Tổng request dự kiến: {totalRequests}</div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={openaiConfirmed}
                    disabled={isRunning}
                    onChange={(event) => setOpenaiConfirmed(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-yellow-300"
                  />
                  <span>Tao xác nhận Factory sẽ gọi OpenAI API và có thể tốn phí.</span>
                </label>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                Mock mode — không gửi OpenAI API. Vẫn insert story/chapter draft vào Supabase để test flow.
                {factoryMode === 'create-new' && config.autoCompleteByTarget ? (
                  <div className="mt-2 text-emerald-100/90">
                    Đang bật full target mode: mock cũng sẽ tạo đủ số chương target và đánh dấu Full để test flow.
                  </div>
                ) : null}
              </div>
            )}
          </Section>

          <Section title="Control">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!canStart}
                onClick={startFactory}
                className="rounded-xl bg-yellow-300 px-4 py-2 text-sm font-black text-black transition hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {factoryMode === 'continue-existing' ? 'Start Continue' : 'Start Factory'}
              </button>

              <button
                type="button"
                disabled={!isRunning}
                onClick={stopFactory}
                className="rounded-xl border border-orange-400/40 bg-orange-500/10 px-4 py-2 text-sm font-bold text-orange-100 transition hover:bg-orange-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Stop sau request hiện tại
              </button>

              <button
                type="button"
                disabled={isRunning}
                onClick={clearLog}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear log
              </button>

              <Link
                to="/admin/ai-factory/results"
                className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/20"
              >
                Xem kết quả
              </Link>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/50 p-3">
              <div className="text-xs uppercase tracking-wide text-slate-500">Current action</div>
              <div className="mt-1 text-sm font-semibold text-white">{currentAction}</div>
            </div>
          </Section>

          <Section title="Job List">
            <div className="space-y-3">
              {jobs.length ? (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-white">
                          #{job.index} — {job.title}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {job.genreLabel} • {job.heroineLabel}
                        </div>
                      </div>
                      <span
                        className={cx(
                          'rounded-full px-2 py-1 text-xs font-bold',
                          job.status === 'success' && 'bg-emerald-500/15 text-emerald-200',
                          job.status === 'running' && 'bg-yellow-500/15 text-yellow-200',
                          job.status === 'failed' && 'bg-red-500/15 text-red-200',
                          job.status === 'stopped' && 'bg-orange-500/15 text-orange-200',
                          job.status === 'pending' && 'bg-slate-500/15 text-slate-300',
                        )}
                      >
                        {job.status}
                      </span>
                    </div>

                    <div className="mt-2 grid gap-1 text-xs text-slate-400">
                      <div>Chapter: {job.chapterProgress}</div>
                      {typeof job.targetChapters === 'number' ? <div>Target: {job.targetChapters}</div> : null}
                      {job.completionStatus ? <div>Completion: {job.completionStatus}</div> : null}
                      <div>Cover: {job.coverStatus}</div>
                      {job.error ? <div className="text-red-300">Lỗi: {job.error}</div> : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500">
                  Chưa có job nào. Bấm {factoryMode === 'continue-existing' ? 'Start Continue' : 'Start Factory'} để chạy.
                </div>
              )}
            </div>
          </Section>
        </div>
      </div>

      <Section title="Progress Log">
        <div className="max-h-[420px] space-y-2 overflow-auto rounded-xl bg-black/50 p-3">
          {logs.length ? (
            logs.map((log) => (
              <div
                key={log.id}
                className={cx(
                  'rounded-lg border px-3 py-2 text-sm',
                  log.type === 'info' && 'border-white/10 bg-white/[0.03] text-slate-300',
                  log.type === 'success' &&
                    'border-emerald-400/20 bg-emerald-500/10 text-emerald-100',
                  log.type === 'warning' &&
                    'border-yellow-400/20 bg-yellow-500/10 text-yellow-100',
                  log.type === 'error' && 'border-red-400/20 bg-red-500/10 text-red-100',
                )}
              >
                <span className="mr-2 text-xs opacity-70">[{log.time}]</span>
                {log.message}
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500">Log trống.</div>
          )}
        </div>
      </Section>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-5 right-5 z-50 rounded-full border border-white/10 bg-zinc-900/95 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-black/40 transition hover:border-yellow-300/60 hover:bg-zinc-800"
      >
        ↑ Lên đầu
      </button>
    </div>
  )
}
