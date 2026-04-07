'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormInput, FormSelect, FormTextArea, SectionTitle } from '@/components/FormComponents'

const YEARS = [2568, 2567, 2566, 2565].map(y => ({ value: String(y), label: `ปีงบ ${y}` }))
const CXR = ['ปกติ', 'ผิดปกติ', 'สงสัย TB', 'ไม่ได้ CXR'].map(v => ({ value: v, label: v }))
const TYPES = ['ข้าราชการ', 'พนักงานกระทรวง', 'ลูกจ้างชั่วคราว', 'จ้างเหมาบริการ'].map(v => ({ value: v, label: v }))
const DEPTS = [
  'กลุ่มการแพทย์', 'กลุ่มการพยาบาล', 'กลุ่มงานการพยาบาล', 'กลุ่มงานบริการปฐมภูมิและองค์รวม',
  'กลุ่มงานเภสัชกรรม', 'กลุ่มงานทันตกรรม', 'กลุ่มงานกายภาพบำบัด', 'กลุ่มงานรังสีวิทยา',
  'กลุ่มงานพยาธิวิทยา', 'กลุ่มงานเวชกรรมสังคม', 'กลุ่มงานประกันสุขภาพ',
  'กลุ่มงานบริหารทั่วไป', 'กลุ่มงานโภชนาการ'
].map(v => ({ value: v, label: v }))

export default function NewStaffPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    fiscal_year: '2568', seq: '', hn: '', prefix: '', first_name: '', last_name: '',
    position: '', staff_type: '', department: '', cxr_date: '', cxr_result: '', notes: ''
  })
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('')
    const payload = {
      ...form,
      fiscal_year: parseInt(form.fiscal_year),
      seq: form.seq ? parseInt(form.seq) : null,
      full_name: `${form.prefix}${form.first_name} ${form.last_name}`.trim()
    }
    const { error } = await supabase.from('staff_screening').insert(payload)
    setSaving(false)
    if (error) setMsg('❌ ' + error.message)
    else { setMsg('✅ บันทึกสำเร็จ'); setTimeout(() => router.push('/staff-screening'), 1200) }
  }

  return (
    <div className="p-8 max-w-3xl">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-3">← กลับ</button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">เพิ่มข้อมูลคัดกรองเจ้าหน้าที่</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-4">
          <SectionTitle>ข้อมูลทั่วไป</SectionTitle>
          <FormSelect label="ปีงบประมาณ" options={YEARS} value={form.fiscal_year} onChange={e => set('fiscal_year', e.target.value)} required />
          <FormInput label="ลำดับที่" type="number" value={form.seq} onChange={e => set('seq', e.target.value)} />
          <FormInput label="HN" value={form.hn} onChange={e => set('hn', e.target.value)} />

          <SectionTitle>ข้อมูลเจ้าหน้าที่</SectionTitle>
          <FormSelect label="คำนำหน้า" options={['นาย','นาง','นางสาว','ดร.','ผศ.','รศ.'].map(v=>({value:v,label:v}))} value={form.prefix} onChange={e => set('prefix', e.target.value)} />
          <FormInput label="ชื่อ" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
          <FormInput label="สกุล" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
          <FormInput label="ตำแหน่ง" value={form.position} onChange={e => set('position', e.target.value)} placeholder="เช่น พยาบาลวิชาชีพชำนาญการ" />
          <FormSelect label="ประเภท" options={TYPES} value={form.staff_type} onChange={e => set('staff_type', e.target.value)} />
          <FormSelect label="กลุ่มงาน/แผนก" options={DEPTS} value={form.department} onChange={e => set('department', e.target.value)} />

          <SectionTitle>ผลการคัดกรอง</SectionTitle>
          <FormInput label="วันที่ CXR" type="date" value={form.cxr_date} onChange={e => set('cxr_date', e.target.value)} />
          <FormSelect label="ผล CXR" options={CXR} value={form.cxr_result} onChange={e => set('cxr_result', e.target.value)} />
          <div className="col-span-full"><FormTextArea label="หมายเหตุ" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
        </div>
        {msg && <div className="mt-4 text-sm font-medium">{msg}</div>}
        <div className="flex gap-3 mt-6">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
          </button>
          <button type="button" onClick={() => router.back()} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">ยกเลิก</button>
        </div>
      </form>
    </div>
  )
}
