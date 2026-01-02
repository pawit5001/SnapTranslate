import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard({ token }) {
  const [topLanguages, setTopLanguages] = useState([]);
  const [imageStats, setImageStats] = useState([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const langRes = await axios.get("/admin/usage-stats-summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // สมมติ backend ส่ง { usageStats: [...] }
        const data = langRes.data.usageStats || langRes.data;
        setTopLanguages(Array.isArray(data) ? data : []);

        const imgRes = await axios.get("/admin/image-stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const imgData = imgRes.data.imageStats || imgRes.data;
        setImageStats(Array.isArray(imgData) ? imgData : []);
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    }
    fetchStats();
  }, [token]);

  return (
    <div>
      <h2>แดชบอร์ด</h2>
      <section>
        <h3>ภาษาที่ใช้บ่อย</h3>
        <ul>
          {Array.isArray(topLanguages) &&
            topLanguages.map((lang) => (
              <li key={JSON.stringify(lang._id)}>
                {JSON.stringify(lang._id)}: {lang.total || lang.count}
              </li>
            ))}
        </ul>
      </section>
      <section>
        <h3>ประเภทภาพที่ใช้บ่อย</h3>
        <ul>
          {Array.isArray(imageStats) &&
            imageStats.map((cat) => (
              <li key={JSON.stringify(cat._id)}>
                {JSON.stringify(cat._id)}: {cat.total || cat.count}
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
