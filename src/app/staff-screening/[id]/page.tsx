'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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

export default function EditStaffPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [form, setForm] = useState<Record<string, string>>({
    fiscal_year: '2568', seq: '', hn: '', prefix: '', first_name: '', last_name: '',
    full_name: '', position: '', staff_type: '', department: '', cxr_date: '', cxr_result: '', notes: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('staff_screening').select('*').eq('id', params.id).single()
      if (data) {
        setForm({
          fiscal_year: String(data.fiscal_year ?? '2568'),
          seq: String(data.seq ?? ''),
          hn: String(data.hn ?? ''),
          prefix: data.prefix ?? '',
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          full_name: data.full_name ?? '',
          position: data.position ?? '',
          staff_type: data.staff_type ?? '',
          department: data.department ?? '',
          cxr_date: data.cxr_date ?? '',
          cxr_result: data.cxr_result ?? '',
          notes: data.notes ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('')
    const payload = {
      ...form,
      fiscal_year: parseInt(form.fiscal_year),
      seq: form.seq ? parseInt(form.seq) : null,
      full_name: form.full_name || `${form.prefix}${form.first_name} ${form.last_name}`.trim(),
    }
    const { error } = await supabase.from('staff_screening').update(payload).eq('id', params.id)
    setSaving(false)
    if (error) setMsg('❌ ' + error.message)
    else { setMsg('✅ บันทึกสำเร็จ'); setTimeout(() => router.push('/staff-screening'), 1200) }
  }

  async function handleDelete() {
    if (!confirm('ยืนยันการลบข้อมูลรายนี้?')) return
    await supabase.from('staff_screening').delete().eq('id', params.id)
    router.push('/staff-screening')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94a3b8', fontSize: 14 }}>
      ⏳ กำลังโหลดข้อมูล...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '18px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => router.back()} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#475569', cursor: 'pointer' }}>← กลับ</button>
            <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#dbeafe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>แก้ไขข้อมูลเจ้าหน้าที่</h1>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{form.full_name}</p>
              </div>
            </div>
          </div>
          <button onClick={handleDelete} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            🗑 ลบข้อมูล
          </button>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 760 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="grid grid-cols-2 gap-5">
              <SectionTitle>ข้อมูลทั่วไป</SectionTitle>
              <FormSelect label="ปีงบประมาณ" options={YEARS} value={form.fiscal_year} onChange={e => set('fiscal_year', e.target.value)} required />
              <FormInput label="ลำดับที่" type="number" value={form.seq} onChange={e => set('seq', e.target.value)} />
              <FormInput label="HN" value={form.hn} onChange={e => set('hn', e.target.value)} />

              <SectionTitle>ข้อมูลเจ้าหน้าที่</SectionTitle>
              <FormSelect label="คำนำหน้า" options={['นาย','นาง','นางสาว','ดร.','ผศ.','รศ.'].map(v=>({value:v,label:v}))} value={form.prefix} onChange={e => set('prefix', e.target.value)} />
              <FormInput label="ชื่อ" value={form.first_name} onChange={e => set('first_name', e.target.value)} />
              <FormInput label="สกุล" value={form.last_name} onChange={e => set('last_name', e.target.value)} />
              <div className="col-span-full">
                <FormInput label="ชื่อ-สกุล (เต็ม)" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
              </div>
              <FormInput label="ตำแหน่ง" value={form.position} onChange={e => set('position', e.target.value)} />
              <FormSelect label="ประเภท" options={TYPES} value={form.staff_type} onChange={e => set('staff_type', e.target.value)} />
              <FormSelect label="กลุ่มงาน/แผนก" options={DEPTS} value={form.department} onChange={e => set('department', e.target.value)} />

              <SectionTitle>ผลการคัดกรอง</SectionTitle>
              <FormInput label="วันที่ CXR" type="date" value={form.cxr_date} onChange={e => set('cxr_date', e.target.value)} />
              <FormSelect label="ผล CXR" options={CXR} value={form.cxr_result} onChange={e => set('cxr_result', e.target.value)} />
              <div className="col-span-full">
                <FormTextArea label="หมายเหตุ" value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
            </div>

            {msg && (
              <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 10, background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2', color: msg.includes('✅') ? '#15803d' : '#b91c1c', fontSize: 14, fontWeight: 500, border: `1px solid ${msg.includes('✅') ? '#bbf7d0' : '#fecaca'}` }}>{msg}</div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
              <button type="submit" disabled={saving} style={{ background: saving ? '#93c5fd' : '#2563eb', color: '#fff', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
                {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
              </button>
              <button type="button" onClick={() => router.back()} style={{ background: '#fff', color: '#475569', padding: '10px 20px', borderRadius: 10, fontSize: 14, border: '1px solid #e2e8f0', cursor: 'pointer' }}>ยกเลิก</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
