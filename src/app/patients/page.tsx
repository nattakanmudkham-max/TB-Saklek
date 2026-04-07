'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Patient {
  id: string
  fiscal_year: number
  tb_no: string
  hn: string
  full_name: string
  age: number
  icd10: string
  treatment_start_date: string
  patient_type: string
  treatment_outcome: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [year])

  async function fetchPatients() {
    setLoading(true)
    let query = supabase.from('tb_patients').select('*').order('registered_date', { ascending: false })
    if (year) query = query.eq('fiscal_year', parseInt(year))
    const { data } = await query
    setPatients(data || [])
    setLoading(false)
  }

  const filtered = patients.filter(p =>
    p.full_name?.includes(search) || p.hn?.includes(search) || p.tb_no?.includes(search)
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🫁 ทะเบียนผู้ป่วยวัณโรค</h1>
          <p className="text-gray-500 text-sm">โรงพยาบาลสากเหล็ก</p>
        </div>
        <Link href="/patients/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + เพิ่มผู้ป่วย
        </Link>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          placeholder="ค้นหาชื่อ / HN / TB No."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-xs"
        />
        <select
          value={year}
          onChange={e => setYear(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">ทุกปีงบ</option>
          {[2568, 2567, 2566, 2565, 2564, 2563].map(y => (
            <option key={y} value={y}>ปีงบ {y}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['TB No.', 'HN', 'ชื่อ-สกุล', 'อายุ', 'ICD-10', 'วันเริ่มรักษา', 'ประเภท', 'ผลการรักษา', ''].map(h => (
                <th key={h} className="text-left px-3 py-3 text-xs font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-8 text-gray-400">กำลังโหลด...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8 text-gray-400">ไม่พบข้อมูล</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-3 font-mono text-xs">{p.tb_no}</td>
                <td className="px-3 py-3">{p.hn}</td>
                <td className="px-3 py-3 font-medium">{p.full_name}</td>
                <td className="px-3 py-3">{p.age}</td>
                <td className="px-3 py-3">{p.icd10}</td>
                <td className="px-3 py-3">{p.treatment_start_date}</td>
                <td className="px-3 py-3">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{p.patient_type}</span>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    p.treatment_outcome?.includes('หาย') ? 'bg-green-100 text-green-700' :
                    p.treatment_outcome?.includes('เสียชีวิต') ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{p.treatment_outcome || '-'}</span>
                </td>
                <td className="px-3 py-3">
                  <Link href={`/patients/${p.id}`} className="text-blue-600 hover:underline text-xs">แก้ไข</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 text-xs text-gray-400 border-t">ทั้งหมด {filtered.length} ราย</div>
      </div>
    </div>
  )
}
