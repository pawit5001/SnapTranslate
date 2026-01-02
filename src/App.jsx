import React, { useState, useRef, useEffect } from "react";
import { CSSTransition } from "react-transition-group";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./components/LandingPage";
import { TranslatePage } from "./components/TranslatePage";
import { CreateImagePage } from "./components/CreateImagePage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import VerifyEmailPage from "./components/VerifyEmailPage";
import ResetPasswordPage from "./components/ResetPasswordPage";

// แก้ไข import ชื่อคอมโพเนนต์ไม่ซ้ำกัน
import ManageUsers from "./components/admin/ManageUsers";
import Dashboard from "./components/admin/Dashboard";

import { useAuth } from "./contexts/AuthContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Modal from "./components/Modal";

import "./animations.css";

export default function SnapTranslateApp() {
  const [showLanding, setShowLanding] = useState(true);
  const [activePage, setActivePage] = useState("แปลภาษาจากรูปภาพ");

  const { accessToken, user, login, logout } = useAuth();
  const token = accessToken;

  const [image, setImage] = useState(null);
  const [mode, setMode] = useState("object");
  const [langs, setLangs] = useState([]);
  const [result, setResult] = useState(null);
  const [clearTrigger, setClearTrigger] = useState(0);

  const [verifyEmail, setVerifyEmail] = useState("");

  const [showLoginModal, setShowLoginModal] = useState(false);

  const nodeRef = useRef(null);

  // ถ้า login แล้ว ห้ามไปหน้า login หรือ register
  useEffect(() => {
    if (
      (activePage === "login" || activePage === "register") &&
      token &&
      activePage !== "แปลภาษาจากรูปภาพ"
    ) {
      setActivePage("แปลภาษาจากรูปภาพ");
    }
  }, [activePage, token]);

  const handleLogout = () => {
    logout();
    setActivePage("login");
    setShowLanding(false);

    setImage(null);
    setMode("object");
    setLangs([]);
    setResult(null);
    setClearTrigger(0);
    setVerifyEmail("");
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
    setActivePage("แปลภาษาจากรูปภาพ");
  };

  const onVerified = ({ access_token, refresh_token }) => {
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    login({ access_token, refresh_token });

    setVerifyEmail("");
    setActivePage("แปลภาษาจากรูปภาพ");
    setShowLanding(false);
  };

  const handleRequireLogin = () => {
    setShowLoginModal(true);
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  };

  return (
    <>
      <CSSTransition
        key={showLanding ? "landing" : "app"}
        in={showLanding}
        timeout={300}
        classNames="slide-fade"
        unmountOnExit
        nodeRef={nodeRef}
      >
        <div ref={nodeRef} className="min-h-screen flex flex-col">
          <main className="flex-grow">
            <LandingPage onStart={() => setShowLanding(false)} />
          </main>
        </div>
      </CSSTransition>

      {!showLanding && (
        <div className="min-h-screen flex flex-col">
          <Navbar
            activePage={activePage}
            onSetActivePage={setActivePage}
            onBackToLanding={handleBackToLanding}
            onLogout={handleLogout}
            user={user}
          />

          <main className="flex-grow max-w-xl mx-auto px-4 py-8 w-full">
            {activePage === "แปลภาษาจากรูปภาพ" && (
              <TranslatePage
                image={image}
                setImage={setImage}
                mode={mode}
                setMode={setMode}
                langs={langs}
                setLangs={setLangs}
                result={result}
                setResult={setResult}
                clearTrigger={clearTrigger}
                setClearTrigger={() => setClearTrigger((prev) => prev + 1)}
                token={token}
                setActivePage={setActivePage}
                onRequireLogin={handleRequireLogin}
              />
            )}

            {activePage === "สร้างรูปภาพจากข้อความ" && (
              <CreateImagePage
                onBackToLanding={handleBackToLanding}
                token={token}
                onRequireLogin={handleRequireLogin}
              />
            )}

            {activePage === "แดชบอร์ด" && user?.role === "admin" && (
              <Dashboard token={token} />
            )}

            {activePage === "login" && (
              <LoginPage
                onSetActivePage={setActivePage}
                onRequireLogin={handleRequireLogin}
              />
            )}

            {activePage === "register" && (
              <RegisterPage
                onSetActivePage={setActivePage}
                onSetVerifyEmail={setVerifyEmail}
              />
            )}

            {activePage === "verify-email" && (
              <VerifyEmailPage
                email={verifyEmail}
                onVerified={onVerified}
                onBackToRegister={() => setActivePage("register")}
              />
            )}

            {activePage === "forgot-password" && (
              <ResetPasswordPage onSetActivePage={setActivePage} />
            )}
          </main>

          <Footer />
        </div>
      )}

      <Modal
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        title="กรุณาเข้าสู่ระบบ"
        variant="login-required"
        onConfirm={() => {
          setActivePage("login");
          setShowLanding(false);
          handleCloseLoginModal();
        }}
        onCancel={handleCloseLoginModal}
      >
        <p>คุณต้องเข้าสู่ระบบก่อนใช้งานฟีเจอร์นี้</p>
      </Modal>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        limit={1}
      />
    </>
  );
}
