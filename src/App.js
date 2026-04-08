// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { initializeAuth } from "./redux/slices/authSlice";
import axios from "axios";
import store from "./redux/store";
import { logout } from "./redux/slices/authSlice";
// Componentes de Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import KofiButton from "./components/KofiButton";
import PageTransition from "./components/PageTransition";
import SessionExpiredModal from "./components/SessionExpiredModal";
import { AnimatePresence } from 'framer-motion';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react";

// PÃƒÆ’Ã‚Â¡ginas
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
import AuthCallbackPage from "./pages/AuthCallbackPage";
import EditProfilePage from "./pages/EditProfilePage";
// Hooks customizados
import useTokenRefresh from "./hooks/useTokenRefresh";


// --- IMPORTAÃƒÆ’Ã¢â‚¬Â¡ÃƒÆ’Ã¢â‚¬Â¢ES DE CAMPANHA ---
import CampaignLobby from "./components/CampaignLobby";
import CampaignSheet from "./pages/CampaignSheet";
import RefugeDashboard from "./pages/RefugeDashboard"; 
import VTT from './pages/VTT';

import "./App.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import '@fontsource/material-icons';


const AppContent = () => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const isPortraitRoute = location.pathname.startsWith('/character-portrait/');
  const isEmbedMode = new URLSearchParams(location.search).get('embed') === '1';
  const isVttRoute = location.pathname.startsWith('/campanha/');

  axios.interceptors.response.use(
  (response) => response, // Se a resposta for OK, nÃƒÆ’Ã‚Â£o faz nada
  (error) => {
    if (error.response && error.response.status === 401) {
      // OPA! O token expirou ou ÃƒÆ’Ã‚Â© invÃƒÆ’Ã‚Â¡lido
      console.warn("Token expirado. Deslogando...");
      
      // 1. Limpa o Redux
      store.dispatch(logout()); 
      
      // 2. Limpa o localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // 3. Manda para o login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response, // Se a resposta for OK, nÃƒÆ’Ã‚Â£o faz nada
  (error) => {
    if (error.response && error.response.status === 401) {
      // OPA! O token expirou ou ÃƒÆ’Ã‚Â© invÃƒÆ’Ã‚Â¡lido
      console.warn("Token expirado. Deslogando...");
      
      // 1. Limpa o Redux
      store.dispatch(logout()); 
      
      // 2. Limpa o localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // 3. Manda para o login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SessionExpiredModal />
      {!isPortraitRoute && !isEmbedMode && !isVttRoute && <Navbar />}
      <main style={{ flexGrow: 1 }}>
        <SpeedInsights/>
        <Analytics />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* --- Rotas PÃƒÆ’Ã‚Âºblicas --- */}
            <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
            <Route path="/reset-password/:token" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* --- Rota de Homebrew Compartilhado (PÃƒÆ’Ã‚Âºblica) --- */}
            <Route path="/shared/:id" element={<SharedHomebrew />} />
            
            {/* --- Rota de Retrato (PÃƒÆ’Ã‚Âºblica, sem layout padrÃƒÆ’Ã‚Â£o) --- */}
            <Route path="/character-portrait/:id" element={<CharacterPortraitPage />} />
            
            {/* --- Rotas Protegidas --- */}
            <Route path="/create" element={isAuthenticated ? <PageTransition><CharacterForm /></PageTransition> : <PageTransition><LoginPage /></PageTransition>} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/edit-profile" element={isAuthenticated ? <PageTransition><EditProfilePage /></PageTransition> : <PageTransition><LoginPage /></PageTransition>} />
            <Route path="/characters" element={isAuthenticated ? <PageTransition><CharacterList /></PageTransition> : <PageTransition><LoginPage /></PageTransition>} />
            <Route path="/character-sheet/:id" element={isAuthenticated ? (isEmbedMode ? <CharacterSheet /> : <PageTransition><CharacterSheet /></PageTransition>) : <PageTransition><LoginPage /></PageTransition>} />
            <Route path="/homebrews" element={isAuthenticated ? <PageTransition><Homebrews /></PageTransition> : <PageTransition><LoginPage /></PageTransition>} />
            <Route path="/campaigns" element={isAuthenticated ? <PageTransition><CampaignList /></PageTransition> : <PageTransition><LoginPage /></PageTransition>} />
            <Route path="/create-campaign" element={isAuthenticated ? <PageTransition><CampaignForm /></PageTransition> : <PageTransition><LoginPage /></PageTransition>} />
            
            {/* --- ROTAS DA CAMPANHA --- */}
            <Route
              path="/campaign-lobby/:id"
              element={isAuthenticated ? <PageTransition><CampaignLobby /></PageTransition> : <PageTransition><LoginPage /></PageTransition>}
            />
            <Route
              path="/campaign-sheet/:id"
              element={isAuthenticated ? <PageTransition><CampaignSheet /></PageTransition> : <PageTransition><LoginPage /></PageTransition>}
            />
            <Route
              path="/campaign/:id/refuge"
              element={isAuthenticated ? <PageTransition><RefugeDashboard /></PageTransition> : <PageTransition><LoginPage /></PageTransition>}
            />
            <Route
              path="/campanha/:id/vtt"
              element={isAuthenticated ? <VTT /> : <LoginPage />}
            />

          </Routes>
        </AnimatePresence>
      </main>
      {!isPortraitRoute && !isEmbedMode && !isVttRoute && <Footer />}
      {!isPortraitRoute && !isEmbedMode && !isVttRoute && <KofiButton />}
    </div>
  );
};

function App() {
  const dispatch = useDispatch();
  
  // ✅ Iniciar renovação proativa de token
  useTokenRefresh();

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