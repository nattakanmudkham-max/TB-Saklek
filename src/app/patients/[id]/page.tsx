'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormInput, FormSelect, FormTextArea, SectionTitle } from '@/components/FormComponents'

const FISCAL_YEARS = [2568, 2567, 2566, 2565, 2564, 2563, 2562, 2561].map(y => ({ value: String(y), label: `ปีงบ ${y}` }))
const PATIENT_TYPES = ['NEW', 'Relapse', 'Transfer In', 'Treatment after failure', 'Treatment after loss to follow up'].map(v => ({ value: v, label: v }))
const RESULTS = ['รักษาหาย', 'รักษาครบ(Completed)', 'เสียชีวิต(Died)', 'โอนออก(Transfered out)', 'ขาดยา', 'ล้มเหลว'].map(v => ({ value: v, label: v }))
const AFB_RESULTS = ['MTB detected', 'MTB Detected Low', 'MTB not detected', 'Neg', '1+', '2+', '3+', 'Error'].map(v => ({ value: v, label: v }))
const CXR_RESULTS = ['ปกติ', 'ผิดปกติ', 'สงสัย TB', 'ไม่ได้ CXR'].map(v => ({ value: v, label: v }))

const EMPTY = {
  fiscal_year: '2568', tb_no: '', hn: '', registered_date: '', full_name: '',
  age: '', address: '', icd10: '', xpert_result: '', is_ip: 'false', is_ep: 'false',
  detected_place: '', treatment_place: '', treatment_start_date: '', patient_type: '',
  risk_group: '', result_m2: '', result_m3: '', result_m5: '', result_m6: '',
  result_m7: '', result_m9: '', result_m10: '', result_m12: '',
  treatment_outcome: '', caregiver_name: '', phone: '', notes: '',
}

