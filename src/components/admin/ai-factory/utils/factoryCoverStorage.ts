import { supabase } from '../../../../lib/supabase'

export async function uploadCoverToStorage(params: {
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

export async function updateStoryCover(params: {
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
