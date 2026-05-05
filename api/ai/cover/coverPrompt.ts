import type { CoverBuildResult, CoverConcept, JsonRecord, StoryInput } from './coverTypes.js'
import { parseMaybeJson, uniqueStrings } from './coverText.js'
import { pickSummary } from './storyInput.js'
import { buildCoverConcept, pickStoryField } from './coverConcept.js'

function joinLines(lines: Array<string | false | null | undefined>) {
  return lines.filter(Boolean).join('\n')
}

function buildStoryFacts(story: StoryInput, storyDna: JsonRecord | null, coverConcept: CoverConcept) {
  const summary = pickSummary(story)

  const genreList = uniqueStrings([
    story.genre || '',
    story.genreLabel || '',
    ...(story.genres || []),
    ...(story.tags || []),
  ])

  const corePremise =
    pickStoryField(storyDna, [
      'corePremise',
      'premise',
      'factory_seed',
      'hookVisual',
      'openingScene',
      'mainConflict',
      'incitingIncident',
    ]) || summary

  const openingScene =
    pickStoryField(storyDna, ['openingScene', 'sceneHook', 'visualArena']) || coverConcept.signatureScene

  const emotionalStake =
    pickStoryField(storyDna, ['emotionalStake', 'humanCost', 'childStake']) || coverConcept.mood

  const villainAttack = pickStoryField(storyDna, ['villainAttack', 'villainAttackType']) || ''
  const heroineCounter = pickStoryField(storyDna, ['heroineCounter', 'heroineCounterType']) || ''
  const hiddenTruth = pickStoryField(storyDna, ['hiddenTruth', 'hiddenTruthType']) || ''
  const evidenceObject =
    pickStoryField(storyDna, ['evidenceObject', 'evidenceType', 'hookVisual']) || coverConcept.signatureObject
  const setting = pickStoryField(storyDna, ['setting', 'arena', 'visualArena']) || coverConcept.arena
  const publicPressure = pickStoryField(storyDna, ['publicPressure', 'powerStructure']) || ''

  return {
    summary,
    genreList,
    corePremise,
    openingScene,
    emotionalStake,
    villainAttack,
    heroineCounter,
    hiddenTruth,
    evidenceObject,
    setting,
    publicPressure,
  }
}

