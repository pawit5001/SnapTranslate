import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard({ token }) {
  const [topLanguages, setTopLanguages] = useState([]);
  const [imageStats, setImageStats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const langRes = await axios.get("/api/stats/top-languages", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTopLanguages(langRes.data.top_languages || []);

        const imgRes = await axios.get("/api/stats/image-categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setImageStats(imgRes.data.image_categories || []);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h2>แดชบอร์ด</h2>
      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <>
          <section>
            <h3>ภาษาที่ใช้บ่อย</h3>
            {topLanguages.length === 0 ? (
              <p>ไม่มีข้อมูลภาษาที่ใช้บ่อย</p>
            ) : (
              <ul>
                {topLanguages.map((lang) => (
                  <li key={lang._id?.toString() || lang._id}>
                    {lang._id}: {lang.count}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h3>ประเภทภาพที่ใช้บ่อย</h3>
            {imageStats.length === 0 ? (
              <p>ไม่มีข้อมูลประเภทภาพที่ใช้บ่อย</p>
            ) : (
              <ul>
                {imageStats.map((cat) => (
                  <li key={cat._id?.toString() || cat._id}>
                    {cat._id}: {cat.count}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