export default function EditPatientPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [form, setForm] = useState<Record<string, string>>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('tb_patients').select('*').eq('id', params.id).single()
      if (data) {
        setForm({
          fiscal_year: String(data.fiscal_year ?? '2568'),
          tb_no: String(data.tb_no ?? ''),
          hn: String(data.hn ?? ''),
          registered_date: data.registered_date ?? '',
          full_name: data.full_name ?? '',
          age: String(data.age ?? ''),
          address: data.address ?? '',
          icd10: data.icd10 ?? '',
          xpert_result: data.xpert_result ?? '',
          is_ip: String(data.is_ip ?? 'false'),
          is_ep: String(data.is_ep ?? 'false'),
          detected_place: data.detected_place ?? '',
          treatment_place: data.treatment_place ?? '',
          treatment_start_date: data.treatment_start_date ?? '',
          patient_type: data.patient_type ?? '',
          risk_group: data.risk_group ?? '',
          result_m2: data.result_m2 ?? '',
          result_m3: data.result_m3 ?? '',
          result_m5: data.result_m5 ?? '',
          result_m6: data.result_m6 ?? '',
          result_m7: data.result_m7 ?? '',
          result_m9: data.result_m9 ?? '',
          result_m10: data.result_m10 ?? '',
          result_m12: data.result_m12 ?? '',
          treatment_outcome: data.treatment_outcome ?? '',
          caregiver_name: data.caregiver_name ?? '',
          phone: data.phone ?? '',
          notes: data.notes ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMsg('')
    const payload = {
      ...form,
      fiscal_year: parseInt(form.fiscal_year),
      age: form.age ? parseInt(form.age) : null,
      is_ip: form.is_ip === 'true',
      is_ep: form.is_ep === 'true',
    }
    const { error } = await supabase.from('tb_patients').update(payload).eq('id', params.id)
    setSaving(false)
    if (error) setMsg('❌ เกิดข้อผิดพลาด: ' + error.message)
    else { setMsg('✅ บันทึกสำเร็จ'); setTimeout(() => router.push('/patients'), 1200) }
  }

  async function handleDelete() {
    if (!confirm('ยืนยันการลบข้อมูลผู้ป่วยรายนี้?')) return
    setDeleting(true)
    await supabase.from('tb_patients').delete().eq('id', params.id)
    router.push('/patients')
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
            <button onClick={() => router.back()} style={{
              background: '#f1f5f9', border: 'none', borderRadius: 8,
              padding: '7px 12px', fontSize: 13, color: '#475569', cursor: 'pointer',
            }}>← กลับ</button>
            <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: '#fee2e2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🫁</div>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>แก้ไขข้อมูลผู้ป่วย</h1>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{form.full_name}</p>
              </div>
            </div>
          </div>
          <button onClick={handleDelete} disabled={deleting} style={{
            background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            🗑 ลบข้อมูล
          </button>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 860 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="grid grid-cols-2 gap-5">
              <SectionTitle>ข้อมูลทะเบียน</SectionTitle>
              <FormSelect label="ปีงบประมาณ" options={FISCAL_YEARS} value={form.fiscal_year} onChange={e => set('fiscal_year', e.target.value)} required />
              <FormInput label="TB No." value={form.tb_no} onChange={e => set('tb_no', e.target.value)} />
              <FormInput label="HN" value={form.hn} onChange={e => set('hn', e.target.value)} />
              <FormInput label="วันที่ขึ้นทะเบียน" type="date" value={form.registered_date} onChange={e => set('registered_date', e.target.value)} />

              <SectionTitle>ข้อมูลผู้ป่วย</SectionTitle>
              <div className="col-span-full">
                <FormInput label="ชื่อ-สกุล" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
              </div>
              <FormInput label="อายุ (ปี)" type="number" value={form.age} onChange={e => set('age', e.target.value)} min="0" max="150" />
              <div className="col-span-full">
                <FormInput label="ที่อยู่" value={form.address} onChange={e => set('address', e.target.value)} />
              </div>

              <SectionTitle>การวินิจฉัยและตรวจ</SectionTitle>
              <FormInput label="การวินิจฉัย (ICD-10)" value={form.icd10} onChange={e => set('icd10', e.target.value)} />
              <FormSelect label="ผล X-pert MTB/RIF" options={AFB_RESULTS} value={form.xpert_result} onChange={e => set('xpert_result', e.target.value)} />
              <FormSelect label="IP (ในปอด)" options={[{value:'true',label:'ใช่'},{value:'false',label:'ไม่ใช่'}]} value={form.is_ip} onChange={e => set('is_ip', e.target.value)} />
              <FormSelect label="EP (นอกปอด)" options={[{value:'true',label:'ใช่'},{value:'false',label:'ไม่ใช่'}]} value={form.is_ep} onChange={e => set('is_ep', e.target.value)} />

              <SectionTitle>การรักษา</SectionTitle>
              <FormInput label="สถานที่ตรวจพบ" value={form.detected_place} onChange={e => set('detected_place', e.target.value)} />
              <FormInput label="สถานที่รักษา" value={form.treatment_place} onChange={e => set('treatment_place', e.target.value)} />
              <FormInput label="วันที่เริ่มรักษา" type="date" value={form.treatment_start_date} onChange={e => set('treatment_start_date', e.target.value)} />
              <FormSelect label="ประเภทผู้ป่วย" options={PATIENT_TYPES} value={form.patient_type} onChange={e => set('patient_type', e.target.value)} />
              <div className="col-span-full">
                <FormInput label="กลุ่มเสี่ยง" value={form.risk_group} onChange={e => set('risk_group', e.target.value)} />
              </div>

              <SectionTitle>ผลระหว่างการรักษา</SectionTitle>
              <FormSelect label="ผลเดือนที่ 2 (M2)" options={CXR_RESULTS} value={form.result_m2} onChange={e => set('result_m2', e.target.value)} />
              <FormSelect label="ผลเดือนที่ 3 (M3)" options={CXR_RESULTS} value={form.result_m3} onChange={e => set('result_m3', e.target.value)} />
              <FormSelect label="ผลเดือนที่ 5 (M5)" options={CXR_RESULTS} value={form.result_m5} onChange={e => set('result_m5', e.target.value)} />
              <FormSelect label="ผลเดือนที่ 6 (M6)" options={CXR_RESULTS} value={form.result_m6} onChange={e => set('result_m6', e.target.value)} />
              <FormSelect label="ผลเดือนที่ 7 (M7)" options={CXR_RESULTS} value={form.result_m7} onChange={e => set('result_m7', e.target.value)} />
              <FormSelect label="ผลเดือนที่ 9 (M9)" options={CXR_RESULTS} value={form.result_m9} onChange={e => set('result_m9', e.target.value)} />
              <FormSelect label="ผลเดือนที่ 10 (M10)" options={CXR_RESULTS} value={form.result_m10} onChange={e => set('result_m10', e.target.value)} />
              <FormSelect label="ผลเดือนที่ 12 (M12)" options={CXR_RESULTS} value={form.result_m12} onChange={e => set('result_m12', e.target.value)} />
              <FormSelect label="ผลการรักษา" options={RESULTS} value={form.treatment_outcome} onChange={e => set('treatment_outcome', e.target.value)} />

              <SectionTitle>ผู้ดูแลและติดต่อ</SectionTitle>
              <FormInput label="ญาติผู้ดูแล" value={form.caregiver_name} onChange={e => set('caregiver_name', e.target.value)} />
              <FormInput label="เบอร์โทรศัพท์" value={form.phone} onChange={e => set('phone', e.target.value)} />
              <div className="col-span-full">
                <FormTextArea label="หมายเหตุ" value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
            </div>

            {msg && (
              <div style={{
                marginTop: 20, padding: '12px 16px', borderRadius: 10,
                background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2',
                color: msg.includes('✅') ? '#15803d' : '#b91c1c',
                fontSize: 14, fontWeight: 500, border: `1px solid ${msg.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
              }}>{msg}</div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 28, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
              <button type="submit" disabled={saving} style={{
                background: saving ? '#93c5fd' : '#2563eb',
                color: '#fff', padding: '10px 24px', borderRadius: 10,
                fontSize: 14, fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
              }}>
                {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
              </button>
              <button type="button" onClick={() => router.back()} style={{
                background: '#fff', color: '#475569', padding: '10px 20px', borderRadius: 10,
                fontSize: 14, border: '1px solid #e2e8f0', cursor: 'pointer',
              }}>ยกเลิก</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
