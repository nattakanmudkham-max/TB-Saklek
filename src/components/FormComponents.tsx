'use client'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
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
  w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
  transition-all placeholder-gray-400
`

export function FormInput({ label, required, ...props }: InputProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-500 normal-case tracking-normal">*</span>}
      </label>
      <input className={inputClass} required={required} {...props} />
    </div>
  )
}

export function FormSelect({ label, options, required, ...props }: SelectProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
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
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <textarea className={inputClass} rows={3} {...props} />
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
