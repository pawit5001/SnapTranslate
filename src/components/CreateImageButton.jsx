export function CreateImageButton({
  onClick,
  onClear,
  loading,
  error,
  canClear,
  token,
  onRequireLogin,
}) {
  const baseClass =
    "w-full py-2.5 px-5 rounded-lg font-semibold transition-all duration-300 ease-in-out shadow-sm text-base flex items-center justify-center gap-2 select-none";

  const generateBtnClass = error
    ? "border border-red-500 text-red-600 bg-red-50 cursor-not-allowed hover:bg-red-50"
    : loading
    ? "bg-blue-100 text-blue-600 cursor-default"
    : "border border-blue-400 text-blue-600 hover:bg-blue-50 cursor-pointer";

  const clearBtnClass =
    loading || !canClear
      ? "border border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
      : "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer";

  // spinner แบบเดียวกับ TranslateButton
  const Spinner = () => (
    <span
      style={{
        display: "inline-block",
        width: 16,
        height: 16,
        border: "2px solid currentColor",
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
      aria-label="loading spinner"
      role="img"
    />
  );

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="my-4 flex gap-4 justify-center">
        <button
          onClick={() => {
            if (!token) {
              onRequireLogin?.();
            } else {
              onClick();
            }
          }}
          disabled={loading || !!error}
          className={`${baseClass} ${generateBtnClass}`}
        >
          {loading ? (
            <>
              <Spinner />
              กำลังสร้าง...
            </>
          ) : error ? (
            <span className="truncate max-w-[150px]" title={error}>
              {error}
            </span>
          ) : (
            "🔍 สร้างรูปภาพ"
          )}
        </button>

        <button
          onClick={onClear}
          disabled={loading || !canClear}
          className={`${baseClass} ${clearBtnClass}`}
        >
          🧹 ล้างข้อมูล
        </button>
      </div>
    </>
  );
}
