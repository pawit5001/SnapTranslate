import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ResetPasswordForm({ onSetActivePage }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [otpConfirmed, setOtpConfirmed] = useState(false); // ✅ flag เช็ค OTP

  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) =>
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const sendOtp = async () => {
    if (!validateEmail(email.trim())) {
      setErrorMsg("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/auth/request-reset-password-otp", {
        email: email.trim(),
      });
      if (res.status === 200) {
        setStep(2);
        setSuccessMsg(`ส่ง OTP ไปยัง: ${email.trim()} กรุณาตรวจสอบอีเมลของคุณ`);
        setCooldown(60);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "ไม่สามารถส่ง OTP ได้");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0) return;

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/auth/request-reset-password-otp", {
        email: email.trim(),
      });
      if (res.status === 200) {
        setSuccessMsg(`ส่ง OTP ซ้ำแล้ว กรุณาตรวจสอบอีเมล`);
        setCooldown(60);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "ไม่สามารถส่ง OTP ซ้ำได้");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!otp.trim() || !newPassword || !confirmPassword) {
      setErrorMsg("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (!validatePassword(newPassword)) {
      setErrorMsg("รหัสผ่านต้องมี 8 ตัวขึ้นไป และประกอบด้วย A-Z, a-z, 0-9, และอักขระพิเศษ");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/auth/reset-password", {
        email: email.trim(),
        otp: otp.trim(), // ✅ แนบ OTP ไปด้วย
        new_password: newPassword.trim(),
      });

      if (res.status === 200) {
        setOtpConfirmed(true); // ✅ ยืนยัน OTP สำเร็จ
        setSuccessMsg("รีเซ็ตรหัสผ่านสำเร็จ กำลังกลับไปยังหน้าเข้าสู่ระบบ...");
        setTimeout(() => {
          if (typeof onSetActivePage === "function") {
            onSetActivePage("login");
          }
        }, 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "OTP ไม่ถูกต้องหรือหมดอายุ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-8 py-10 bg-white rounded-3xl shadow-xl mt-10">
      <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">รีเซ็ตรหัสผ่าน</h2>

      {step === 1 && (
        <>
          <label className="block mb-3 text-lg font-semibold text-gray-700">อีเมล</label>
          <input
            type="email"
            placeholder="your@email.com"
            className="w-full p-4 border border-gray-300 rounded-xl mb-6 focus:ring-4 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <button
            onClick={sendOtp}
            disabled={loading || cooldown > 0}
            className={`w-full py-4 rounded-xl text-white font-semibold text-lg ${
              loading || cooldown > 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <span className="inline-block w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : cooldown > 0 ? `ขอ OTP อีกใน ${cooldown} วินาที` : "ส่ง OTP"}
          </button>

          <button
            onClick={() => onSetActivePage?.("login")}
            className="w-full py-4 rounded-xl mt-4 bg-gray-600 text-white hover:bg-gray-700 text-lg font-semibold"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <p className="mb-6 text-center text-gray-700 text-lg">
            เราส่งรหัส OTP ไปที่: <span className="font-semibold">{email}</span>
          </p>

          <label className="block mb-3 text-lg font-semibold text-gray-700">รหัส OTP</label>
          <input
            type="text"
            placeholder="กรอกรหัส OTP"
            autoComplete="one-time-code"
            className="w-full p-4 border border-gray-300 rounded-xl mb-6 focus:ring-4 focus:ring-blue-400"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={loading || otpConfirmed}
          />

          <label className="block mb-3 text-lg font-semibold text-gray-700">รหัสผ่านใหม่</label>
          <input
            type="password"
            placeholder="รหัสผ่านใหม่"
            className="w-full p-4 border border-gray-300 rounded-xl mb-6 focus:ring-4 focus:ring-blue-400"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
          />

          <label className="block mb-3 text-lg font-semibold text-gray-700">ยืนยันรหัสผ่าน</label>
          <input
            type="password"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            className="w-full p-4 border border-gray-300 rounded-xl mb-8 focus:ring-4 focus:ring-blue-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
          />

          {!otpConfirmed && (
            <button
              onClick={resendOtp}
              disabled={loading || cooldown > 0}
              className={`w-full py-4 rounded-xl mb-5 font-semibold text-lg ${
                cooldown > 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-gray-300 hover:bg-gray-400 text-gray-700 cursor-pointer"
              }`}
            >
              {cooldown > 0 ? `ส่ง OTP ซ้ำใน ${cooldown} วินาที` : "ส่ง OTP ซ้ำ"}
            </button>
          )}

          <button
            onClick={resetPassword}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              "รีเซ็ตรหัสผ่าน"
            )}
          </button>
        </>
      )}

      {(errorMsg || successMsg) && (
        <div
          className={`mt-8 text-center text-sm font-medium ${
            errorMsg ? "text-red-600" : "text-green-600"
          }`}
        >
          {errorMsg || successMsg}
        </div>
      )}
    </div>
  );
}
