import type { GeneratePayload } from './generate-lib/types.js'
import { getLengthRule, getStoryEditorPassEnabled, getTextModel } from './generate-lib/model.js'
import { callOpenAIText } from './generate-lib/openaiClient.js'
import { normalizePayload } from './generate-lib/payload.js'
import { buildPrompt, buildStoryEditorPrompt } from './generate-lib/promptBuilders.js'
import { moderateTextOrThrow } from './generate-lib/moderation.js'
import { verifyAIAdminRequest } from './generate-lib/aiSecurity.js'
import { runVietnameseProseQualityPipeline } from './generate-lib/vietnameseProseQuality.js'

function getEditorPassTimeoutMs() {
  const raw = Number(process.env.OPENAI_EDITOR_TIMEOUT_MS || 18000)
  if (!Number.isFinite(raw)) return 18000
  return Math.max(8000, Math.min(25000, Math.floor(raw)))
}

function getErrorMessage(error: any) {
  return error?.message || error?.error?.message || String(error || 'Unknown error')
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(message))
    }, timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}


function getOpenAIRetryCount() {
  const raw = Number(process.env.OPENAI_RETRY_COUNT || 3)
  if (!Number.isFinite(raw)) return 3
  return Math.max(0, Math.min(5, Math.floor(raw)))
}

function getOpenAIRetryBaseDelayMs() {
  const raw = Number(process.env.OPENAI_RETRY_BASE_DELAY_MS || 1200)
  if (!Number.isFinite(raw)) return 1200
  return Math.max(300, Math.min(5000, Math.floor(raw)))
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getRetryStatus(error: any) {
  return Number(
    error?.status ||
      error?.response?.status ||
      error?.cause?.status ||
      error?.detail?.status ||
      error?.error?.status ||
      0,
  )
}

function isRetryableOpenAIStatus(status: number) {
  return status === 408 || status === 409 || status === 425 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504
}

function isRetryableOpenAIError(error: any) {
  const status = getRetryStatus(error)
  if (isRetryableOpenAIStatus(status)) return true

  const message = getErrorMessage(error).toLowerCase()
  return (
    message.includes('fetch failed') ||
    message.includes('network') ||
    message.includes('econnreset') ||
    message.includes('etimedout') ||
    message.includes('timeout') ||
    message.includes('socket') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504') ||
    message.includes('429')
  )
}

function getRetryDelayMs(attemptIndex: number) {
  const baseDelayMs = getOpenAIRetryBaseDelayMs()
  const exponentialDelayMs = baseDelayMs * Math.pow(2, Math.max(0, attemptIndex - 1))
  const jitterMs = Math.floor(Math.random() * 350)
  return Math.min(10_000, exponentialDelayMs + jitterMs)
}

async function withOpenAIRetry<T>(label: string, run: () => Promise<T>, shouldRetryResult?: (result: T) => boolean): Promise<T> {
  const maxRetries = getOpenAIRetryCount()
  let lastError: any = null

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const result = await run()
      if (!shouldRetryResult || !shouldRetryResult(result)) return result

      if (attempt >= maxRetries) return result

      const delayMs = getRetryDelayMs(attempt + 1)
      console.warn(`[${label}] OpenAI retryable response, retry ${attempt + 1}/${maxRetries} after ${delayMs}ms`)
      await sleep(delayMs)
      continue
    } catch (error: any) {
      lastError = error
      if (attempt >= maxRetries || !isRetryableOpenAIError(error)) throw error

      const delayMs = getRetryDelayMs(attempt + 1)
      console.warn(`[${label}] ${getErrorMessage(error)}, retry ${attempt + 1}/${maxRetries} after ${delayMs}ms`)
      await sleep(delayMs)
    }
  }

  throw lastError || new Error(`${label} failed after retry`)
}

function isRetryableOpenAITextResult(result: Awaited<ReturnType<typeof callOpenAIText>>) {
  return isRetryableOpenAIStatus(result.response.status) || Boolean(result.data?.__nonJson && result.response.status >= 500)
}

async function callOpenAITextWithRetry(label: string, args: Parameters<typeof callOpenAIText>[0]) {
  return withOpenAIRetry(label, () => callOpenAIText(args), isRetryableOpenAITextResult)
}

