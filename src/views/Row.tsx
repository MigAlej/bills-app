import { euros } from '../lib/dates'

interface Props {
  label: string
  value: number
  sign?: string
  bold?: boolean
  // Bold and green, or red when negative
  strong?: boolean
  hint?: string
}

function Row({ label, value, sign, bold, strong, hint }: Props) {
  const color = strong ? (value < 0 ? 'text-red-600' : 'text-emerald-700') : ''
  return (
    <div className={`flex justify-between gap-2 ${strong || bold ? 'font-semibold' : ''}`}>
      <dt className={strong || bold ? '' : 'text-slate-600'}>
        {label}
        {hint && <span className="block text-xs font-normal text-slate-400">{hint}</span>}
      </dt>
      <dd className={`whitespace-nowrap ${color}`}>{sign && `${sign} `}{euros(value)}</dd>
    </div>
  )
}

export default Row
