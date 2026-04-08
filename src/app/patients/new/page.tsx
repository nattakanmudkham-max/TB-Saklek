'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { FormInput, FormSelect, FormTextArea, FormDateThai, SectionTitle } from '@/components/FormComponents'

const FISCAL_YEARS = [2569, 2568, 2567, 2566, 2565, 2564, 2563, 2562, 2561].map(y => ({ value: String(y), label: `ปีงบ ${y}` }))
const PATIENT_TYPES = ['NEW', 'Relapse', 'Transfer In', 'Treatment after failure', 'Treatment after loss to follow up'].map(v => ({ value: v, label: v }))
const RESULTS = ['รักษาหาย', 'รักษาครบ(Completed)', 'เสียชีวิต(Died)', 'โอนออก(Transfered out)', 'ขาดยา', 'ล้มเหลว'].map(v => ({ value: v, label: v }))
const AFB_RESULTS = ['MTB detected', 'MTB Detected Low', 'MTB not detected', 'Neg', '1+', '2+', '3+', 'Error'].map(v => ({ value: v, label: v }))
const CXR_RESULTS = ['ปกติ', 'ผิดปกติ', 'สงสัย TB', 'ไม่ได้ CXR'].map(v => ({ value: v, label: v }))
const TITLES = ['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง'].map(v => ({ value: v, label: v }))
const MEDICAL_RIGHTS = ['สวัสดิการข้าราชการ', 'ประกันสังคม', 'บัตรทอง/30 บาท', 'ชำระเอง', 'อื่นๆ'].map(v => ({ value: v, label: v }))
const NATIONALITIES = ['ไทย', 'พม่า', 'ลาว', 'กัมพูชา', 'เวียดนาม', 'จีน', 'อื่นๆ'].map(v => ({ value: v, label: v }))
const POPULATIONS = ['ไทย', 'ต่างด้าว', 'แรงงานต่างชาติ'].map(v => ({ value: v, label: v }))
const SCREENING_TYPES = ['Active', 'Passive'].map(v => ({ value: v, label: v }))

