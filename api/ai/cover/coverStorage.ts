import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'

import { sanitizeFileName } from './coverText'

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ''

export const SUPABASE_COVER_BUCKET = process.env.SUPABASE_COVER_BUCKET || 'story-covers'

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null

export async function uploadCoverToSupabase(args: {
  imageBuffer: Buffer
  title: string
  storyId?: string
  explicitPath?: string
}) {
  if (!supabase) {
    return { publicUrl: null as string | null, storagePath: null as string | null }
  }

  const folderStoryId = sanitizeFileName(args.storyId || '') || 'unknown-story'
  const safeTitle = sanitizeFileName(args.title) || 'story-cover'
  const storagePath =
    args.explicitPath ||
    `stories/${folderStoryId}/${safeTitle}-${randomUUID()}.png`

  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_COVER_BUCKET)
    .upload(storagePath, args.imageBuffer, {
      contentType: 'image/png',
      upsert: true,
    })

  if (uploadError) {
    const error = new Error(`Supabase upload failed: ${uploadError.message}`) as Error & {
      detail?: unknown
    }
    error.detail = uploadError
    throw error
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(SUPABASE_COVER_BUCKET).getPublicUrl(storagePath)

  return {
    publicUrl,
    storagePath,
  }
}
