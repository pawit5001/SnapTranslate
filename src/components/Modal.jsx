import React from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  variant, // 'login-required', 'alert', 'confirm', ฯลฯ
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  // กำหนดปุ่มตาม variant
  let actions = null;
  if (variant === "login-required") {
    actions = (
      <>
        <button
          onClick={onCancel || onClose}
          className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition cursor-pointer"
        >
          ยกเลิก
        </button>
        <button
          onClick={onConfirm}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          ไปหน้าเข้าสู่ระบบ
        </button>
      </>
    );
  } else if (variant === "alert") {
    actions = (
      <button
        onClick={onClose}
        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
      >
        ปิด
      </button>
    );
  } else if (variant === "confirm") {
    actions = (
      <>
        <button
          onClick={onCancel || onClose}
          className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition cursor-pointer"
        >
          ยกเลิก
        </button>
        <button
          onClick={onConfirm}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          ตกลง
        </button>
      </>
    );
  } else {
    // default ปุ่มปิดอย่างเดียว
    actions = (
      <button
        onClick={onClose}
        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
      >
        ปิด
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition text-xl cursor-pointer"
          aria-label="ปิด"
        >
          ✕
        </button>

        {title && (
          <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
        )}

        <div className="text-gray-700">{children}</div>

        <div className="mt-6 flex justify-end gap-4">{actions}</div>
      </div>
    </div>
  );
}