async function moderateTextOrThrowWithRetry(input: string, label: string) {
  return withOpenAIRetry(`moderation:${label}`, () => moderateTextOrThrow(input, label))
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
    })
  }

  const auth = verifyAIAdminRequest(req, {
    routeName: 'generate-story',
    maxRequestsPerWindow: 12,
    windowMs: 60_000,
  })

  if (!auth.ok) {
    return res.status(auth.status).json(auth.body)
  }

  const apiKey = process.env.OPENAI_API_KEY
  const enabled = process.env.ENABLE_REAL_AI

  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      error: 'Missing OPENAI_API_KEY',
    })
  }

  if (enabled && enabled !== 'true') {
    return res.status(403).json({
      ok: false,
      error: 'ENABLE_REAL_AI is not true',
    })
  }

  try {
    const payload = normalizePayload((req.body || {}) as GeneratePayload)

    const moderationInput = [
      payload.storyTitle,
      payload.promptIdea,
      payload.genre,
      payload.writingStyle,
      payload.chapterTitle,
      payload.previousChapterSummary,
      payload.userInstruction,
    ]
      .filter(Boolean)
      .join('\n\n')

    await moderateTextOrThrowWithRetry(moderationInput, 'story generation input')

    const prompt = buildPrompt(payload)
    const lengthRule = getLengthRule(payload.chapterLengthLabel)
    const model = getTextModel(payload)

    const firstPass = await callOpenAITextWithRetry('first-pass', {
      apiKey,
      model,
      prompt,
      maxOutputTokens: lengthRule.maxOutputTokens,
    })

    if (!firstPass.response.ok) {
      return res.status(firstPass.response.status).json({
        ok: false,
        error: firstPass.data?.error?.message || 'OpenAI API error',
        detail: firstPass.data,
      })
    }

    if (firstPass.data?.__nonJson) {
      return res.status(502).json({
        ok: false,
        error: 'OpenAI returned non-JSON response',
        detail: firstPass.data,
      })
    }

    const draftText = firstPass.text

    if (!draftText) {
      return res.status(500).json({
        ok: false,
        error: 'OpenAI returned empty output',
        detail: firstPass.data,
      })
    }

    let finalText = draftText
    let editorPassUsed = false
    let editorPassFailed = false
    let editorUsage = null
    let editorError = ''

    if (getStoryEditorPassEnabled(payload)) {
      try {
        const editorPrompt = buildStoryEditorPrompt(payload, draftText)

        await moderateTextOrThrowWithRetry(editorPrompt, 'story editor input')

        const editorTimeoutMs = getEditorPassTimeoutMs()
        const editorPass = await withTimeout(
          callOpenAITextWithRetry('editor-pass', {
            apiKey,
            model,
            prompt: editorPrompt,
            maxOutputTokens: lengthRule.maxOutputTokens,
          }),
          editorTimeoutMs,
          `Story editor pass timed out after ${editorTimeoutMs}ms`,
        )

        if (editorPass.response.ok && !editorPass.data?.__nonJson && editorPass.text) {
          finalText = editorPass.text
          editorPassUsed = true
          editorUsage = editorPass.data?.usage || null
        } else {
          editorPassFailed = true
          editorError =
            editorPass.data?.error?.message ||
            editorPass.data?.preview ||
            `Story editor pass failed with status ${editorPass.response.status}`

          // Fail-safe: nếu editor pass lỗi 5xx/502/non-json, vẫn dùng first pass.
          finalText = draftText
        }
      } catch (editorErrorRaw: any) {
        editorPassFailed = true
        editorError = getErrorMessage(editorErrorRaw) || 'Story editor pass failed'

        // Fail-safe: không để editor pass timeout/502 làm chết job Factory.
        finalText = draftText
      }
    }

    const beforeVietnameseQualityPipeline = finalText
    const vietnameseQuality = runVietnameseProseQualityPipeline(finalText)

    finalText = vietnameseQuality.text

    const vietnameseRepairUsed = finalText !== beforeVietnameseQualityPipeline
    const vietnameseRepairIssues = vietnameseQuality.issues.map((issue) => {
      const suggestion = issue.genericSuggestion ? ` Gợi ý: ${issue.genericSuggestion}` : ''
      const sample = issue.sample ? ` Câu/cụm: “${issue.sample}”.` : ''
      return `${issue.message}.${sample}${suggestion}`.replace(/\.\./g, '.').trim()
    })

    // Không gọi AI repair pass lần 2.
    // Chỉ chạy Vietnamese Prose Quality Library:
    // - rule chắc chắn thì tự sửa
    // - rule cần ngữ cảnh thì trả warning để soi thủ công

    await moderateTextOrThrowWithRetry(finalText, 'story generation output')

    const proseReport = {
      textChanged: vietnameseRepairUsed,
      autoFixCount: vietnameseQuality.stats.fixedCount,
      warningCount: vietnameseQuality.stats.warningCount,
      allowedCount: vietnameseQuality.stats.allowedCount,
      autoFixes: vietnameseQuality.appliedFixes,
      warnings: vietnameseQuality.issues,
      allowedSamples: vietnameseQuality.stats.allowedSamples,
      stats: vietnameseQuality.stats,
    }

    return res.status(200).json({
      ok: true,
      text: finalText,
      draftText: editorPassUsed ? draftText : undefined,
      model,
      modelKey: payload.modelKey,
      editorPassUsed,
      editorPassFailed,
      editorError: editorPassFailed ? editorError : undefined,
      vietnameseRepairUsed,
      vietnameseRepairIssues,
      vietnameseRepairAppliedFixes: vietnameseQuality.appliedFixes,
      vietnameseRepairIssuesStructured: vietnameseQuality.issues,
      vietnameseRepairStats: vietnameseQuality.stats,
      proseReport,
      moderation: {
        inputChecked: true,
        outputChecked: true,
        editorInputChecked: getStoryEditorPassEnabled(payload),
        model: process.env.OPENAI_MODERATION_MODEL || 'omni-moderation-latest',
      },
      usage: firstPass.data?.usage || null,
      editorUsage,
    })
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error?.message || 'Unknown generate error',
      detail: error?.detail || null,
      categories: error?.categories || null,
      categoryScores: error?.categoryScores || null,
    })
  }
}
