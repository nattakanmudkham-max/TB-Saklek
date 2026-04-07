'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Contact {
  id: string; fiscal_year: number; index_name: string; index_tb_no: string
  contact_name: string; contact_age: number; cxr_result: string; igra: string; registered_date: string
}

export default function ContactsPage() {
  const [data, setData] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [year, setYear] = useState('2568')

  useEffect(() => { fetchData() }, [year])

  async function fetchData() {
    setLoading(true)
    let q = supabase.from('contacts').select('*').order('registered_date', { ascending: false })
    if (year) q = q.eq('fiscal_year', parseInt(year))
    const { data } = await q
    setData(data || [])
    setLoading(false)
  }

  const filtered = data.filter(d =>
    d.index_name?.includes(search) || d.contact_name?.includes(search) || d.index_tb_no?.includes(search)
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">👥 ทะเบียนผู้สัมผัสร่วมบ้าน</h1>
          <p className="text-gray-500 text-sm">ผู้สัมผัส/ใกล้ชิดผู้ป่วยวัณโรค</p>
        </div>
        <Link href="/contacts/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + เพิ่มรายการ
        </Link>
      </div>
      <div className="flex gap-3 mb-4">
        <input placeholder="ค้นหาชื่อ Index case / ผู้สัมผัส / TB No."
          value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-sm" />
        <select value={year} onChange={e => setYear(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          {[2569, 2568, 2567, 2566].map(y => <option key={y} value={y}>ปีงบ {y}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>{['TB No. (Index)', 'Index Case', 'ผู้สัมผัส', 'อายุ', 'วันที่ CXR', 'ผล CXR', 'IGRA', ''].map(h =>
              <th key={h} className="text-left px-3 py-3 text-xs font-medium text-gray-600">{h}</th>
            )}</tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">กำลังโหลด...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-gray-400">ไม่พบข้อมูล</td></tr>
              : filtered.map(d => (
                <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 font-mono text-xs text-gray-500">{d.index_tb_no}</td>
                  <td className="px-3 py-3 text-gray-600">{d.index_name}</td>
                  <td className="px-3 py-3 font-medium">{d.contact_name}</td>
                  <td className="px-3 py-3">{d.contact_age}</td>
                  <td className="px-3 py-3">{d.cxr_result ? d.cxr_result.split('T')[0] : '-'}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${d.cxr_result === 'ปกติ' ? 'bg-green-100 text-green-700' : d.cxr_result === 'ผิดปกติ' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {d.cxr_result || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${d.igra === 'ผิดปกติ' ? 'bg-orange-100 text-orange-700' : d.igra === 'ปกติ' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {d.igra || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <Link href={`/contacts/${d.id}`} className="text-blue-600 hover:underline text-xs">แก้ไข</Link>
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
