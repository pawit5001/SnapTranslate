import { useRef, useState } from "react";
import { Volume2, Copy, CheckCircle } from "lucide-react";

export function TranslateResult({ result, image }) {
  const audioRefs = useRef({});
  const [playingLang, setPlayingLang] = useState(null);
  const [copiedLang, setCopiedLang] = useState(null);

  const playAudio = (lang) => {
    if (playingLang && audioRefs.current[playingLang]) {
      audioRefs.current[playingLang].pause();
      audioRefs.current[playingLang].currentTime = 0;
    }
    const audio = audioRefs.current[lang];
    if (audio) {
      audio.play();
      setPlayingLang(lang);
      audio.onended = () => setPlayingLang(null);
    }
  };

  const copyText = (text, lang) => {
    navigator.clipboard.writeText(text);
    setCopiedLang(lang);
    setTimeout(() => setCopiedLang(null), 1500);
  };

  return (
    <div className="mt-10 p-8 max-w-4xl mx-auto bg-white rounded-3xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3 select-none">
        📄 ผลลัพธ์การแปล
      </h1>

      {/* ภาพที่อัปโหลด */}
      {image && (
        <div className="mb-8 flex justify-center">
          <img
            src={image}
            alt="ภาพที่อัปโหลด"
            className="rounded-xl shadow-md border border-gray-200"
            style={{
              maxWidth: "100%",
              maxHeight: 280,
              objectFit: "cover",
            }}
          />
        </div>
      )}

      {/* ต้นฉบับ */}
      <div className="p-6 rounded-2xl bg-blue-50 border border-blue-300 mb-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-blue-900">ต้นฉบับ</h2>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => playAudio("th")}
              className={`transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 rounded ${
                playingLang === "th"
                  ? "text-blue-800 animate-pulse"
                  : "text-blue-600 hover:text-blue-800"
              }`}
              title="เล่นเสียง ภาษาไทย"
              aria-label="เล่นเสียงภาษาไทย"
            >
              <Volume2 className="w-6 h-6" />
            </button>

            <button
              onClick={() => copyText(result.th, "th")}
              className="text-gray-500 hover:text-gray-800 transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
              title="คัดลอกข้อความ"
              aria-label="คัดลอกข้อความต้นฉบับ"
            >
              {copiedLang === "th" ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>

            <audio
              ref={(el) => (audioRefs.current["th"] = el)}
              src={`http://localhost:8000${result.audio_url}`}
            />
          </div>
        </div>
        <p className="text-gray-900 text-base leading-relaxed">{result.th}</p>
      </div>

      {/* ภาษาอื่น */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        style={{ gridAutoRows: "1fr" }}
      >
        {result.translations.map((t) => (
          <div
            key={t.language}
            className="p-6 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors duration-300 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 truncate max-w-[60%]">
                <span className="text-blue-600">{t.language}</span>
              </h3>
              <div className="flex gap-4 items-center shrink-0">
                <button
                  onClick={() => playAudio(t.language)}
                  className={`transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 rounded ${
                    playingLang === t.language
                      ? "text-blue-800 animate-pulse"
                      : "text-blue-600 hover:text-blue-800"
                  }`}
                  title={`เล่นเสียง ${t.language}`}
                  aria-label={`เล่นเสียงภาษา${t.language}`}
                >
                  <Volume2 className="w-6 h-6" />
                </button>
                <button
                  onClick={() => copyText(t.translated, t.language)}
                  className="text-gray-500 hover:text-gray-800 transition-colors duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-400 rounded"
                  title={`คัดลอก ${t.language}`}
                  aria-label={`คัดลอกข้อความภาษา${t.language}`}
                >
                  {copiedLang === t.language ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>

                <audio
                  ref={(el) => (audioRefs.current[t.language] = el)}
                  src={`http://localhost:8000${t.audio_url}`}
                />
              </div>
            </div>
            <p className="text-gray-900 text-base leading-relaxed flex-grow break-words">
              {t.translated}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
