'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Staff {
  id: string; fiscal_year: number; seq: number; hn: string
  full_name: string; department: string; cxr_date: string; cxr_result: string
}

export default function StaffScreeningPage() {
  const [data, setData] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('2568')

  useEffect(() => { fetch() }, [year])

  async function fetch() {
    setLoading(true)
    let q = supabase.from('staff_screening').select('*').order('seq')
    if (year) q = q.eq('fiscal_year', parseInt(year))
    const { data } = await q
    setData(data || [])
    setLoading(false)
  }

  const filtered = data.filter(d => d.full_name?.includes(search) || d.hn?.includes(search) || d.department?.includes(search))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">👤 คัดกรองวัณโรคเจ้าหน้าที่</h1>
          <p className="text-gray-500 text-sm">โรงพยาบาลสากเหล็ก</p>
        </div>
        <Link href="/staff-screening/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + เพิ่มรายการ
        </Link>
      </div>
      <div className="flex gap-3 mb-4">
        <input placeholder="ค้นหาชื่อ / HN / แผนก" value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-xs" />
        <select value={year} onChange={e => setYear(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          {[2568, 2567, 2566].map(y => <option key={y} value={y}>ปีงบ {y}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{['ลำดับ', 'HN', 'ชื่อ-สกุล', 'กลุ่มงาน/แผนก', 'วันที่ CXR', 'ผล CXR', ''].map(h =>
              <th key={h} className="text-left px-3 py-3 text-xs font-medium text-gray-600">{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">กำลังโหลด...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-gray-400">ไม่พบข้อมูล</td></tr>
              : filtered.map(d => (
                <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3">{d.seq}</td>
                  <td className="px-3 py-3">{String(Math.round(parseFloat(d.hn))).padStart(9, '0')}</td>
                  <td className="px-3 py-3 font-medium">{d.full_name}</td>
                  <td className="px-3 py-3 text-gray-600">{d.department}</td>
                  <td className="px-3 py-3">{d.cxr_date}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${d.cxr_result === 'ปกติ' ? 'bg-green-100 text-green-700' : d.cxr_result === 'ผิดปกติ' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {d.cxr_result || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <Link href={`/staff-screening/${d.id}`} className="text-blue-600 hover:underline text-xs">แก้ไข</Link>
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
