import type { VercelRequest, VercelResponse } from '@vercel/node'

import type { JsonRecord } from './cover/coverTypes.js'
import { setCors } from './cover/coverHttp.js'
import { safeString } from './cover/coverText.js'
import { extractStoryInput } from './cover/storyInput.js'
import { buildCoverPrompt } from './cover/coverPrompt.js'
import { generateCoverImage } from './cover/openaiImage.js'
import { SUPABASE_COVER_BUCKET, uploadCoverToSupabase } from './cover/coverStorage.js'

function parseBody(req: VercelRequest): JsonRecord {
  if (typeof req.body === 'string') {
    return JSON.parse(req.body) as JsonRecord
  }

  return (req.body || {}) as JsonRecord
}

function shouldReturnBase64Fallback(body: JsonRecord, publicUrl: string | null) {
  if (body.returnBase64 === true) return true

  // Nếu upload Supabase phía server không trả được publicUrl,
  // trả b64_json/dataUrl để frontend Factory dùng fallback uploadCoverToStorage().
  return !publicUrl
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res)

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
    })
  }

  try {
    const body = parseBody(req)
    const story = extractStoryInput(body)

    if (!story.title) {
      return res.status(400).json({
        ok: false,
        error: 'Missing story title',
      })
    }

    const { prompt, fallbackPrompt, coverConcept } = buildCoverPrompt(story)
    const imageResult = await generateCoverImage(prompt, fallbackPrompt)
    const imageBuffer = Buffer.from(imageResult.b64, 'base64')

    const uploadEnabled = body.uploadToSupabase !== false
    let publicUrl: string | null = null
    let storagePath: string | null = null
    let uploadWarning: string | null = null

    if (uploadEnabled) {
      try {
        const uploadResult = await uploadCoverToSupabase({
          imageBuffer,
          title: story.title,
          storyId: story.id || story.slug,
          explicitPath: safeString(body.storagePath),
        })

        publicUrl = uploadResult.publicUrl
        storagePath = uploadResult.storagePath

        if (!publicUrl) {
          uploadWarning =
            'Server Supabase upload did not return publicUrl. Returning b64_json fallback for client-side upload.'
        }
      } catch (uploadError: any) {
        uploadWarning =
          uploadError?.message ||
          'Server Supabase upload failed. Returning b64_json fallback for client-side upload.'

        console.error(
          '[generate-cover] supabase upload warning:',
          uploadError?.message || uploadError,
          uploadError?.detail || '',
        )
      }
    }

    const includeBase64 = shouldReturnBase64Fallback(body, publicUrl)
    const dataUrl = includeBase64 ? `data:image/png;base64,${imageResult.b64}` : undefined

    return res.status(200).json({
      ok: true,
      title: story.title,

      prompt,
      fallbackPrompt,
      promptUsed: imageResult.promptUsed,
      revisedPrompt: imageResult.revisedPrompt,

      fallbackUsed: imageResult.fallbackUsed,
      noTextRescueUsed: imageResult.noTextRescueUsed || false,
      emergencyFallbackUsed: imageResult.emergencyFallbackUsed || false,
      primaryError: imageResult.primaryError || null,
      fallbackError: imageResult.fallbackError || null,

      coverConcept,
      currentChapterCount: story.currentChapterCount || 0,
      targetChapters: story.targetChapters || 0,

      publicUrl,
      imageUrl: publicUrl,
      coverUrl: publicUrl,

      // Compatibility fields for Factory fallback.
      // factoryStoryRunner.ts currently checks b64_json and dataUrl if no publicUrl/imageUrl.
      b64_json: includeBase64 ? imageResult.b64 : undefined,
      imageBase64: includeBase64 ? imageResult.b64 : undefined,
      dataUrl,

      storagePath,
      bucket: uploadEnabled ? SUPABASE_COVER_BUCKET : null,
      uploadWarning,

      message: publicUrl
        ? 'Cover generated and uploaded successfully'
        : 'Cover generated successfully; upload fallback returned',
    })
  } catch (error: any) {
    console.error('[generate-cover] error:', error?.message || error, error?.detail || '')

    return res.status(500).json({
      ok: false,
      error: error?.message || 'Failed to generate cover',
      detail: error?.detail || null,
    })
  }
}