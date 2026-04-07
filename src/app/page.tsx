import Link from "next/link";

const modules = [
  {
    href: "/patients",
    icon: "🫁",
    title: "ทะเบียนผู้ป่วย TB",
    desc: "บันทึก ค้นหา และติดตามผู้ป่วยวัณโรค แยกตามปีงบประมาณ",
    color: "bg-red-50 border-red-200 hover:border-red-400",
    badge: "tb_patients",
  },
  {
    href: "/staff-screening",
    icon: "👤",
    title: "คัดกรองเจ้าหน้าที่",
    desc: "ทะเบียนคัดกรองวัณโรคเจ้าหน้าที่โรงพยาบาลสากเหล็ก",
    color: "bg-blue-50 border-blue-200 hover:border-blue-400",
    badge: "staff_screening",
  },
  {
    href: "/contacts",
    icon: "👥",
    title: "ผู้สัมผัสร่วมบ้าน",
    desc: "ทะเบียนผู้สัมผัส/ใกล้ชิดผู้ป่วย ผล CXR / GeneXpert / IGRA",
    color: "bg-yellow-50 border-yellow-200 hover:border-yellow-400",
    badge: "contacts",
  },
  {
    href: "/ltbi",
    icon: "🧪",
    title: "วัณโรคระยะแฝง (LTBI)",
    desc: "ทะเบียนรักษาผู้ที่ IGRA ผิดปกติ บันทึกวันเริ่มรักษา",
    color: "bg-purple-50 border-purple-200 hover:border-purple-400",
    badge: "ltbi_treatment",
  },
  {
    href: "/appointments",
    icon: "📅",
    title: "ตารางนัดรับยา",
    desc: "บันทึกวันนัดรับยา สูตรยา และปริมาณยาแต่ละเดือน",
    color: "bg-green-50 border-green-200 hover:border-green-400",
    badge: "appointments",
  },
];

export default function HomePage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">ระบบทะเบียนวัณโรค</h1>
        <p className="text-gray-500 mt-1">โรงพยาบาลสากเหล็ก อำเภอสากเหล็ก จังหวัดพิจิตร</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`block border-2 rounded-xl p-6 transition-all ${m.color}`}
          >
            <div className="text-3xl mb-3">{m.icon}</div>
            <h2 className="font-bold text-gray-800 text-lg mb-1">{m.title}</h2>
            <p className="text-sm text-gray-600">{m.desc}</p>
            <div className="mt-3 text-xs text-gray-400 font-mono">{m.badge}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
