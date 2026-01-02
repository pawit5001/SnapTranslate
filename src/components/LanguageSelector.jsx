import React, { useEffect, useState } from "react";

export function LanguageSelector({ langs, setLangs }) {
  const [languages, setLanguages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);

  const top5Languages = ["อังกฤษ", "ญี่ปุ่น", "เกาหลี", "จีน (ตัวย่อ)", "รัสเซีย"];

  useEffect(() => {
    fetch("http://localhost:8000/languages")
      .then((res) => res.json())
      .then((data) => setLanguages(data))
      .catch((err) => console.error("โหลดภาษาไม่สำเร็จ:", err));
  }, []);

  const languageOptions = Object.keys(languages).sort((a, b) => a.localeCompare(b));

  // แยก selected ไว้บนสุด ส่วนที่เหลือเรียง top5 + อักษร
  const filteredOptions = (() => {
    const filtered = languageOptions.filter((lang) =>
      lang.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedLangs = filtered.filter((lang) => langs.includes(lang));
    const unselectedLangs = filtered.filter((lang) => !langs.includes(lang));

    unselectedLangs.sort((a, b) => {
      if (top5Languages.includes(a) && !top5Languages.includes(b)) return -1;
      if (!top5Languages.includes(a) && top5Languages.includes(b)) return 1;
      return a.localeCompare(b);
    });

    return [...selectedLangs, ...unselectedLangs];
  })();

  const toggleLang = (lang) => {
    if (langs.includes(lang)) {
      setLangs(langs.filter((l) => l !== lang));
    } else if (langs.length < 5) {
      setLangs([...langs, lang]);
    }
  };

  const toggleTop5 = () => {
    const isAllSelected = langs.length === 5
    if (isAllSelected) {
      setLangs([]);
    } else {
      setLangs(top5Languages.filter((lang) => languageOptions.includes(lang)));
    }
  };

  const maxSelected = langs.length === 5;

  return (
    <fieldset className="mb-6 p-6 border border-gray-300 rounded-2xl shadow-sm bg-white transition-transform duration-300 ease-in-out hover:scale-[1.01]">
      <legend className="text-xl font-semibold text-gray-800 mb-4">
        เลือกภาษา (สูงสุด 5 ภาษา)
      </legend>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="ค้นหาภาษา..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="ค้นหาภาษา"
        />
        <button
          onClick={toggleTop5}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition cursor-pointer"
          type="button"
          aria-pressed={langs.length === 5}
        >
          {langs.length === 5 ? "ล้างทั้งหมด" : "เลือก 5 ภาษาหลัก"}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto">
        {(showAll ? filteredOptions : filteredOptions.slice(0, 12)).map((lang) => {
          const selected = langs.includes(lang);
          const disabled = !selected && maxSelected;

          return (
            <button
              key={lang}
              onClick={() => toggleLang(lang)}
              disabled={disabled}
              className={`cursor-pointer flex items-center justify-start px-4 py-2 rounded-xl border w-full text-left transition
                ${
                  selected
                    ? "border-blue-500 bg-blue-50 text-blue-800"
                    : disabled
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-gray-50"
                }`}
              type="button"
              aria-pressed={selected}
            >
              <input
                type="checkbox"
                checked={selected}
                readOnly
                className="cursor-pointer mr-3 h-4 w-4 text-blue-600 accent-blue-600"
                tabIndex={-1}
                aria-hidden="true"
              />
              <span className="text-sm font-medium">{lang}</span>
            </button>
          );
        })}
      </div>

      {filteredOptions.length > 12 && (
        <div className="mt-4 text-right">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:underline cursor-pointer"
            type="button"
            aria-expanded={showAll}
          >
            {showAll ? "ซ่อนบางภาษา" : "ดูทั้งหมด"}
          </button>
        </div>
      )}
    </fieldset>
  );
}
