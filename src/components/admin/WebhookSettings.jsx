import React, { useEffect, useState, useContext } from "react";
import { getWebhookSetting, updateWebhookSetting } from "../../api/adminApi";
import { AuthContext } from "../../contexts/AuthContext";

export default function WebhookSettings() {
  const { token } = useContext(AuthContext);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getWebhookSetting(token);
        setWebhookUrl(data.discord_webhook_url || "");
      } catch {
        setMsg("โหลดข้อมูล webhook ไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  async function save() {
    try {
      await updateWebhookSetting(token, webhookUrl);
      setMsg("บันทึกสำเร็จ");
    } catch {
      setMsg("บันทึกไม่สำเร็จ");
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>ตั้งค่า Discord Webhook</h2>
      <input
        type="url"
        value={webhookUrl}
        onChange={(e) => setWebhookUrl(e.target.value)}
        placeholder="ใส่ URL webhook"
        style={{ width: "100%" }}
      />
      <button onClick={save}>บันทึก</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}
