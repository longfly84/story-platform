import type { CoverBuildResult, CoverConcept, JsonRecord, StoryInput } from './coverTypes'
import { parseMaybeJson, uniqueStrings } from './coverText'
import { pickSummary } from './storyInput'
import { buildCoverConcept, pickStoryField } from './coverConcept'

function buildMainPrompt(story: StoryInput, storyDna: JsonRecord | null, coverConcept: CoverConcept): string {
  const title = story.title || 'Untitled Story'
  const summary = pickSummary(story)
  const genreList = uniqueStrings([
    story.genre || '',
    story.genreLabel || '',
    ...(story.genres || []),
    ...(story.tags || []),
  ]).join(', ')

  const corePremise =
    pickStoryField(storyDna, [
      'corePremise',
      'premise',
      'factory_seed',
      'hookVisual',
      'openingScene',
      'mainConflict',
    ]) || summary

  const openingScene =
    pickStoryField(storyDna, ['openingScene', 'sceneHook', 'visualArena']) || coverConcept.signatureScene

  const emotionalStake =
    pickStoryField(storyDna, ['emotionalStake', 'humanCost', 'childStake']) || coverConcept.mood

  const villainAttack = pickStoryField(storyDna, ['villainAttack', 'villainAttackType']) || ''
  const heroineCounter = pickStoryField(storyDna, ['heroineCounter', 'heroineCounterType']) || ''

  const style =
    story.cover_style ||
    story.visual_style ||
    story.style ||
    'premium Asian webnovel illustration, semi-realistic, dramatic, cinematic, elegant'

  const storyIdentitySeed = `${story.id || ''} | ${story.slug || ''} | ${title}`.trim()

  return `
Create a premium vertical web novel cover illustration for the story "${title}".

PRIMARY GOAL:
This image must read like a cinematic STORY POSTER, not a generic portrait.
It must feel SPECIFIC to this exact story title, premise, and clue object.
At thumbnail size, viewers must immediately understand there is a conflict, a clue, and a story setting.
The cover should be clearly distinguishable from other stories.

STORY INFORMATION:
- Story identity seed: ${storyIdentitySeed}
- Title: ${title}
- Genre / tags: ${genreList || 'female-drama, revenge, modern emotional mystery'}
- Core premise: ${corePremise || 'a woman faces betrayal, pressure, and hidden truth, then fights back'}
- Opening scene / hook: ${openingScene}
- Emotional stake: ${emotionalStake}
${villainAttack ? `- Villain attack: ${villainAttack}` : ''}
${heroineCounter ? `- Heroine counter move: ${heroineCounter}` : ''}
${summary ? `- Summary: ${summary}` : ''}

VISUAL FINGERPRINT FOR THIS EXACT STORY:
- Main heroine look: ${coverConcept.heroineLook}
- Main heroine action: ${coverConcept.heroineAction}
- Signature object from the story: ${coverConcept.signatureObject}
- Signature scene to depict: ${coverConcept.signatureScene}
- Main arena: ${coverConcept.arena}
- Mood: ${coverConcept.mood}
- Secondary figures that should appear or be strongly implied: ${coverConcept.secondaryFigures.join('; ')}
- Clue props that should appear clearly and noticeably: ${coverConcept.clueProps.join('; ')}
- Conflict visuals: ${coverConcept.conflictVisuals.join('; ')}
- Must-show elements: ${coverConcept.mustShowElements.join('; ')}
- Color tone: ${coverConcept.colorTone}
- Composition type: ${coverConcept.compositionType}
- Camera angle: ${coverConcept.cameraAngle}

STRICT COMPOSITION RULES:
- Vertical cover, optimized for mobile reading apps.
- This must be a MULTI-ELEMENT COMPOSITION, not a solo portrait.
- The heroine can be foreground, but she must SHARE the image with story conflict elements.
- The signature object must be one of the most visually prominent elements in the frame.
- If the title implies a concrete object or clue, that object must dominate the poster enough to be memorable.
- Show at least:
  1) the heroine,
  2) at least one secondary figure or clear silhouette,
  3) at least two plot-specific clue props,
  4) a visible story arena/background.
- Use a clear 3-layer composition: foreground heroine + signature object, midground clue/conflict, background arena.
- Make the clue props large enough to be noticeable.
- Show obvious narrative tension, not just beauty.
- The cover must feel specific to THIS story, not generic.
- Prefer a decisive story moment, not a passive posing moment.

STYLE:
- ${style}
- premium, emotionally intense, polished
- cinematic lighting
- crisp focal points
- readable as a small thumbnail
- no muddy darkness
- strong storytelling composition

ABSOLUTELY AVOID:
- solo woman portrait
- a single woman holding one paper in an empty dark background unless the title and plot are specifically about a critical paper/document
- generic office lady portrait
- plain standing woman with blurry background
- no-story poster
- repeated template look
- no secondary figure
- no visible clue props
- minimal composition
- text, title, logo, watermark, typography
- crowded tiny unreadable details
- generic interchangeable cover that could fit many unrelated stories
- these anti-generic rules: ${coverConcept.antiGenericNotes.join('; ')}

FINAL CHECK:
The final image must clearly show:
- who the heroine is,
- what kind of conflict she is in,
- what clue/object matters,
- where the story is happening,
- what makes this cover different from other stories.
`.trim()
}

function buildFallbackPrompt(story: StoryInput, coverConcept: CoverConcept): string {
  const title = story.title || 'Untitled Story'

  return `
Create a vertical dramatic web novel cover for "${title}".

This must be a SPECIFIC STORY POSTER, not a solo portrait.

Required visible elements:
- one determined modern heroine in the foreground
- one secondary figure or silhouette connected to the conflict
- one dominant signature object: ${coverConcept.signatureObject}
- at least one more clue prop from this list: ${coverConcept.clueProps.slice(0, 3).join('; ') || 'one key story clue'}
- one clear background arena: ${coverConcept.arena}
- one visible sign of conflict: ${coverConcept.conflictVisuals.slice(0, 2).join('; ') || coverConcept.mood}
- one specific story moment: ${coverConcept.signatureScene}

Heroine action:
- ${coverConcept.heroineAction}

Composition:
- vertical mobile novel cover
- cinematic poster composition
- ${coverConcept.compositionType}
- foreground heroine + signature object + midground conflict + background setting
- camera feel: ${coverConcept.cameraAngle}
- clear, readable, visually rich
- no text
- no watermark
- no generic solo portrait
- no empty background
- the signature object must be big and memorable
- avoid generic repeated template composition
`.trim()
}

export function buildCoverPrompt(story: StoryInput): CoverBuildResult {
  const storyDna =
    parseMaybeJson<JsonRecord>(story.story_dna) ||
    parseMaybeJson<JsonRecord>(story.storyDna)

  const coverConcept = buildCoverConcept(story, storyDna)

  return {
    prompt: buildMainPrompt(story, storyDna, coverConcept),
    fallbackPrompt: buildFallbackPrompt(story, coverConcept),
    coverConcept,
  }
}
