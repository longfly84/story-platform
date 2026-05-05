import type { JsonRecord, StoryInput } from './coverTypes'
import { safeArray, safeString } from './coverText'

export function extractStoryInput(body: JsonRecord): StoryInput {
  const source = body.story || body.storyData || body.payload || body
  const storyDna = source.story_dna ?? source.storyDna ?? body.story_dna ?? body.storyDna ?? null

  return {
    id: safeString(source.id || body.storyId || body.id),
    title: safeString(source.title || body.title),
    summary: safeString(source.summary || body.summary),
    description: safeString(source.description || source.desc || body.description || body.desc),
    genre: safeString(source.genre || body.genre),
    genreLabel: safeString(source.genreLabel || body.genreLabel),
    genres: safeArray(source.genres || body.genres),
    tags: safeArray(source.tags || body.tags),
    slug: safeString(source.slug || body.slug),
    story_dna: storyDna,
    storyDna,
    author: safeString(source.author || body.author),
    style: safeString(source.style || body.style),
    visual_style: safeString(source.visual_style || body.visual_style),
    cover_style: safeString(source.cover_style || body.cover_style),
  }
}

export function pickSummary(story: StoryInput): string {
  return safeString(story.summary) || safeString(story.description) || ''
}
