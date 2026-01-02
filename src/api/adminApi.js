import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function fetchFeedbackStats(token) {
  const res = await axios.get(`${BASE_URL}/stats/feedback`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function fetchUsageSummary(token) {
  const res = await axios.get(`${BASE_URL}/stats/usage-summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function fetchTopLanguages(token) {
  const res = await axios.get(`${BASE_URL}/stats/top-languages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function fetchImageCategories(token) {
  const res = await axios.get(`${BASE_URL}/stats/image-categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getWebhookSetting(token) {
  const res = await axios.get(`${BASE_URL}/admin/webhook`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateWebhookSetting(token, webhookUrl) {
  const res = await axios.put(
    `${BASE_URL}/admin/webhook`,
    { discord_webhook_url: webhookUrl },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}
