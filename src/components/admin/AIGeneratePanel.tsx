import React from 'react'

const AIGeneratePanel: React.FC<any> = (props) => {
  // props should include all handlers and state from AdminPage
  return (
    <div className="mt-8 mb-12 rounded border border-zinc-800 p-4 bg-zinc-950/30">
      <h2 className="text-lg font-semibold text-zinc-100">AI Generate (Mock)</h2>
      <div className="mt-3 grid gap-2">
        {/* render via passed JSX to keep minimal coupling */}
        {props.children}
      </div>
    </div>
  )
}

export default AIGeneratePanel
