import type { Option } from './aiWriterOptions'

type SelectFieldProps = {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  disabled?: boolean
}

export default function SelectField({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: SelectFieldProps) {
  return (
    <label className="grid gap-1 text-xs text-zinc-400">
      {label}

      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={[
          'rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-sm font-medium text-zinc-100 outline-none focus:border-amber-400',
          disabled ? 'cursor-not-allowed opacity-50' : '',
        ].join(' ')}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}