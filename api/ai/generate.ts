import type { GeneratePayload } from './generate-lib/types.js'
import { getLengthRule, getStoryEditorPassEnabled, getTextModel } from './generate-lib/model.js'
import { callOpenAIText } from './generate-lib/openaiClient.js'
import { normalizePayload } from './generate-lib/payload.js'
import { buildPrompt, buildStoryEditorPrompt } from './generate-lib/promptBuilders.js'
import { moderateTextOrThrow } from './generate-lib/moderation.js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  const enabled = process.env.ENABLE_REAL_AI

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY' })
  }

  if (enabled && enabled !== 'true') {
    return res.status(403).json({ error: 'ENABLE_REAL_AI is not true' })
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

    await moderateTextOrThrow(moderationInput, 'story generation input')

    const prompt = buildPrompt(payload)
    const lengthRule = getLengthRule(payload.chapterLengthLabel)
    const model = getTextModel(payload)

    const firstPass = await callOpenAIText({
      apiKey,
      model,
      prompt,
      maxOutputTokens: lengthRule.maxOutputTokens,
    })

    if (!firstPass.response.ok) {
      return res.status(firstPass.response.status).json({
        error: firstPass.data?.error?.message || 'OpenAI API error',
        detail: firstPass.data,
      })
    }

    if (firstPass.data?.__nonJson) {
      return res.status(502).json({
        error: 'OpenAI returned non-JSON response',
        detail: firstPass.data,
      })
    }

    const draftText = firstPass.text

    if (!draftText) {
      return res.status(500).json({
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

        await moderateTextOrThrow(editorPrompt, 'story editor input')

        const editorPass = await callOpenAIText({
          apiKey,
          model,
          prompt: editorPrompt,
          maxOutputTokens: lengthRule.maxOutputTokens,
        })

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
        }
      } catch (editorErrorRaw: any) {
        editorPassFailed = true
        editorError = editorErrorRaw?.message || 'Story editor pass failed'
      }
    }

    await moderateTextOrThrow(finalText, 'story generation output')

    return res.status(200).json({
      text: finalText,
      draftText: editorPassUsed ? draftText : undefined,
      model,
      modelKey: payload.modelKey,
      editorPassUsed,
      editorPassFailed,
      editorError: editorPassFailed ? editorError : undefined,
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
      error: error?.message || 'Unknown generate error',
      detail: error?.detail || null,
      categories: error?.categories || null,
      categoryScores: error?.categoryScores || null,
    })
  }
}