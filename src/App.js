// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { initializeAuth } from "./redux/slices/authSlice";

// Componentes de Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import KofiButton from "./components/KofiButton";
import PageTransition from "./components/PageTransition";
import { AnimatePresence } from 'framer-motion';

// Páginas
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CharacterForm from "./pages/CharacterForm";
import CharacterList from "./pages/CharacterList";
import CharacterSheet from "./pages/CharacterSheet";
import SharedHomebrew from "./pages/SharedHomebrew";
import ProfilePage from "./pages/ProfilePage";
import Homebrews from "./pages/Homebrews";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CharacterPortraitPage from "./pages/CharacterPortraitPage";
import CampaignList from "./pages/CampaignList";
import CampaignForm from "./pages/CampaignForm";

// --- IMPORTAÇÕES AJUSTADAS ---
import CampaignLobby from "./components/CampaignLobby"; // Assumindo que o arquivo está em 'src/pages/'
import CampaignSheet from "./pages/CampaignSheet"; // Rota para o Escudo do Mestre

import "./App.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

const AppContent = () => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isPortraitRoute = location.pathname.startsWith('/character-portrait/');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isPortraitRoute && <Navbar />}
      <main style={{ flexGrow: 1 }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* --- Rotas Públicas --- */}
            <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
            <Route path="/reset-password/:token" element={<PageTransition><ResetPasswordPage /></PageTransition>} />

            {/* --- Rota de Homebrew Compartilhado (Pública) --- */}
            <Route path="/shared/:id" element={<SharedHomebrew />} />
            
            {/* --- Rota de Retrato (Pública, sem layout padrão) --- */}
            <Route path="/character-portrait/:id" element={<CharacterPortraitPage />} />
            
            {/* --- Rotas Protegidas --- */}
            <Route path="/create" element={isAuthenticated ? <PageTransition><CharacterForm /></PageTransition> : <PageTransition><LoginPage /></PageTransition>} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/characters" element={isAuthenticated ? <PageTransition><CharacterList /></PageTransition> : <PageTransition><LoginPage /></PageTransition>} />
            <Route path="/character-sheet/:id" element={isAuthenticated ? <PageTransition><CharacterSheet /></PageTransition> : <PageTransition><LoginPage /></PageTransition>} />
            <Route path="/homebrews" element={isAuthenticated ? <PageTransition><Homebrews /></PageTransition> : <PageTransition><LoginPage /></PageTransition>} />
            <Route path="/campaigns" element={isAuthenticated ? <PageTransition><CampaignList /></PageTransition> : <PageTransition><LoginPage /></PageTransition>} />
            <Route path="/create-campaign" element={isAuthenticated ? <PageTransition><CampaignForm /></PageTransition> : <PageTransition><LoginPage /></PageTransition>} />
            
            {/* --- NOVAS ROTAS DA CAMPANHA --- */}
            <Route
              path="/campaign-lobby/:id"
              element={isAuthenticated ? <PageTransition><CampaignLobby /></PageTransition> : <PageTransition><LoginPage /></PageTransition>}
            />
            <Route
              path="/campaign-sheet/:id"
              element={isAuthenticated ? <PageTransition><CampaignSheet /></PageTransition> : <PageTransition><LoginPage /></PageTransition>}
            />
          </Routes>
        </AnimatePresence>
      </main>
      {!isPortraitRoute && <Footer />}
      {!isPortraitRoute && <KofiButton />}
    </div>
  );
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initApp = async () => {
      await dispatch(initializeAuth());
    };
    initApp();
  }, [dispatch]);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;