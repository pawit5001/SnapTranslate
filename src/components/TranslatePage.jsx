import React, { useState, useEffect, useRef } from "react";
import { ImageUploader } from "./ImageUploader";
import { ModeSelector } from "./ModeSelector";
import { LanguageSelector } from "./LanguageSelector";
import { TranslateHandler } from "./TranslateHandler";
import { TranslateResult } from "./TranslateResult";

export function TranslatePage({
  image,
  setImage,
  mode,
  setMode,
  langs,
  setLangs,
  result,
  setResult,
  clearTrigger,
  setClearTrigger,
  token,
  setActivePage,
  onRequireLogin, // รับ callback
}) {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  // ref สำหรับ ImageUploader เพื่อเลื่อนหน้า
  const imageUploaderRef = useRef(null);

  // ref สำหรับผลลัพธ์การแปล
  const resultRef = useRef(null);

  useEffect(() => {
    if (!imageFile) {
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  useEffect(() => {
    if (clearTrigger) {
      setImageFile(null);
      setImageUrl(null);

      // หน่วงเวลาเลื่อน เพื่อให้ DOM รีเฟรชก่อนเลื่อน
      setTimeout(() => {
        if (imageUploaderRef.current) {
          const topPos =
            imageUploaderRef.current.getBoundingClientRect().top + window.pageYOffset;
          const offset = 80; // ปรับตาม header หรือ element บัง
          window.scrollTo({
            top: topPos - offset,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [clearTrigger]);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  const handleSetImage = (file) => {
    setImageFile(file);
    setImage(file);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ครอบ ImageUploader ด้วย div พร้อม ref */}
      <div ref={imageUploaderRef}>
        <ImageUploader
          setImage={handleSetImage}
          image={imageFile}
          clearTrigger={clearTrigger}
        />
      </div>

      <ModeSelector mode={mode} setMode={setMode} />
      <LanguageSelector langs={langs} setLangs={setLangs} />

      <TranslateHandler
        image={imageFile}
        mode={mode}
        langs={langs}
        result={result}
        setResult={setResult}
        setClearTrigger={setClearTrigger}
        setImage={setImage}
        setLangs={setLangs}
        token={token}
        onRequireLogin={onRequireLogin}
      />

      {result && (
        <div ref={resultRef}>
          <TranslateResult result={result} image={imageUrl} />
        </div>
      )}
    </div>
  );
}
