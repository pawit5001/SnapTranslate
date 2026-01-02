import React, { useState, useRef, useEffect } from "react";
import { CreateImageButton } from "./CreateImageButton";
import { Info } from "lucide-react";
import Modal from "./Modal";

export function CreateImagePage({ token, onRequireLogin }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const startTimeRef = useRef(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const resultRef = useRef(null);

  const handleGenerate = async () => {
    if (!token) {
      onRequireLogin?.();
      return;
    }
    if (!prompt.trim()) {
      setError("กรุณากรอกข้อความ");
      return;
    }

    setError(null);
    setLoading(true);
    setGeneratedImage(null);
    setImageInfo(null);
    setStatusMsg(null);

    startTimeRef.current = Date.now();

    try {
      const response = await fetch("http://localhost:8000/generate/image", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();

      if (response.ok && data.image_url) {
        const endTime = Date.now();
        const elapsedSec = ((endTime - startTimeRef.current) / 1000).toFixed(2);

        setGeneratedImage(data.image_url);
        setImageInfo({
          resolution: data.resolution || null,
          duration: elapsedSec,
        });
        setStatusMsg("สร้างเสร็จ! คุณสามารถดาวน์โหลดภาพได้เลย");
      } else {
        setError("สร้างภาพไม่สำเร็จ ลองใหม่อีกครั้ง");
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPrompt("");
    setGeneratedImage(null);
    setError(null);
    setImageInfo(null);
    setStatusMsg(null);
  };

  const canClear = prompt.trim() !== "" || generatedImage !== null || !!error;

  useEffect(() => {
    if (generatedImage && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [generatedImage]);

  const [downloaded, setDownloaded] = useState(false);
  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div className="flex items-center justify-center gap-2">
        <h2 className="text-4xl font-extrabold text-blue-700 select-none tracking-tight text-center">
          🎨 สร้างรูปภาพจากข้อความ
        </h2>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="text-gray-400 hover:text-blue-500 transition cursor-pointer"
          aria-label="ข้อมูลโมเดล"
        >
          <Info size={22} />
        </button>
      </div>

      <textarea
        className="w-full min-h-[140px] p-5 rounded-2xl border border-gray-300
          focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50
          resize-none text-gray-800 shadow-md text-lg transition"
        placeholder="พิมพ์ข้อความบรรยายรูปภาพที่คุณต้องการสร้าง..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={loading}
        spellCheck={false}
      />

      {error && (
        <div className="text-red-600 font-semibold select-none text-center">
          ⚠️ {error}
        </div>
      )}

      <CreateImageButton
        onClick={handleGenerate}
        onClear={handleClear}
        loading={loading}
        error={error}
        canClear={canClear}
        token={token}
        onRequireLogin={onRequireLogin}
      />

      {generatedImage && (
        <div
          ref={resultRef}
          className="mt-8 flex flex-col items-center gap-4 scroll-mt-24"
        >
          <img
            src={generatedImage}
            alt="Generated"
            className="rounded-3xl shadow-xl max-w-full h-auto border border-gray-200"
          />
          <p className="text-gray-700 select-none">
            📝 <b>Prompt:</b> {prompt}
          </p>
          {imageInfo?.resolution && (
            <p className="text-gray-700 select-none">
              📏 <b>ขนาดภาพ:</b> {imageInfo.resolution}
            </p>
          )}
          <p className="text-gray-700 select-none">
            ⏱️ <b>เวลาในการสร้าง:</b> {imageInfo?.duration} วินาที
          </p>

          {statusMsg && !error && (
            <div className="flex items-center justify-center gap-2 text-green-600 font-semibold select-none text-center mt-2">
              <svg
                className="w-6 h-6 animate-pulse"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{statusMsg}</span>
            </div>
          )}

          <a
            href={generatedImage}
            download="generated-image.png"
            onClick={handleDownload}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold text-white transition select-none
              ${downloaded
                ? "bg-green-600 hover:bg-green-700 cursor-default"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              }
            `}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0 0l-4-4m4 4l4-4"
              />
            </svg>
            {downloaded ? "ดาวน์โหลดแล้ว" : "ดาวน์โหลดภาพ"}
          </a>
        </div>
      )}

      {/* Modal แสดงข้อมูลโมเดล */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="ข้อมูลโมเดล"
        variant="alert"
      >
        <div className="space-y-2 text-gray-700">
          <p><b>โมเดลที่ใช้:</b> stabilityai/stable-diffusion-xl-base-1.0</p>
          <p><b>ประเภท:</b> Text-to-Image</p>
          <p><b>ความสามารถ:</b> สร้างภาพจากข้อความบรรยาย</p>
          <p><b>เครดิต:</b> โมเดลจาก Stability AI</p>
        </div>
      </Modal>
    </div>
  );
}
