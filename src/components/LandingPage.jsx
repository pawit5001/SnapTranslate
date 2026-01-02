export function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white pt-6 sm:pt-12">
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-12 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-6xl font-extrabold text-blue-800 mb-4 sm:mb-6 text-center tracking-tight drop-shadow-md">
          📸 SnapTools
        </h1>
        <p className="text-base sm:text-xl text-gray-700 mb-8 sm:mb-12 text-center max-w-3xl leading-relaxed">
          แปลภาษาและบรรยายรูปภาพได้ง่าย ๆ ด้วยเทคโนโลยี AI อัจฉริยะ<br />
          รองรับหลายภาษา ใช้งานฟรี ไม่มีโฆษณา รวดเร็วและแม่นยำ
        </p>
        <button
          onClick={onStart}
          className="cursor-pointer shake inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 sm:px-10 py-3 sm:py-4 rounded-2xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 max-w-xs w-full sm:w-auto"
          aria-label="เริ่มใช้งาน SnapTools"
        >
          เริ่มใช้งานเลย
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16 w-full max-w-5xl">
          <Feature
            icon="🌐"
            title="รองรับหลายภาษา"
            desc="เลือกภาษาที่ต้องการแปลได้อย่างหลากหลายและครอบคลุม"
          />
          <Feature
            icon="🤖"
            title="AI อัจฉริยะ"
            desc="ประมวลผลและบรรยายภาพอย่างแม่นยำด้วยเทคโนโลยีล่าสุด"
          />
          <Feature
            icon="🔒"
            title="ปลอดภัย & ฟรี"
            desc="ข้อมูลของคุณไม่ถูกเก็บ ไม่มีโฆษณา พร้อมใช้งานได้ทุกที่ทุกเวลา"
          />
        </div>

        <div className="mt-16 sm:mt-20 text-center text-gray-500 text-xs sm:text-sm">
          © 2025 SnapTools — All rights reserved.
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center bg-white rounded-3xl shadow-xl p-6 sm:p-8 hover:shadow-indigo-300 transition-shadow duration-300 ease-in-out">
      <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{icon}</div>
      <h3 className="font-semibold text-blue-700 text-md sm:text-lg mb-1 sm:mb-2">{title}</h3>
      <p className="text-gray-600 text-center text-sm sm:text-base leading-relaxed">{desc}</p>
    </div>
  );
}
