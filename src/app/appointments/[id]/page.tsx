'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormInput, FormSelect, FormTextArea, SectionTitle } from '@/components/FormComponents'

const YEARS = [2569, 2568, 2567, 2566].map(y => ({ value: String(y), label: `ปีงบ ${y}` }))
const REGIMENS = ['2HRZE/4HR', '2HRZE/7HR', '3HRZE/4HR', '3HRZE/6HR', '4HRZE/6HR', '2HRE/7HR', '6RZEL', '12IEL', '12 RZL'].map(v => ({ value: v, label: v }))

export default function EditAppointmentPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [form, setForm] = useState<Record<string, string>>({
    fiscal_year: '2568', tb_no: '', hn: '', full_name: '', address: '',
    id_card: '', phone: '', underlying_disease: '',
    treatment_start_date: '', treatment_end_date: '', regimen: '2HRZE/4HR',
    dose_isoniazid: '', dose_rifampicin: '', dose_pyrazinamide: '', dose_ethambutol: '', dose_levofloxacin: '',
    appt_2weeks: '',
    appt_m1: '', appt_m2: '', appt_m3: '', appt_m4: '', appt_m5: '', appt_m6: '',
    appt_m7: '', appt_m8: '', appt_m9: '', appt_m10: '', appt_m11: '', appt_m12: '',
    appt_lab: '', notes: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('appointments').select('*').eq('id', params.id).single()
      if (data) {
        const s = (v: unknown) => v != null ? String(v) : ''
        setForm({
          fiscal_year: s(data.fiscal_year) || '2568',
          tb_no: s(data.tb_no), hn: s(data.hn),
          full_name: s(data.full_name), address: s(data.address),
          id_card: s(data.id_card), phone: s(data.phone),
          underlying_disease: s(data.underlying_disease),
          treatment_start_date: s(data.treatment_start_date),
          treatment_end_date: s(data.treatment_end_date),
          regimen: s(data.regimen) || '2HRZE/4HR',
          dose_isoniazid: s(data.dose_isoniazid), dose_rifampicin: s(data.dose_rifampicin),
          dose_pyrazinamide: s(data.dose_pyrazinamide), dose_ethambutol: s(data.dose_ethambutol),
          dose_levofloxacin: s(data.dose_levofloxacin),
          appt_2weeks: s(data.appt_2weeks),
          appt_m1: s(data.appt_m1), appt_m2: s(data.appt_m2), appt_m3: s(data.appt_m3),
          appt_m4: s(data.appt_m4), appt_m5: s(data.appt_m5), appt_m6: s(data.appt_m6),
          appt_m7: s(data.appt_m7), appt_m8: s(data.appt_m8), appt_m9: s(data.appt_m9),
          appt_m10: s(data.appt_m10), appt_m11: s(data.appt_m11), appt_m12: s(data.appt_m12),
          appt_lab: s(data.appt_lab), notes: s(data.notes),
        })
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('')
    const payload = { ...form, fiscal_year: parseInt(form.fiscal_year) }
    const { error } = await supabase.from('appointments').update(payload).eq('id', params.id)
    setSaving(false)
    if (error) setMsg('❌ ' + error.message)
    else { setMsg('✅ บันทึกสำเร็จ'); setTimeout(() => router.push('/appointments'), 1200) }
  }

  async function handleDelete() {
    if (!confirm('ยืนยันการลบข้อมูลรายนี้?')) return
    await supabase.from('appointments').delete().eq('id', params.id)
    router.push('/appointments')
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
              <div style={{ width: 36, height: 36, background: '#dcfce7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📅</div>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>แก้ไขตารางนัดรับยา</h1>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{form.full_name}</p>
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
              <SectionTitle>ข้อมูลผู้ป่วย</SectionTitle>
              <FormSelect label="ปีงบประมาณ" options={YEARS} value={form.fiscal_year} onChange={e => set('fiscal_year', e.target.value)} required />
              <FormInput label="TB No." value={form.tb_no} onChange={e => set('tb_no', e.target.value)} />
              <FormInput label="HN" value={form.hn} onChange={e => set('hn', e.target.value)} />
              <FormInput label="ชื่อ-สกุล" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
              <FormInput label="เลขบัตรประชาชน" value={form.id_card} onChange={e => set('id_card', e.target.value)} />
              <FormInput label="เบอร์โทรศัพท์" value={form.phone} onChange={e => set('phone', e.target.value)} />
              <div className="col-span-full"><FormInput label="ที่อยู่" value={form.address} onChange={e => set('address', e.target.value)} /></div>
              <div className="col-span-full"><FormInput label="โรคประจำตัว" value={form.underlying_disease} onChange={e => set('underlying_disease', e.target.value)} placeholder="เช่น DM, HT, CKD" /></div>

              <SectionTitle>การรักษา</SectionTitle>
              <FormInput label="วันที่เริ่มรักษา" type="date" value={form.treatment_start_date} onChange={e => set('treatment_start_date', e.target.value)} />
              <FormInput label="วันที่สิ้นสุดรักษา" type="date" value={form.treatment_end_date} onChange={e => set('treatment_end_date', e.target.value)} />
              <FormSelect label="สูตรยา" options={REGIMENS} value={form.regimen} onChange={e => set('regimen', e.target.value)} />

              <SectionTitle>ขนาดยา (Dose)</SectionTitle>
              <FormInput label="Isoniazid (H)" value={form.dose_isoniazid} onChange={e => set('dose_isoniazid', e.target.value)} placeholder="เช่น 300 mg. 1x1" />
              <FormInput label="Rifampicin (R)" value={form.dose_rifampicin} onChange={e => set('dose_rifampicin', e.target.value)} placeholder="เช่น 450 mg. 1x1" />
              <FormInput label="Pyrazinamide (Z)" value={form.dose_pyrazinamide} onChange={e => set('dose_pyrazinamide', e.target.value)} placeholder="เช่น 1000 mg. 1x1" />
              <FormInput label="Ethambutol (E)" value={form.dose_ethambutol} onChange={e => set('dose_ethambutol', e.target.value)} placeholder="เช่น 800 mg. 1x1" />
              <FormInput label="Levofloxacin (L)" value={form.dose_levofloxacin} onChange={e => set('dose_levofloxacin', e.target.value)} placeholder="เช่น 500 mg. 1x1 หรือ -" />

              <SectionTitle>วันนัดรับยา</SectionTitle>
              <div className="col-span-full">
                <FormInput label="ครบ 2 สัปดาห์ (นัดรับยาเดือนที่ 1)" value={form.appt_2weeks} onChange={e => set('appt_2weeks', e.target.value)} placeholder="เช่น 19/10/2568+LFT" />
              </div>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <FormInput key={m} label={`นัดรับยาเดือนที่ ${m}`} type="date"
                  value={form[`appt_m${m}`]}
                  onChange={e => set(`appt_m${m}`, e.target.value)} />
              ))}
              <div className="col-span-full"><FormInput label="นัดตรวจ (CXR+AFB)" value={form.appt_lab} onChange={e => set('appt_lab', e.target.value)} /></div>
              <div className="col-span-full"><FormTextArea label="หมายเหตุ" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
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
