import React, { useState } from 'react'

function stripMeta(text = '') {
  return String(text)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[Summary\][\s\S]*?(?=\n\n|$)/gi, '')
    .replace(/\[Cliffhanger\][\s\S]*?(?=\n\n|$)/gi, '')
    .replace(/"summary"\s*:\s*"[\s\S]*?"\s*,?/gi, '')
    .replace(/"cliffhanger"\s*:\s*"[\s\S]*?"\s*,?/gi, '')
    .replace(/\{[\s\S]*\}/g, '')
    .trim()
}

const AIGeneratePanel: React.FC<any> = (props) => {
  // props may include aiResult or result object
  const ai = props.aiResult || props.result || null
  const [debugOpen, setDebugOpen] = useState(false)
  const [copyLabel, setCopyLabel] = useState('Copy')
  const [copyCoverLabel, setCopyCoverLabel] = useState('Copy Cover Prompt')

  async function doCopy(text: string) {
    if (!text) return false
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (e) {
      // fallback to execCommand
      try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        return true
      } catch (err) {
        if (import.meta.env.DEV) console.error('clipboard copy failed', err)
        return false
      }
    }
  }

  return (
    <div className="mt-8 mb-12 rounded border border-zinc-800 p-4 bg-zinc-950/30">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">AI Generate</h2>
        <div className="text-sm text-zinc-400">{ai ? `Provider: ${ai.provider_meta?.provider || ai.provider || 'unknown'}` : ''}</div>
        {ai && (
          <button className="text-sm text-zinc-400" onClick={() => setDebugOpen(s => !s)}>{debugOpen ? 'Hide debug' : 'Show debug'}</button>
        )}
      </div>

      <div className="mt-3 grid gap-2">
        {ai ? (
          <div>
            <div className="text-xl font-bold text-zinc-100 mb-2">{ai.title || 'Chương mới'}</div>
            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-zinc-100">{stripMeta(ai.content)}</div>
            {ai.content && ai.content.startsWith('OpenAI generation failed') && (
              <div className="mt-2 text-sm text-red-400">OpenAI generation failed. See debug for details.</div>
            )}
            <div className="mt-3 flex gap-2">
              <button onClick={async (e) => {
                e.preventDefault()
                const text = stripMeta(ai.content || '')
                const ok = await doCopy(text)
                if (ok) {
                  setCopyLabel('Copied!')
                  setTimeout(() => setCopyLabel('Copy'), 1500)
                } else {
                  alert('Copy failed')
                }
              }} className="rounded bg-zinc-800 px-3 py-1 text-sm">{copyLabel}</button>

              <button onClick={async (e) => {
                e.preventDefault()
                const cp = props.coverPrompt || (ai && (ai.coverPrompt || ai.cover_prompt || ai.cover || '')) || ''
                if (!cp) { alert('No cover prompt'); return }
                const ok = await doCopy(cp)
                if (ok) {
                  setCopyCoverLabel('Copied!')
                  setTimeout(() => setCopyCoverLabel('Copy Cover Prompt'), 1500)
                } else {
                  alert('Copy cover prompt failed')
                }
              }} className="rounded bg-zinc-700 px-3 py-1 text-sm">{copyCoverLabel}</button>
            </div>
            {/* small collapsed debug box */}
            {debugOpen && (
              <pre className="mt-3 p-2 text-xs text-zinc-300 bg-black/30 overflow-auto">{JSON.stringify(ai, null, 2)}</pre>
            )}
          </div>
        ) : (
          // fallback to children for other controls
          props.children
        )}
      </div>
    </div>
  )
}

export default AIGeneratePanel
