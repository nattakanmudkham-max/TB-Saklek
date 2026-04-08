'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormInput, FormSelect, FormTextArea, SectionTitle } from '@/components/FormComponents'

const YEARS = [2569, 2568, 2567].map(y => ({ value: String(y), label: `ปีงบ ${y}` }))
const PTYPE = ['ในปอด', 'นอกปอด'].map(v => ({ value: v, label: v }))
const CXR = ['ปกติ', 'ผิดปกติ', 'ไม่ได้ CXR'].map(v => ({ value: v, label: v }))
const IGRA_OPTS = ['ปกติ', 'ผิดปกติ', '-'].map(v => ({ value: v, label: v }))

export default function EditLTBIPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [form, setForm] = useState<Record<string, string>>({
    fiscal_year: '2568', registered_date: '',
    index_seq: '', index_tb_no: '', index_hn: '', index_name: '', index_age: '',
    index_patient_type: '', index_address: '',
    contact_seq: '', contact_hn: '', contact_name: '', contact_age: '',
    contact_address: '', contact_phone: '',
    cxr_date: '', cxr_result: '', igra: 'ผิดปกติ', treatment_note: '', notes: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('ltbi_treatment').select('*').eq('id', params.id).single()
      if (data) {
        const s = (v: unknown) => v != null ? String(v) : ''
        setForm({
          fiscal_year: s(data.fiscal_year) || '2568',
          registered_date: s(data.registered_date),
          index_seq: s(data.index_seq), index_tb_no: s(data.index_tb_no),
          index_hn: s(data.index_hn), index_name: s(data.index_name),
          index_age: s(data.index_age), index_patient_type: s(data.index_patient_type),
          index_address: s(data.index_address),
          contact_seq: s(data.contact_seq), contact_hn: s(data.contact_hn),
          contact_name: s(data.contact_name), contact_age: s(data.contact_age),
          contact_address: s(data.contact_address), contact_phone: s(data.contact_phone),
          cxr_date: s(data.cxr_date), cxr_result: s(data.cxr_result),
          igra: s(data.igra) || 'ผิดปกติ',
          treatment_note: s(data.treatment_note), notes: s(data.notes),
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
      index_seq: form.index_seq ? parseInt(form.index_seq) : null,
      index_age: form.index_age ? parseInt(form.index_age) : null,
      contact_seq: form.contact_seq ? parseInt(form.contact_seq) : null,
      contact_age: form.contact_age ? parseInt(form.contact_age) : null,
    }
    const { error } = await supabase.from('ltbi_treatment').update(payload).eq('id', params.id)
    setSaving(false)
    if (error) setMsg('❌ ' + error.message)
    else { setMsg('✅ บันทึกสำเร็จ'); setTimeout(() => router.push('/ltbi'), 1200) }
  }

  async function handleDelete() {
    if (!confirm('ยืนยันการลบข้อมูลรายนี้?')) return
    await supabase.from('ltbi_treatment').delete().eq('id', params.id)
    router.push('/ltbi')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#94a3b8', fontSize: 14 }}>⏳ กำลังโหลดข้อมูล...</div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '18px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => router.back()} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#475569', cursor: 'pointer' }}>← กลับ</button>
            <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#f3e8ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🧪</div>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>แก้ไขข้อมูล LTBI</h1>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{form.contact_name}</p>
              </div>
            </div>
          </div>
          <button onClick={handleDelete} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>🗑 ลบข้อมูล</button>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 860 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="grid grid-cols-2 gap-5">
              <SectionTitle>Index Case (ผู้ป่วย TB ต้นทาง)</SectionTitle>
              <FormSelect label="ปีงบประมาณ" options={YEARS} value={form.fiscal_year} onChange={e => set('fiscal_year', e.target.value)} required />
              <FormInput label="วันที่ขึ้นทะเบียน" type="date" value={form.registered_date} onChange={e => set('registered_date', e.target.value)} />
              <FormInput label="ลำดับ (Index)" type="number" value={form.index_seq} onChange={e => set('index_seq', e.target.value)} />
              <FormInput label="TB No." value={form.index_tb_no} onChange={e => set('index_tb_no', e.target.value)} />
              <FormInput label="HN (Index)" value={form.index_hn} onChange={e => set('index_hn', e.target.value)} />
              <FormInput label="ชื่อ-สกุล (Index)" value={form.index_name} onChange={e => set('index_name', e.target.value)} required />
              <FormInput label="อายุ (Index)" type="number" value={form.index_age} onChange={e => set('index_age', e.target.value)} />
              <FormSelect label="จำแนกผู้ป่วย" options={PTYPE} value={form.index_patient_type} onChange={e => set('index_patient_type', e.target.value)} />
              <div className="col-span-full"><FormInput label="ที่อยู่ (Index)" value={form.index_address} onChange={e => set('index_address', e.target.value)} /></div>

              <SectionTitle>ผู้สัมผัสที่รับการรักษา LTBI</SectionTitle>
              <FormInput label="ลำดับ" type="number" value={form.contact_seq} onChange={e => set('contact_seq', e.target.value)} />
              <FormInput label="HN (ผู้สัมผัส)" value={form.contact_hn} onChange={e => set('contact_hn', e.target.value)} />
              <FormInput label="ชื่อ-สกุล (ผู้สัมผัส)" value={form.contact_name} onChange={e => set('contact_name', e.target.value)} required />
              <FormInput label="อายุ" type="number" value={form.contact_age} onChange={e => set('contact_age', e.target.value)} />
              <FormInput label="เบอร์โทรศัพท์" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} />
              <div className="col-span-full"><FormInput label="ที่อยู่" value={form.contact_address} onChange={e => set('contact_address', e.target.value)} /></div>

              <SectionTitle>ผลการตรวจและการรักษา</SectionTitle>
              <FormInput label="วันที่ CXR" type="date" value={form.cxr_date} onChange={e => set('cxr_date', e.target.value)} />
              <FormSelect label="ผล CXR" options={CXR} value={form.cxr_result} onChange={e => set('cxr_result', e.target.value)} />
              <FormSelect label="IGRA" options={IGRA_OPTS} value={form.igra} onChange={e => set('igra', e.target.value)} />
              <FormInput label="หมายเหตุการรักษา IGRA" value={form.treatment_note} onChange={e => set('treatment_note', e.target.value)} />
              <div className="col-span-full"><FormTextArea label="หมายเหตุเพิ่มเติม" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
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
