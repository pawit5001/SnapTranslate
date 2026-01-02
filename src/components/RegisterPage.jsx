import { useState, useEffect } from "react";
import axios from "axios";

export default function RegisterPage({ onSetActivePage, onSetVerifyEmail }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailAvailable, setEmailAvailable] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  const [touched, setTouched] = useState({
    email: false,
    username: false,
    password: false,
    confirmPassword: false,
  });

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateUsername(name) {
    const valid = /^[a-zA-Z0-9](?!.*[._]{2})[a-zA-Z0-9._]{1,18}[a-zA-Z0-9]$/.test(name);
    return name.length >= 3 && name.length <= 20 && valid;
  }

  function validatePassword(pw) {
    const lengthCheck = pw.length >= 8;
    const numberCheck = /[0-9]/.test(pw);
    const lowerCheck = /[a-z]/.test(pw);
    const upperCheck = /[A-Z]/.test(pw);
    const specialCheck = /[!@#$%^&*(),.?":{}|<>]/.test(pw);
    return lengthCheck && numberCheck && lowerCheck && upperCheck && specialCheck;
  }

  useEffect(() => {
    if (!validateEmail(email)) return setEmailAvailable(null);
    const timeout = setTimeout(async () => {
      try {
        const res = await axios.post("http://localhost:8000/auth/check-availability", null, {
          params: { field: "email", value: email.trim() },
        });
        setEmailAvailable(res.data.available);
      } catch {
        setEmailAvailable(false);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [email]);

  useEffect(() => {
    if (!validateUsername(username)) return setUsernameAvailable(null);
    const timeout = setTimeout(async () => {
      try {
        const res = await axios.post("http://localhost:8000/auth/check-availability", null, {
          params: { field: "username", value: username.trim() },
        });
        setUsernameAvailable(res.data.available);
      } catch {
        setUsernameAvailable(false);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [username]);

  const handleInputChange = (setter, field) => (e) => {
    setter(e.target.value);
    setError(""); // clear main error
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const emailTrim = email.trim();
    const usernameTrim = username.trim();

    if (!emailTrim || !usernameTrim || !password || !confirmPassword)
      return setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");

    if (!validateEmail(emailTrim)) return setError("รูปแบบอีเมลไม่ถูกต้อง");
    if (!emailAvailable) return setError("อีเมลนี้ถูกใช้งานแล้วหรือไม่ถูกต้อง");

    if (!validateUsername(usernameTrim))
      return setError("ชื่อผู้ใช้ไม่ถูกต้อง หรือมีความยาวไม่เหมาะสม");

    if (!usernameAvailable) return setError("ชื่อผู้ใช้นี้ถูกใช้งานแล้ว");

    if (!validatePassword(password))
      return setError("รหัสผ่านไม่ปลอดภัยพอ ต้องมีตัวพิมพ์ใหญ่ เล็ก ตัวเลข และสัญลักษณ์");

    if (password !== confirmPassword) return setError("รหัสผ่านไม่ตรงกัน");

    setLoading(true);
    try {
      await axios.post("http://localhost:8000/auth/register", {
        email: emailTrim,
        username: usernameTrim,
        password,
      });
      onSetVerifyEmail(emailTrim);
      onSetActivePage("verify-email");
    } catch (err) {
      setError(err.response?.data?.detail || "สมัครไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const InputError = ({ show, message }) =>
    show ? <p className="text-sm text-red-600 mt-1">{message}</p> : null;

  return (
    <form
      onSubmit={handleRegister}
      className="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg ring-1 ring-gray-300"
    >
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">สมัครสมาชิก</h1>

      <div className="mb-4">
        <input
          type="email"
          placeholder="อีเมล"
          value={email}
          onChange={handleInputChange(setEmail, "email")}
          onBlur={handleBlur("email")}
          disabled={loading}
          className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <InputError
          show={touched.email && !validateEmail(email)}
          message="รูปแบบอีเมลไม่ถูกต้อง"
        />
        {touched.email && validateEmail(email) && (
          <p className={`text-sm mt-1 ${emailAvailable ? "text-green-600" : "text-red-600"}`}>
            {emailAvailable === null
              ? null
              : emailAvailable
              ? "อีเมลนี้สามารถใช้ได้"
              : "อีเมลนี้ถูกใช้งานแล้ว"}
          </p>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="ชื่อผู้ใช้"
          value={username}
          onChange={handleInputChange(setUsername, "username")}
          onBlur={handleBlur("username")}
          disabled={loading}
          className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <InputError
          show={touched.username && !validateUsername(username)}
          message="ชื่อผู้ใช้ไม่ถูกต้องหรือไม่เป็นไปตามรูปแบบ"
        />
        {touched.username && validateUsername(username) && (
          <p className={`text-sm mt-1 ${usernameAvailable ? "text-green-600" : "text-red-600"}`}>
            {usernameAvailable === null
              ? null
              : usernameAvailable
              ? "ชื่อผู้ใช้นี้สามารถใช้ได้"
              : "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว"}
          </p>
        )}
      </div>

      <div className="mb-4">
        <input
          type="password"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={handleInputChange(setPassword, "password")}
          onBlur={handleBlur("password")}
          disabled={loading}
          className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <InputError
          show={touched.password && !validatePassword(password)}
          message="รหัสผ่านต้องมีความยาว 8 ตัวขึ้นไป และประกอบด้วยตัวพิมพ์ใหญ่ เล็ก ตัวเลข และสัญลักษณ์"
        />
      </div>

      <div className="mb-6">
        <input
          type="password"
          placeholder="ยืนยันรหัสผ่าน"
          value={confirmPassword}
          onChange={handleInputChange(setConfirmPassword, "confirmPassword")}
          onBlur={handleBlur("confirmPassword")}
          disabled={loading}
          className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <InputError
          show={touched.confirmPassword && password !== confirmPassword}
          message="รหัสผ่านไม่ตรงกัน"
        />
      </div>

      {error && (
        <div className="mb-4 text-center text-red-600 font-medium">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-60 cursor-pointer"
      >
        {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
      </button>

      <p className="mt-6 text-center text-gray-600">
        มีบัญชีแล้ว?{" "}
        <button
          type="button"
          onClick={() => onSetActivePage("login")}
          className="text-blue-600 font-semibold hover:underline cursor-pointer"
        >
          เข้าสู่ระบบ
        </button>
      </p>
    </form>
  );
}
