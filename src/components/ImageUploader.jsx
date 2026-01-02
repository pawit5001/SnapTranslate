import React, { useState, useRef, useEffect } from "react";
import { Upload, XCircle, AlertCircle } from "lucide-react";

export function ImageUploader({ image, setImage }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);
  const prevUrlRef = useRef(null);

  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    setTimeout(() => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = url;
    }, 100);
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
    };
  }, [image]);

  const isValidImage = (file) => {
    const acceptedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
      "image/jpg",
    ];
    return acceptedTypes.includes(file.type);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && isValidImage(file)) {
      setImage(file);
      setErrorMsg("");
    } else {
      setErrorMsg("ไฟล์ไม่ใช่รูปภาพที่รองรับ (.jpg, .png, .webp, .heic)");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && isValidImage(file)) {
      setImage(file);
      setErrorMsg("");
    } else {
      setErrorMsg("ไฟล์ไม่ใช่รูปภาพที่รองรับ");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file && isValidImage(file)) {
          setImage(file);
          setErrorMsg("");
        } else {
          setErrorMsg("รูปภาพที่วางไม่รองรับ");
        }
        break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  return (
    <fieldset className="mb-6 p-6 border border-gray-300 rounded-2xl shadow-sm bg-white transition-transform duration-300 ease-in-out hover:scale-[1.01]">
      <legend className="flex items-center gap-2 text-xl font-semibold text-gray-800 mb-4">
        <Upload className="w-6 h-6 text-blue-600" />
      อัปโหลดรูปภาพ
      </legend>

      <div
        role="button"
        tabIndex={0}
        aria-label="พื้นที่อัปโหลดรูปภาพ"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleClick();
            e.preventDefault();
          }
        }}
        className={`relative rounded-xl border border-dashed p-0 cursor-pointer text-center transition-shadow duration-300
          ${
            isDragging
              ? "border-blue-400 bg-blue-50 shadow-md"
              : "border-gray-300 bg-white shadow-sm hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
          }
          w-full max-w-2xl mx-auto
          flex justify-center items-center
        `}
        style={{
          height: "40vw",     // responsive ตามความกว้างหน้าจอ
          maxHeight: 250,     // สูงสุดไม่เกิน 300px
          minHeight: 180,     // ต่ำสุดไม่ให้ย่อเกินไป
          userSelect: "none",
          overflow: "hidden", // ตัดรูปที่เกิน
        }}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover", // แสดงเต็มกรอบ
                userSelect: "none",
              }}
              draggable={false}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImage(null);
                setErrorMsg("");
                if (fileInputRef.current) fileInputRef.current.value = null;
              }}
              className="absolute top-2 right-2 rounded-full p-1 bg-white shadow-md text-red-500 hover:text-red-700 transition z-10 cursor-pointer"
              title="ลบรูป"
              aria-label="ลบรูป"
              type="button"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 text-gray-600 px-6 select-none">
            <p className="text-lg font-semibold">คลิกเพื่ออัปโหลดรูปภาพ</p>
            <p className="text-sm text-gray-400">(รองรับ .jpg, .png, .webp, .heic)</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {errorMsg && (
        <div className="flex items-center mt-3 text-red-700 text-sm font-semibold">
          <AlertCircle className="w-5 h-5 mr-2" />
          {errorMsg}
        </div>
      )}
    </fieldset>
  );
}
