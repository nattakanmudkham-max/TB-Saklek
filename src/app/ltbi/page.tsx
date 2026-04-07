'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface LTBI {
  id: string; fiscal_year: number; index_name: string; index_tb_no: string
  contact_name: string; igra: string; treatment_note: string; registered_date: string
}

export default function LTBIPage() {
  const [data, setData] = useState<LTBI[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('2568')

  useEffect(() => { fetchData() }, [year])

  async function fetchData() {
    setLoading(true)
    let q = supabase.from('ltbi_treatment').select('*').order('registered_date', { ascending: false })
    if (year) q = q.eq('fiscal_year', parseInt(year))
    const { data } = await q
    setData(data || [])
    setLoading(false)
  }

  const filtered = data.filter(d =>
    d.contact_name?.includes(search) || d.index_name?.includes(search)
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🧪 วัณโรคระยะแฝง (LTBI)</h1>
          <p className="text-gray-500 text-sm">ผู้สัมผัสที่ IGRA ผิดปกติ และได้รับการรักษา</p>
        </div>
        <Link href="/ltbi/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + เพิ่มรายการ
        </Link>
      </div>
      <div className="flex gap-3 mb-4">
        <input placeholder="ค้นหาชื่อผู้ป่วย / Index case"
          value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-sm" />
        <select value={year} onChange={e => setYear(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          {[2569, 2568, 2567].map(y => <option key={y} value={y}>ปีงบ {y}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{['Index Case', 'TB No.', 'ชื่อผู้รับการรักษา', 'IGRA', 'หมายเหตุการรักษา', ''].map(h =>
              <th key={h} className="text-left px-3 py-3 text-xs font-medium text-gray-600">{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">กำลังโหลด...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-400">ไม่พบข้อมูล</td></tr>
              : filtered.map(d => (
                <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-gray-600">{d.index_name}</td>
                  <td className="px-3 py-3 font-mono text-xs text-gray-400">{d.index_tb_no}</td>
                  <td className="px-3 py-3 font-medium">{d.contact_name}</td>
                  <td className="px-3 py-3">
                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">{d.igra || 'ผิดปกติ'}</span>
                  </td>
                  <td className="px-3 py-3 text-gray-600 text-xs">{d.treatment_note}</td>
                  <td className="px-3 py-3">
                    <Link href={`/ltbi/${d.id}`} className="text-blue-600 hover:underline text-xs">แก้ไข</Link>
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