function buildMainPrompt(story: StoryInput, storyDna: JsonRecord | null, coverConcept: CoverConcept): string {
  const title = story.title || 'Untitled Story'
  const storyIdentitySeed = `${story.id || ''} | ${story.slug || ''} | ${title}`.trim()

  const {
    summary,
    genreList,
    corePremise,
    openingScene,
    emotionalStake,
    villainAttack,
    heroineCounter,
    hiddenTruth,
    evidenceObject,
    setting,
    publicPressure,
  } = buildStoryFacts(story, storyDna, coverConcept)

  const style =
    story.cover_style ||
    story.visual_style ||
    story.style ||
    'premium Asian webnovel illustration, semi-realistic, dramatic, cinematic, elegant'

  return `
Create a premium vertical web novel cover illustration for the story "${title}".

PRIMARY GOAL:
This image must look like a SPECIFIC STORY POSTER for this exact story, not a generic beautiful portrait.
The viewer should be able to guess the story conflict from the image alone.
The image must clearly communicate:
1) who the heroine is,
2) what conflict she is facing,
3) what clue or object matters,
4) where the story is happening.

STORY IDENTITY:
- Story identity seed: ${storyIdentitySeed}
- Title: ${title}
- Genre / tags: ${genreList.join(', ') || 'female-drama, revenge, modern emotional mystery'}
- Core premise: ${corePremise || 'a woman faces betrayal, pressure, and hidden truth, then fights back'}
- Opening scene / hook: ${openingScene}
- Emotional stake: ${emotionalStake}
${villainAttack ? `- Villain attack: ${villainAttack}` : ''}
${heroineCounter ? `- Heroine counter move: ${heroineCounter}` : ''}
${hiddenTruth ? `- Hidden truth: ${hiddenTruth}` : ''}
${publicPressure ? `- Public pressure / power context: ${publicPressure}` : ''}
${summary ? `- Summary: ${summary}` : ''}

MANDATORY STORY VISUALS:
- Main heroine look: ${coverConcept.heroineLook}
- Main heroine action: ${coverConcept.heroineAction}
- Signature object: ${coverConcept.signatureObject}
- Evidence / clue object: ${evidenceObject}
- Signature scene: ${coverConcept.signatureScene}
- Main arena / setting: ${setting}
- Mood: ${coverConcept.mood}
- Secondary figures that must appear or be very clearly implied: ${coverConcept.secondaryFigures.join('; ')}
- Plot clue props that should be clearly visible: ${coverConcept.clueProps.join('; ')}
- Conflict visuals: ${coverConcept.conflictVisuals.join('; ')}
- Must-show elements: ${coverConcept.mustShowElements.join('; ')}
- Color tone: ${coverConcept.colorTone}
- Composition type: ${coverConcept.compositionType}
- Camera angle: ${coverConcept.cameraAngle}

VERY IMPORTANT COMPOSITION RULES:
- Vertical cover, optimized for mobile reading apps.
- This must be a STORY SCENE, not a fashion portrait.
- This must be a MULTI-ELEMENT COMPOSITION.
- Do NOT make a single character standing alone in the center with a vague dark background.
- Prefer asymmetrical storytelling composition, not a centered static pose.
- The heroine may be foreground, but she must share the frame with conflict elements.
- At least one secondary figure or strong silhouette must be present.
- The signature object must be large enough to notice clearly at thumbnail size.
- At least two clue props must be visible.
- The background arena must be visible and meaningful, not blurred into nothing.
- Use a clear 3-layer composition:
  foreground = heroine + signature object,
  midground = conflict / secondary figure / clue props,
  background = story setting.
- Freeze a decisive story moment: discovery, confrontation, betrayal reveal, evidence reveal, public humiliation, or imminent counterattack.
- The final image must feel unique to this story and should not be reusable for unrelated stories.

VISUAL PRIORITIES:
- prioritize story clarity over pure beauty
- prioritize the exact clue object over generic glamour
- prioritize narrative tension over posing
- prioritize a readable poster silhouette and strong thumbnail readability
- if the title implies a concrete object, that object must be unmistakable
- if the story implies betrayal, confrontation, witness, truth reveal, inheritance, hotel/resort, airport, company war, hospital truth, wedding scandal, or school conflict, show those elements clearly

STYLE:
- ${style}
- premium, emotionally intense, polished
- cinematic lighting
- crisp focal points
- visually rich
- readable as a small thumbnail
- not muddy
- not overly minimal

ABSOLUTELY AVOID:
- solo woman portrait
- a centered single character with empty background
- generic office lady portrait
- plain standing woman with blurry background
- one-person poster with no scene
- repeated template look
- no secondary figure
- no visible clue props
- no meaningful background
- minimal composition
- text, title, logo, watermark, typography
- crowded tiny unreadable details
- generic interchangeable cover that could fit many unrelated stories
- if the clue object is not paper, do not default to heroine holding paper
- anti-generic rules: ${coverConcept.antiGenericNotes.join('; ')}

FINAL QUALITY CHECK:
Before finalizing the cover, ensure the image clearly shows:
- the heroine,
- at least one other human presence or silhouette,
- the key story object,
- the story location,
- the core conflict,
- and why this story is different from others.
`.trim()
}

function buildFallbackPrompt(story: StoryInput, coverConcept: CoverConcept): string {
  const title = story.title || 'Untitled Story'

  return `
Create a vertical dramatic web novel cover for "${title}".

This cover must be a SPECIFIC NARRATIVE POSTER, not a solo portrait.

NON-NEGOTIABLE ELEMENTS:
- one modern heroine in the foreground
- one secondary figure, opponent, betrayer, or clear silhouette
- one dominant signature object: ${coverConcept.signatureObject}
- at least one more clue prop from: ${coverConcept.clueProps.slice(0, 3).join('; ') || 'one key story clue'}
- one clear story setting: ${coverConcept.arena}
- one visible sign of conflict: ${coverConcept.conflictVisuals.slice(0, 2).join('; ') || coverConcept.mood}
- one frozen dramatic story moment: ${coverConcept.signatureScene}

HEROINE ACTION:
- ${coverConcept.heroineAction}

COMPOSITION RULES:
- vertical mobile novel cover
- cinematic storytelling poster
- ${coverConcept.compositionType}
- foreground heroine + signature object + midground conflict + background setting
- camera feel: ${coverConcept.cameraAngle}
- asymmetrical poster composition preferred
- not a centered static pose
- clear, readable, visually rich
- the signature object must be big and memorable
- the background must explain where the scene happens
- no text
- no watermark
- no generic solo portrait
- no empty background
- no repeated template composition
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