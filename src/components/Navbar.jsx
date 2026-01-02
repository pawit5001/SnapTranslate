import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function Navbar({ activePage, onSetActivePage, onBackToLanding }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleNavClick = (page) => {
    onSetActivePage(page);
    setOpen(false);
    if (page === "หน้าแรก") {
      onBackToLanding && onBackToLanding();
    }
  };

  // เมนูทั่วไป
  const menuItems = [
    { label: "หน้าแรก", href: "#" },
    { label: "แปลภาษาจากรูปภาพ", href: "#" },
    { label: "สร้างรูปภาพจากข้อความ", href: "#" },
  ];

  // เพิ่มเมนู admin ถ้า user เป็น admin
  if (user?.role === "admin") {
    menuItems.push(
      { label: "จัดการผู้ใช้", href: "#" },
      { label: "แดชบอร์ด Admin", href: "#" }
    );
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 w-full border-b border-gray-200">
      <div className="w-full max-w-screen-xl mx-auto px-5 py-3 flex items-center justify-between">
        <h1
          className="text-2xl font-extrabold text-blue-600 cursor-pointer select-none"
          onClick={() => handleNavClick("หน้าแรก")}
          title="กลับหน้าหลัก"
        >
          📸 SnapTools
        </h1>

        <nav className="hidden sm:flex items-center gap-8 text-base font-medium text-gray-700 select-none">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.label);
              }}
              className={`transition px-3 py-2 rounded-md cursor-pointer ${
                activePage === item.label
                  ? "bg-blue-100 text-blue-700 font-semibold shadow-sm"
                  : "hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-base">
            {user ? (
              <>
                <span className="text-gray-700 font-medium select-none">
                  สวัสดี, <b>{user.username || user.email}</b>
                </span>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition font-semibold select-none cursor-pointer"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick("login")}
                  className="text-blue-600 hover:underline transition font-medium select-none cursor-pointer"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => handleNavClick("register")}
                  className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition font-semibold select-none cursor-pointer"
                >
                  สมัครสมาชิก
                </button>
              </>
            )}
          </div>

          <button
            className="sm:hidden p-2 rounded-md hover:bg-gray-100 border border-gray-300"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="เปิดเมนู"
          >
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="sm:hidden bg-white shadow-md border-t border-gray-200">
          <nav className="flex flex-col px-5 py-4 gap-3 text-gray-700 select-none">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.label);
                }}
                className={`block rounded-md px-3 py-2 cursor-pointer transition ${
                  activePage === item.label
                    ? "bg-blue-100 text-blue-700 font-semibold shadow-inner"
                    : "hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {item.label}
              </a>
            ))}

            <hr className="my-3 border-gray-300" />

            {user ? (
              <>
                <span className="block px-3 py-2 text-gray-700 font-medium">
                  สวัสดี, <b>{user.username || user.email}</b>
                </span>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="text-white bg-red-600 px-5 py-2 rounded-md hover:bg-red-700"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    handleNavClick("login");
                    setOpen(false);
                  }}
                  className="text-blue-600 text-left px-3 py-2 hover:underline"
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => {
                    handleNavClick("register");
                    setOpen(false);
                  }}
                  className="text-white bg-blue-600 px-5 py-2 rounded-md text-left hover:bg-blue-700"
                >
                  สมัครสมาชิก
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
