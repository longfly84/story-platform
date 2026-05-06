import type { JsonRecord, StoryInput } from './coverTypes.js'
import { safeArray, safeString } from './coverText.js'

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
    style: safeString(source.style || source.styleLabel || body.style || body.styleLabel),
    visual_style: safeString(source.visual_style || source.visualStyle || source.styleLabel || body.visual_style || body.visualStyle || body.styleLabel),
    cover_style: safeString(source.cover_style || source.coverStyle || source.imageStyle || body.cover_style || body.coverStyle || body.imageStyle),
  }
}

export function pickSummary(story: StoryInput): string {
  return safeString(story.summary) || safeString(story.description) || ''
}
