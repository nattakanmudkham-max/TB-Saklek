'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormInput, FormSelect, FormTextArea, SectionTitle } from '@/components/FormComponents'

const YEARS = [2569, 2568, 2567, 2566].map(y => ({ value: String(y), label: `ปีงบ ${y}` }))
const PTYPE = ['ในปอด', 'นอกปอด'].map(v => ({ value: v, label: v }))
const CXR = ['ปกติ', 'ผิดปกติ', 'ไม่ได้ CXR'].map(v => ({ value: v, label: v }))
const IGRA = ['ปกติ', 'ผิดปกติ', '-'].map(v => ({ value: v, label: v }))
const AFB = ['ปกติ', 'ผิดปกติ', 'Neg', '1+', '2+', '3+', '-'].map(v => ({ value: v, label: v }))

export default function NewContactPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    fiscal_year: '2568', registered_date: '',
    index_seq: '', index_tb_no: '', index_hn: '', index_name: '', index_age: '',
    index_patient_type: '', index_address: '',
    contact_seq: '', contact_hn: '', contact_name: '', contact_age: '',
    contact_address: '', contact_phone: '',
    cxr_date: '', cxr_result: '', sputum_afb: '', genexpert: '', igra: '', notes: ''
  })
  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('')
    const payload = {
      ...form,
      fiscal_year: parseInt(form.fiscal_year),
      index_seq: form.index_seq ? parseInt(form.index_seq) : null,
      index_age: form.index_age ? parseInt(form.index_age) : null,
      contact_seq: form.contact_seq ? parseInt(form.contact_seq) : null,
      contact_age: form.contact_age ? parseInt(form.contact_age) : null,
    }
    const { error } = await supabase.from('contacts').insert(payload)
    setSaving(false)
    if (error) setMsg('❌ ' + error.message)
    else { setMsg('✅ บันทึกสำเร็จ'); setTimeout(() => router.push('/contacts'), 1200) }
  }

  return (
    <div className="p-8 max-w-4xl">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-3">← กลับ</button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">เพิ่มทะเบียนผู้สัมผัสร่วมบ้าน</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-4">
          <SectionTitle>ข้อมูล Index Case (ผู้ป่วย TB)</SectionTitle>
          <FormSelect label="ปีงบประมาณ" options={YEARS} value={form.fiscal_year} onChange={e => set('fiscal_year', e.target.value)} required />
          <FormInput label="วันที่ขึ้นทะเบียน" type="date" value={form.registered_date} onChange={e => set('registered_date', e.target.value)} />
          <FormInput label="ลำดับที่ (Index)" type="number" value={form.index_seq} onChange={e => set('index_seq', e.target.value)} />
          <FormInput label="TB No." value={form.index_tb_no} onChange={e => set('index_tb_no', e.target.value)} placeholder="เช่น 682797800001" />
          <FormInput label="HN (Index)" value={form.index_hn} onChange={e => set('index_hn', e.target.value)} />
          <FormInput label="ชื่อ-สกุล (Index)" value={form.index_name} onChange={e => set('index_name', e.target.value)} required />
          <FormInput label="อายุ (Index)" type="number" value={form.index_age} onChange={e => set('index_age', e.target.value)} />
          <FormSelect label="จำแนกผู้ป่วย" options={PTYPE} value={form.index_patient_type} onChange={e => set('index_patient_type', e.target.value)} />
          <div className="col-span-full">
            <FormInput label="ที่อยู่ (Index)" value={form.index_address} onChange={e => set('index_address', e.target.value)} />
          </div>

          <SectionTitle>ข้อมูลผู้สัมผัส</SectionTitle>
          <FormInput label="ลำดับที่ (ผู้สัมผัส)" type="number" value={form.contact_seq} onChange={e => set('contact_seq', e.target.value)} />
          <FormInput label="HN (ผู้สัมผัส)" value={form.contact_hn} onChange={e => set('contact_hn', e.target.value)} />
          <FormInput label="ชื่อ-สกุล (ผู้สัมผัส)" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} required />
          <FormInput label="อายุ (ผู้สัมผัส)" type="number" value={form.contact_age} onChange={e => set('contact_age', e.target.value)} />
          <FormInput label="เบอร์โทรศัพท์" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} />
          <div className="col-span-full">
            <FormInput label="ที่อยู่ (ผู้สัมผัส)" value={form.contact_address} onChange={e => set('contact_address', e.target.value)} />
          </div>

          <SectionTitle>ผลการตรวจคัดกรอง</SectionTitle>
          <FormInput label="วันที่ CXR" type="date" value={form.cxr_date} onChange={e => set('cxr_date', e.target.value)} />
          <FormSelect label="ผลการคัดกรอง (CXR)" options={CXR} value={form.cxr_result} onChange={e => set('cxr_result', e.target.value)} />
          <FormSelect label="Sputum AFB" options={AFB} value={form.sputum_afb} onChange={e => set('sputum_afb', e.target.value)} />
          <FormSelect label="GeneXpert" options={AFB} value={form.genexpert} onChange={e => set('genexpert', e.target.value)} />
          <FormSelect label="IGRA" options={IGRA} value={form.igra} onChange={e => set('igra', e.target.value)} />
          <div className="col-span-full">
            <FormTextArea label="หมายเหตุ" value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
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
