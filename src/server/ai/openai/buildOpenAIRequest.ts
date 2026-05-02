import femaleUrban from '@/server/ai/storyModules/femaleUrbanViral'

// Build payloads for OpenAI requests. Do NOT include API keys or send requests here.
// These helpers prepare the prompt and options so a separate server-side route can call OpenAI securely.

export function buildStoryPlanOpenAIRequest(input: { prompt?: string; settings?: any; dna?: any }) {
  // Use module builder to get structured plan
  const plan = femaleUrban.buildStoryPlan(input)
  const system = 'You are a helpful story planner. Output a JSON object matching the schema.'
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: `Create a story plan for: ${input.prompt || ''}. Use module defaults.` },
    { role: 'assistant', content: JSON.stringify(plan) },
  ]

  return {
    model: 'gpt-4',
    messages,
    temperature: 0.7,
    max_tokens: 800,
  }
}

export function buildChapterOpenAIRequest(input: { prompt?: string; settings?: any; dna?: any; length?: string }) {
  const chapter = femaleUrban.buildChapter(input)
  const system = 'You are a story writer. Produce reader-facing content and a technical notes section.'
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: `Write a chapter based on: ${input.prompt || ''}. Length: ${input.length || 'short'}.` },
    { role: 'assistant', content: JSON.stringify(chapter) },
  ]

  return {
    model: 'gpt-4',
    messages,
    temperature: 0.9,
    max_tokens: 1500,
  }
}

// Note: API key must stay server-side. Do not call OpenAI directly from client. These builders only prepare payloads.
