'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Appt {
  id: string; fiscal_year: number; tb_no: string; hn: string; full_name: string
  treatment_start_date: string; treatment_end_date: string; regimen: string
  appt_m1: string; appt_m6: string; underlying_disease: string
}

export default function AppointmentsPage() {
  const [data, setData] = useState<Appt[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('2568')

  useEffect(() => { fetchData() }, [year])

  async function fetchData() {
    setLoading(true)
    let q = supabase.from('appointments').select('*').order('treatment_start_date', { ascending: false })
    if (year) q = q.eq('fiscal_year', parseInt(year))
    const { data } = await q
    setData(data || [])
    setLoading(false)
  }

  const filtered = data.filter(d =>
    d.full_name?.includes(search) || d.hn?.includes(search) || d.tb_no?.includes(search)
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📅 ตารางนัดรับยาวัณโรค</h1>
          <p className="text-gray-500 text-sm">สูตรยา วันนัด และการติดตาม</p>
        </div>
        <Link href="/appointments/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + เพิ่มรายการ
        </Link>
      </div>
      <div className="flex gap-3 mb-4">
        <input placeholder="ค้นหาชื่อ / HN / TB No."
          value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-sm" />
        <select value={year} onChange={e => setYear(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          {[2569, 2568, 2567, 2566].map(y => <option key={y} value={y}>ปีงบ {y}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{['TB No.', 'HN', 'ชื่อ-สกุล', 'โรคประจำตัว', 'วันเริ่ม-สิ้นสุด', 'สูตรยา', 'นัด ด.1', 'นัด ด.6', ''].map(h =>
              <th key={h} className="text-left px-3 py-2 text-xs font-medium text-gray-600">{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={9} className="text-center py-8 text-gray-400">กำลังโหลด...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={9} className="text-center py-8 text-gray-400">ไม่พบข้อมูล</td></tr>
              : filtered.map(d => (
                <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-xs text-gray-500">{d.tb_no}</td>
                  <td className="px-3 py-2">{d.hn}</td>
                  <td className="px-3 py-2 font-medium">{d.full_name}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{d.underlying_disease || '-'}</td>
                  <td className="px-3 py-2 text-xs">{d.treatment_start_date} → {d.treatment_end_date}</td>
                  <td className="px-3 py-2"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-mono">{d.regimen}</span></td>
                  <td className="px-3 py-2 text-xs">{d.appt_m1 || '-'}</td>
                  <td className="px-3 py-2 text-xs">{d.appt_m6 || '-'}</td>
                  <td className="px-3 py-2">
                    <Link href={`/appointments/${d.id}`} className="text-blue-600 hover:underline text-xs">แก้ไข</Link>
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
