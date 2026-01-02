import { useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage({ onSetActivePage }) {
  const { login } = useAuth();
  const [userInput, setUserInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const messageTimer = useRef(null);

  const lastClickTime = useRef(0);
  const THROTTLE_DELAY = 3000;

  // ล้างข้อความแจ้งเตือน
  const clearMessage = () => {
    setMessage("");
    if (messageTimer.current) {
      clearTimeout(messageTimer.current);
      messageTimer.current = null;
    }
  };

  // แสดงข้อความแจ้งเตือนและซ่อนไปเองใน 3 วิ
  const showMessage = (msg) => {
    clearMessage();
    setMessage(msg);
    messageTimer.current = setTimeout(() => {
      setMessage("");
      messageTimer.current = null;
    }, 3000);
  };

  const handleLogin = async () => {
    const now = Date.now();
    if (now - lastClickTime.current < THROTTLE_DELAY) {
      const waitSeconds = Math.ceil((THROTTLE_DELAY - (now - lastClickTime.current)) / 1000);
      showMessage(`กรุณารออีก ${waitSeconds} วินาที ก่อนกดใหม่`);
      return;
    }
    lastClickTime.current = now;

    if (loading) return;
    setLoading(true);

    const trimmedUser = userInput.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      showMessage("กรุณากรอกอีเมลหรือชื่อผู้ใช้ และรหัสผ่าน");
      setLoading(false);
      return;
    }

    const blockedUntil = localStorage.getItem("blockedUntil");
    if (blockedUntil && Date.now() < parseInt(blockedUntil)) {
      const date = new Date(parseInt(blockedUntil));
      const unlockTime = `${date.getHours().toString().padStart(2, "0")}.${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      showMessage(`คุณกรอกรหัสผิดเกิน 5 ครั้ง จะปลดล็อกในเวลา ${unlockTime} น.`);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: trimmedUser,
          password: trimmedPass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const attempts = parseInt(localStorage.getItem("loginAttempts") || "0") + 1;
        localStorage.setItem("loginAttempts", attempts.toString());

        if (attempts >= 5) {
          const blockTime = Date.now() + 60 * 60 * 1000;
          localStorage.setItem("blockedUntil", blockTime.toString());
          localStorage.removeItem("loginAttempts");

          const date = new Date(blockTime);
          const unlockTime = `${date.getHours().toString().padStart(2, "0")}.${date
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;
          showMessage(`คุณกรอกรหัสผิดเกิน 5 ครั้ง จะปลดล็อกในเวลา ${unlockTime} น.`);
        } else {
          showMessage(data.detail || "เข้าสู่ระบบไม่สำเร็จ");
        }
        setLoading(false);
        return;
      }

      localStorage.removeItem("loginAttempts");
      localStorage.removeItem("blockedUntil");

      await new Promise((r) => setTimeout(r, 3000));

      login({ access_token: data.access_token, refresh_token: data.refresh_token });

      setMessage("");
      onSetActivePage("แปลภาษาจากรูปภาพ");
    } catch (err) {
      showMessage(err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  // จับ event กด Enter ใน form
  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  // Spinner SVG component
  const Spinner = () => (
    <svg
      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="loading spinner"
      role="img"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg ring-1 ring-gray-300">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">เข้าสู่ระบบ</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => {
            setUserInput(e.target.value);
            clearMessage();
          }}
          placeholder="อีเมล หรือ ชื่อผู้ใช้"
          disabled={loading}
          className="w-full mb-4 px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearMessage();
          }}
          placeholder="รหัสผ่าน"
          disabled={loading}
          className="w-full mb-2 px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex justify-end mb-6">
          <button
            type="button"
            onClick={() => onSetActivePage("forgot-password")}
            className="text-sm text-blue-600 hover:underline cursor-pointer"
          >
            ลืมรหัสผ่าน?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition disabled:opacity-60 flex items-center justify-center"
        >
          {loading ? (
            <>
              <Spinner />
              กำลังเข้าสู่ระบบ...
            </>
          ) : (
            "เข้าสู่ระบบ"
          )}
        </button>
      </form>

      {/* ข้อความแจ้งเตือนใต้ปุ่ม */}
      {message && (
        <p className="mt-4 text-center text-sm text-red-600 font-medium select-none">{message}</p>
      )}

      <p className="mt-6 text-center text-gray-600">
        ยังไม่มีบัญชี?{" "}
        <button
          onClick={() => onSetActivePage("register")}
          className="text-blue-600 font-semibold hover:underline cursor-pointer"
        >
          สมัครสมาชิก
        </button>
      </p>
    </div>
  );
}
