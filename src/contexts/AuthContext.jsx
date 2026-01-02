import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access_token") || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refresh_token") || null);
  const [user, setUser] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // ฟังก์ชันโหลดโปรไฟล์ผู้ใช้
  const fetchUserProfile = useCallback(async () => {
    if (!accessToken) {
      setUser(null);
      return;
    }
    setLoadingProfile(true);
    try {
      const res = await fetch("http://localhost:8000/auth/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.status === 401 && refreshToken) {
        // token หมดอายุ ลอง refresh
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          throw new Error("ไม่สามารถต่ออายุ token ได้");
        }
        return; // เมื่อ refresh แล้ว จะเรียก fetchUserProfile อีกครั้งจาก useEffect
      }
      if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
      const data = await res.json();
      setUser(data);
    } catch (error) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } finally {
      setLoadingProfile(false);
    }
  }, [accessToken, refreshToken]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // ฟังก์ชัน login รับ token ทั้ง 2 ตัว
  const login = ({ access_token, refresh_token }) => {
    setAccessToken(access_token);
    setRefreshToken(refresh_token);
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
  };

  // ฟังก์ชัน logout
  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  };

  // ฟังก์ชันต่ออายุ access token ด้วย refresh token
  const refreshAccessToken = async () => {
    if (!refreshToken) return false;

    try {
      const res = await fetch("http://localhost:8000/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) throw new Error("Refresh token ไม่ถูกต้องหรือหมดอายุ");

      const data = await res.json();
      setAccessToken(data.access_token);
      localStorage.setItem("access_token", data.access_token);
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        user,
        loadingProfile,
        login,
        logout,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
