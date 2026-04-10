'use client'
import { useState, useEffect, useRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  error?: string
}
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: { value: string; label: string }[]
  required?: boolean
}
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

const inputClass = `
  w-full border border-gray-200 rounded-lg px-4 py-3 text-base bg-white
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
  transition-all placeholder-gray-400
`

export function FormInput({ label, required, error, ...props }: InputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {label} {required && <span className="text-red-500 normal-case tracking-normal">*</span>}
      </label>
      <input className={inputClass + (error ? ' border-red-400 focus:ring-red-400' : '')} required={required} {...props} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function FormSelect({ label, options, required, ...props }: SelectProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {label} {required && <span className="text-red-500 normal-case tracking-normal">*</span>}
      </label>
      <select className={inputClass + ' cursor-pointer'} required={required} {...props}>
        <option value="">-- เลือก --</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export function FormTextArea({ label, ...props }: TextAreaProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</label>
      <textarea className={inputClass} rows={3} {...props} />
    </div>
  )
}

// SearchableSelect — Combobox with live filter
export function SearchableSelect({ label, options, value, onChange, required }: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setQuery('')
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const filtered = query
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {label} {required && <span className="text-red-500 normal-case tracking-normal">*</span>}
      </label>
      <div ref={ref} style={{ position: 'relative' }}>
        <input
          type="text"
          value={open ? query : value}
          placeholder={value || '-- พิมพ์เพื่อค้นหา --'}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { setOpen(true); setQuery('') }}
          className={inputClass}
          style={{ cursor: open ? 'text' : 'pointer', paddingRight: 28 }}
          required={required && !value}
        />
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 10, pointerEvents: 'none' }}>▼</span>
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 3px)', left: 0, right: 0,
            maxHeight: 220, overflowY: 'auto', background: '#fff',
            border: '1px solid #bfdbfe', borderRadius: 10, zIndex: 9999,
            boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
          }}>
            {filtered.length === 0
              ? <div style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 13 }}>ไม่พบข้อมูล</div>
              : filtered.map(opt => (
                <div
                  key={opt}
                  onMouseDown={() => { onChange(opt); setOpen(false); setQuery('') }}
                  style={{
                    padding: '9px 14px', fontSize: 13, cursor: 'pointer',
                    background: opt === value ? '#eff6ff' : 'transparent',
                    color: opt === value ? '#2563eb' : '#334155',
                    fontWeight: opt === value ? 600 : 400,
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >{opt}</div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

// แปลง ISO → DD/MM/YYYY พ.ศ.
function isoToThai(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return ''
  return `${d}/${m}/${parseInt(y) + 543}`
}

// แปลง DD/MM/YYYY พ.ศ. → ISO
function thaiToIso(thai: string): string {
  const parts = thai.replace(/[^\d/]/g, '').split('/')
  if (parts.length !== 3) return ''
  const [d, m, y] = parts
  const yearCE = parseInt(y) - 543
  if (isNaN(yearCE) || yearCE < 1800 || yearCE > 2100) return ''
  return `${yearCE}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

interface ThaiDateProps {
  label: string
  value: string
  onChange: (isoValue: string) => void
  required?: boolean
}

export function FormDateThai({ label, value, onChange, required }: ThaiDateProps) {
  const [display, setDisplay] = useState(() => isoToThai(value))
  const pickerRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setDisplay(isoToThai(value)) }, [value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setDisplay(raw)
    const iso = thaiToIso(raw)
    if (iso) onChange(iso)
  }

  function handleBlur() {
    const iso = thaiToIso(display)
    if (iso) setDisplay(isoToThai(iso))
  }

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const iso = e.target.value
    if (iso) { onChange(iso); setDisplay(isoToThai(iso)) }
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {label} {required && <span className="text-red-500 normal-case tracking-normal">*</span>}
      </label>
      <div style={{ display: 'flex', gap: 4 }}>
        <input type="text" value={display} onChange={handleChange} onBlur={handleBlur}
          placeholder="DD/MM/YYYY (พ.ศ.)" className={inputClass} required={required && !display} />
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button type="button"
            onClick={() => { pickerRef.current?.showPicker?.(); pickerRef.current?.click() }}
            style={{ height: '100%', padding: '0 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, cursor: 'pointer', fontSize: 15, color: '#2563eb', display: 'flex', alignItems: 'center' }}
          >📅</button>
          <input ref={pickerRef} type="date" value={value} onChange={handlePick} lang="th"
            style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }} tabIndex={-1} />
        </div>
      </div>
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full flex items-center gap-3 mt-6 mb-1">
      <h3 className="text-sm font-bold text-gray-700 whitespace-nowrap">{children}</h3>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}
