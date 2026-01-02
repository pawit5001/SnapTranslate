import React, { useState } from "react";
import axios from "axios";
import { TranslateButton } from "./TranslateButton";

export function TranslateHandler({
  image,
  mode,
  langs,
  result,
  setImage,
  setLangs,
  setResult,
  setClearTrigger,
  token,
  onRequireLogin,
}) {
  const [loading, setLoading] = useState(false);
  const [popupMsg, setPopupMsg] = useState(null);
  const [clearCount, setClearCount] = useState(0);

  const showPopup = (msg) => {
    setPopupMsg(msg);
    setTimeout(() => setPopupMsg(null), 2000);
  };

  const handleSubmit = async () => {
    if (!token) {
      onRequireLogin?.();
      return;
    }

    if (!image) {
      showPopup("กรุณาเลือกรูปภาพก่อน");
      return;
    }

    if (langs.length === 0) {
      showPopup("กรุณาเลือกภาษาที่ต้องการแปล");
      return;
    }

    setResult && setResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("mode", mode);
      formData.append("langs", JSON.stringify(langs));

      const res = await axios.post("http://localhost:8000/analyze/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type ไม่ต้องกำหนดเพราะ axios จะจัดการเองเมื่อใช้ FormData
        },
      });

      setResult && setResult(res.data);
    } catch (error) {
      console.error("TranslateHandler: error", error);
      showPopup("แปลไม่สำเร็จ หรือไม่พบวัตถุในภาพ");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (typeof setImage === "function") setImage(null);
    if (typeof setLangs === "function") setLangs([]);
    if (typeof setResult === "function") setResult(null);
    setPopupMsg(null);
    setClearCount((prev) => {
      const newCount = prev + 1;
      if (typeof setClearTrigger === "function") {
        setClearTrigger(newCount);
      }
      return newCount;
    });
  };

  const hasData = image !== null || langs.length > 0 || result !== null;

  return (
    <TranslateButton
      onClick={handleSubmit}
      onClear={handleClear}
      loading={loading}
      popupMsg={popupMsg}
      canClear={hasData}
      token={token}
      onRequireLogin={onRequireLogin}
    />
  );
}
