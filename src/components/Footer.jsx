export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto w-full">
      <div className="max-w-screen-xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
        <p>© {new Date().getFullYear()} <span className="font-semibold text-gray-800">SnapTools</span>. All rights reserved.</p>
        <p className="mt-1">
          Made with <span className="text-red-500">❤️</span> by{" "}
          <a
            href="https://github.com/pawit5001"
            className="text-blue-600 hover:underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pawit
          </a>
        </p>
      </div>
    </footer>
  );
}
