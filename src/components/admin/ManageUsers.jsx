import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ManageUsers({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await axios.get("/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // เช็คว่าข้อมูลเป็น Array หรือไม่
        const data = res.data.users || res.data;
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        alert("โหลดข้อมูลผู้ใช้ล้มเหลว");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [token]);

  async function toggleBan(email, isBanned) {
    try {
      await axios.post(
        "/admin/user/update",
        { email: email, is_banned: !isBanned },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.email === email ? { ...u, is_banned: !isBanned } : u
        )
      );
    } catch {
      alert("เปลี่ยนสถานะแบนไม่สำเร็จ");
    }
  }

  return (
    <div>
      <h2>จัดการผู้ใช้</h2>
      {loading && <p>กำลังโหลด...</p>}
      <ul>
        {Array.isArray(users) && users.length > 0 ? (
          users.map((u) => (
            <li key={u.email}>
              {u.email} - Role: {u.roles ? u.roles.join(", ") : u.role || "user"} -{" "}
              Banned: {u.is_banned ? "Yes" : "No"}
              <button onClick={() => toggleBan(u.email, u.is_banned)}>
                {u.is_banned ? "ปลดแบน" : "แบน"}
              </button>
            </li>
          ))
        ) : (
          <li>ไม่มีข้อมูลผู้ใช้</li>
        )}
      </ul>
    </div>
  );
}
