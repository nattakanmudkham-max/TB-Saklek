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

export function FormInput({ label, required, ...props }: InputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={required}
        {...props}
      />
    </div>
  )
}

export function FormSelect({ label, options, required, ...props }: SelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        required={required}
        {...props}
      >
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        {...props}
      />
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2 mt-6 mb-4 col-span-full">
      {children}
    </h3>
  )
}