export default function NewPatientPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    fiscal_year: '2568',
    tb_no: '', hn: '', registered_date: '', screening_type: '',
    title: '', first_name: '', last_name: '', id_card: '',
    birth_date: '', age: '',
    population_type: '', nationality: '', medical_right: '',
    address: '', village_no: '', province: '', district: '', subdistrict: '',
    icd10: '', xpert_result: '',
    is_ip: 'false', is_ep: 'false',
    detected_place: '', treatment_place: '',
    treatment_start_date: '', patient_type: '', risk_group: '',
    result_m2: '', result_m3: '', result_m5: '', result_m6: '',
    result_m7: '', result_m9: '', result_m10: '', result_m12: '',
    treatment_outcome: '', caregiver_name: '', phone: '', notes: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setMsg('')

    const full_name = [form.title, form.first_name, form.last_name].filter(Boolean).join(' ') || undefined

    // Only include non-empty values to avoid schema errors on optional columns
    const raw: Record<string, unknown> = { full_name }
    const skip = new Set(['title', 'first_name', 'last_name'])
    for (const [k, v] of Object.entries(form)) {
      if (skip.has(k)) continue
      if (v === '') continue
      raw[k] = v
    }
    const payload = {
      ...raw,
      fiscal_year: parseInt(form.fiscal_year),
      age: form.age ? parseInt(form.age) : undefined,
      is_ip: form.is_ip === 'true',
      is_ep: form.is_ep === 'true',
    }

    const { error } = await supabase.from('tb_patients').insert(payload)
    setSaving(false)
    if (error) setMsg('❌ เกิดข้อผิดพลาด: ' + error.message)
    else { setMsg('✅ บันทึกสำเร็จ'); setTimeout(() => router.push('/patients'), 1200) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '18px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#475569', cursor: 'pointer' }}>← กลับ</button>
          <div style={{ width: 1, height: 20, background: '#e2e8f0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#fee2e2', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🫁</div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>เพิ่มผู้ป่วยวัณโรค</h1>
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 980 }}>
        <form onSubmit={handleSubmit}>

          {/* ส่วนที่ 1: ข้อมูลส่วนบุคคล */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ background: '#fef2f2', borderBottom: '2px solid #fecaca', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#b91c1c' }}>ส่วนที่ 1 ข้อมูลส่วนบุคคล</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>ประเภทคัดกรอง</span>
                {SCREENING_TYPES.map(t => (
                  <label key={t.value} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, cursor: 'pointer', color: '#334155' }}>
                    <input type="radio" name="screening_type" value={t.value}
                      checked={form.screening_type === t.value}
                      onChange={e => set('screening_type', e.target.value)}
                      style={{ accentColor: '#2563eb' }} />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="grid grid-cols-4 gap-4">
                <FormSelect label="ปีงบประมาณ" options={FISCAL_YEARS} value={form.fiscal_year} onChange={e => set('fiscal_year', e.target.value)} required />
                <FormInput label="รหัส TB No." value={form.tb_no} onChange={e => set('tb_no', e.target.value)} placeholder="เช่น 682797800001" />
                <FormInput label="HN" value={form.hn} onChange={e => set('hn', e.target.value)} />
                <FormDateThai label="วันที่ขึ้นทะเบียน (พ.ศ.)" value={form.registered_date} onChange={v => set('registered_date', v)} />
              </div>

              <div style={{ marginTop: 16 }} className="grid grid-cols-5 gap-4">
                <FormSelect label="คำนำหน้า" options={TITLES} value={form.title} onChange={e => set('title', e.target.value)} />
                <div className="col-span-2">
                  <FormInput label="ชื่อ" value={form.first_name} onChange={e => set('first_name', e.target.value)} required placeholder="ชื่อจริง" />
                </div>
                <div className="col-span-2">
                  <FormInput label="นามสกุล" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="นามสกุล" />
                </div>
              </div>

              <div style={{ marginTop: 16 }} className="grid grid-cols-4 gap-4">
                <FormInput label="เลขบัตรประชาชน" value={form.id_card} onChange={e => set('id_card', e.target.value)} placeholder="X-XXXX-XXXXX-XX-X" />
                <FormDateThai label="วันเกิด (พ.ศ.)" value={form.birth_date} onChange={v => set('birth_date', v)} />
                <FormInput label="อายุ (ปี)" type="number" value={form.age} onChange={e => set('age', e.target.value)} min="0" max="150" />
                <FormSelect label="สิทธิ์การรักษา" options={MEDICAL_RIGHTS} value={form.medical_right} onChange={e => set('medical_right', e.target.value)} />
              </div>

              <div style={{ marginTop: 16 }} className="grid grid-cols-4 gap-4">
                <FormSelect label="ประชากร" options={POPULATIONS} value={form.population_type} onChange={e => set('population_type', e.target.value)} />
                <FormSelect label="สัญชาติ" options={NATIONALITIES} value={form.nationality} onChange={e => set('nationality', e.target.value)} />
                <div className="col-span-2">
                  <FormInput label="ที่อยู่" value={form.address} onChange={e => set('address', e.target.value)} placeholder="บ้านเลขที่ ซอย ถนน" />
                </div>
              </div>

              <div style={{ marginTop: 16 }} className="grid grid-cols-4 gap-4">
                <FormInput label="หมู่ที่" value={form.village_no} onChange={e => set('village_no', e.target.value)} placeholder="เช่น 1" />
                <FormInput label="ตำบล" value={form.subdistrict} onChange={e => set('subdistrict', e.target.value)} placeholder="เช่น สากเหล็ก" />
                <FormInput label="อำเภอ" value={form.district} onChange={e => set('district', e.target.value)} placeholder="เช่น สากเหล็ก" />
                <FormInput label="จังหวัด" value={form.province} onChange={e => set('province', e.target.value)} placeholder="เช่น พิจิตร" />
              </div>
            </div>
          </div>

          {/* ส่วนที่ 2: การวินิจฉัยและตรวจ */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ background: '#eff6ff', borderBottom: '2px solid #bfdbfe', padding: '12px 20px' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8' }}>ส่วนที่ 2 การวินิจฉัยและตรวจ</span>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="grid grid-cols-4 gap-4">
                <FormInput label="การวินิจฉัย (ICD-10)" value={form.icd10} onChange={e => set('icd10', e.target.value)} placeholder="เช่น A150, A151" />
                <FormSelect label="ผล X-pert MTB/RIF" options={AFB_RESULTS} value={form.xpert_result} onChange={e => set('xpert_result', e.target.value)} />
                <FormSelect label="IP (ในปอด)" options={[{value:'true',label:'ใช่'},{value:'false',label:'ไม่ใช่'}]} value={form.is_ip} onChange={e => set('is_ip', e.target.value)} />
                <FormSelect label="EP (นอกปอด)" options={[{value:'true',label:'ใช่'},{value:'false',label:'ไม่ใช่'}]} value={form.is_ep} onChange={e => set('is_ep', e.target.value)} />
              </div>
            </div>
          </div>

          {/* ส่วนที่ 3: การรักษา */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ background: '#f0fdf4', borderBottom: '2px solid #bbf7d0', padding: '12px 20px' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>ส่วนที่ 3 การรักษา</span>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="grid grid-cols-4 gap-4">
                <FormInput label="สถานที่ตรวจพบ" value={form.detected_place} onChange={e => set('detected_place', e.target.value)} placeholder="เช่น รพ.สากเหล็ก" />
                <FormInput label="สถานที่รักษา" value={form.treatment_place} onChange={e => set('treatment_place', e.target.value)} placeholder="เช่น รพ.พิจิตร" />
                <FormInput label="วันที่เริ่มรักษา" type="date" value={form.treatment_start_date} onChange={e => set('treatment_start_date', e.target.value)} />
                <FormSelect label="ประเภทผู้ป่วย" options={PATIENT_TYPES} value={form.patient_type} onChange={e => set('patient_type', e.target.value)} />
              </div>
              <div style={{ marginTop: 16 }} className="grid grid-cols-2 gap-4">
                <FormInput label="กลุ่มเสี่ยง" value={form.risk_group} onChange={e => set('risk_group', e.target.value)} placeholder="เช่น DM, HT, ผู้สูงอายุ" />
              </div>
            </div>
          </div>

          {/* ส่วนที่ 4: ผลระหว่างการรักษา */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ background: '#fefce8', borderBottom: '2px solid #fde68a', padding: '12px 20px' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#854d0e' }}>ส่วนที่ 4 ผลระหว่างการรักษา</span>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="grid grid-cols-4 gap-4">
                <FormSelect label="ผลเดือนที่ 2 (M2)" options={CXR_RESULTS} value={form.result_m2} onChange={e => set('result_m2', e.target.value)} />
                <FormSelect label="ผลเดือนที่ 3 (M3)" options={CXR_RESULTS} value={form.result_m3} onChange={e => set('result_m3', e.target.value)} />
                <FormSelect label="ผลเดือนที่ 5 (M5)" options={CXR_RESULTS} value={form.result_m5} onChange={e => set('result_m5', e.target.value)} />
                <FormSelect label="ผลเดือนที่ 6 (M6)" options={CXR_RESULTS} value={form.result_m6} onChange={e => set('result_m6', e.target.value)} />
                <FormSelect label="ผลเดือนที่ 7 (M7)" options={CXR_RESULTS} value={form.result_m7} onChange={e => set('result_m7', e.target.value)} />
                <FormSelect label="ผลเดือนที่ 9 (M9)" options={CXR_RESULTS} value={form.result_m9} onChange={e => set('result_m9', e.target.value)} />
                <FormSelect label="ผลเดือนที่ 10 (M10)" options={CXR_RESULTS} value={form.result_m10} onChange={e => set('result_m10', e.target.value)} />
                <FormSelect label="ผลเดือนที่ 12 (M12)" options={CXR_RESULTS} value={form.result_m12} onChange={e => set('result_m12', e.target.value)} />
                <FormSelect label="ผลการรักษา" options={RESULTS} value={form.treatment_outcome} onChange={e => set('treatment_outcome', e.target.value)} />
              </div>
            </div>
          </div>

          {/* ส่วนที่ 5: ผู้ดูแลและติดต่อ */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ background: '#f5f3ff', borderBottom: '2px solid #ddd6fe', padding: '12px 20px' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#6d28d9' }}>ส่วนที่ 5 ผู้ดูแลและติดต่อ</span>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="grid grid-cols-3 gap-4">
                <FormInput label="ญาติผู้ดูแล" value={form.caregiver_name} onChange={e => set('caregiver_name', e.target.value)} />
                <FormInput label="เบอร์โทรศัพท์" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0XX-XXXXXXX" />
              </div>
              <div style={{ marginTop: 16 }}>
                <FormTextArea label="หมายเหตุ" value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
            </div>
          </div>

          {msg && (
            <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: msg.includes('✅') ? '#f0fdf4' : '#fef2f2', color: msg.includes('✅') ? '#15803d' : '#b91c1c', fontSize: 14, fontWeight: 500, border: `1px solid ${msg.includes('✅') ? '#bbf7d0' : '#fecaca'}` }}>{msg}</div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={saving} style={{ background: saving ? '#93c5fd' : '#2563eb', color: '#fff', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
              {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึก'}
            </button>
            <button type="button" onClick={() => router.back()} style={{ background: '#fff', color: '#475569', padding: '10px 20px', borderRadius: 10, fontSize: 14, border: '1px solid #e2e8f0', cursor: 'pointer' }}>ยกเลิก</button>
          </div>
        </form>
      </div>
    </div>
  )
}
