import { useState, useEffect } from "react";
import axios from "axios";

export default function VerifyEmailPage({ email, onVerified, onBackToRegister }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  // ลด cooldown ทุกวินาที
  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  // เคลียร์ข้อความ error อัตโนมัติหลัง 3 วิ
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // เคลียร์ข้อความ success อัตโนมัติหลัง 5 วิ
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleVerify = async () => {
    setError("");
    setSuccess("");

    if (otp.trim().length !== 6) {
      setError("กรุณากรอกรหัส OTP 6 หลัก");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/auth/verify-email", {
        email,
        otp: otp.trim(),
      });

      const { access_token, refresh_token } = res.data;

      if (access_token && refresh_token) {
        setSuccess("ยืนยันอีเมลสำเร็จ กำลังเข้าสู่ระบบ...");
        setTimeout(() => {
          onVerified({ access_token, refresh_token });
        }, 1000);
      } else {
        setError("ไม่พบ token จากเซิร์ฟเวอร์");
      }
    } catch (err) {
      // แก้ไขตรงนี้ให้รองรับหลายรูปแบบ error
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || "เกิดข้อผิดพลาด");
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("ยืนยันไม่สำเร็จ");
      }
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันส่ง OTP ซ้ำ
  const resendOtp = async () => {
    if (cooldown > 0) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/auth/request-verify-email-otp", {
        email,
      });

      if (res.status === 200) {
        setSuccess(`ส่ง OTP ซ้ำแล้ว กรุณาตรวจสอบอีเมล`);
        setCooldown(60);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || "ไม่สามารถส่ง OTP ซ้ำได้");
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("ไม่สามารถส่ง OTP ซ้ำได้");
      }
    } finally {
      setLoading(false);
    }
  };

  // รองรับกด Enter ใน input
  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!loading) {
        handleVerify();
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg ring-1 ring-gray-300">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">ยืนยันอีเมล</h1>
      <p className="mb-6 text-center text-gray-600">
        กรุณากรอกรหัส OTP ที่ส่งไปยัง <b>{email}</b>
      </p>

      {/* แสดง Error */}
      {typeof error === "string" && error && (
        <div className="mb-4 text-red-700 bg-red-100 border border-red-400 rounded-lg p-3 flex items-center space-x-3">
          <svg
            className="w-6 h-6 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* แสดง Success */}
      {success && (
        <div className="mb-4 text-green-700 bg-green-100 border border-green-400 rounded-lg p-3 flex items-center space-x-3">
          <svg
            className="w-6 h-6 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="รหัส OTP 6 หลัก"
        maxLength={6}
        disabled={loading}
        className="w-full mb-6 px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl tracking-widest"
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
      >
        {loading ? "กำลังยืนยัน..." : "ยืนยัน"}
      </button>

      <button
        onClick={resendOtp}
        disabled={loading || cooldown > 0}
        className={`w-full py-3 rounded-lg mt-4 font-semibold text-lg ${
          cooldown > 0
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-gray-300 hover:bg-gray-400 text-gray-700 cursor-pointer"
        }`}
      >
        {cooldown > 0 ? `ส่ง OTP ซ้ำใน ${cooldown} วินาที` : "ส่ง OTP ซ้ำ"}
      </button>

      <p className="mt-6 text-center text-gray-600">
        <button
          onClick={onBackToRegister}
          className="text-blue-600 font-semibold hover:underline cursor-pointer"
        >
          กลับไปสมัครใหม่
        </button>
      </p>
    </div>
  );
}
