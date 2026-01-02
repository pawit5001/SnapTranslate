import React, { useEffect, useState, useContext } from "react";
import { fetchFeedbackStats } from "../../api/adminApi";
import { AuthContext } from "../../contexts/AuthContext";

export default function FeedbackStats() {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchFeedbackStats(token);
        setStats(data.feedback_stats);
      } catch (e) {
        setError("โหลดสถิติไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Feedback Stats</h2>
      <ul>
        {stats.map(({ _id, count }) => (
          <li key={_id}>
            Feedback: {_id}, Count: {count}
          </li>
        ))}
      </ul>
    </div>
  );
}
