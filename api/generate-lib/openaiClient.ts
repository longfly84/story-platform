export function getOutputText(data: any) {
  if (typeof data?.output_text === 'string') {
    return data.output_text.trim()
  }

  if (Array.isArray(data?.output)) {
    const parts: string[] = []

    for (const item of data.output) {
      if (Array.isArray(item?.content)) {
        for (const content of item.content) {
          if (typeof content?.text === 'string') {
            parts.push(content.text)
          }
        }
      }
    }

    return parts.join('\n').trim()
  }

  return ''
}

export async function callOpenAIText(args: {
  apiKey: string
  model: string
  prompt: string
  maxOutputTokens: number
}) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify({
      model: args.model,
      input: args.prompt,
      max_output_tokens: args.maxOutputTokens,
    }),
  })

  const data = await readJsonResponse(response)

  return {
    response,
    data,
    text: response.ok && !data?.__nonJson ? getOutputText(data) : '',
  }
}

export async function readJsonResponse(response: Response) {
  const rawText = await response.text()

  try {
    return rawText ? JSON.parse(rawText) : null
  } catch {
    return {
      __nonJson: true,
      preview: rawText.slice(0, 800),
    }
  }
}
