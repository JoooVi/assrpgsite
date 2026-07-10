// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
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

// Páginas
import HomePage from "./pages/HomePage";
import AuthAccessPage from "./pages/AuthAccessPage";
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


// --- IMPORTAÇÕES DE CAMPANHA ---
import CampaignLobby from "./components/CampaignLobby";
import CampaignSheet from "./pages/CampaignSheet";
import RefugeLobby from "./pages/RefugeLobby";
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
  const isAuthRoute = [
    '/login',
    '/register',
    '/forgot-password',
    '/auth/callback',
  ].includes(location.pathname) || location.pathname.startsWith('/reset-password/');
  const shouldShowLayout = !isPortraitRoute && !isEmbedMode && !isVttRoute && !isAuthRoute;
  const routeTransitionKey = ['/login', '/register'].includes(location.pathname)
    ? 'auth-access'
    : location.pathname;

  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          store.dispatch(logout());
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.dispatchEvent(
            new CustomEvent('sessionExpired', {
              detail: { reason: 'Sua sessao expirou. Faca login novamente.' }
            })
          );
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptorId);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SessionExpiredModal />
      {shouldShowLayout && <Navbar />}
      <main style={{ flexGrow: 1 }}>
        <SpeedInsights/>
        <Analytics />
        <AnimatePresence mode="wait">
          <Routes location={location} key={routeTransitionKey}>
            {/* --- Rotas PÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºblicas --- */}
            <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
            <Route path="/login" element={<PageTransition><AuthAccessPage /></PageTransition>} />
            <Route path="/register" element={<PageTransition><AuthAccessPage /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPasswordPage /></PageTransition>} />
            <Route path="/reset-password/:token" element={<PageTransition><ResetPasswordPage /></PageTransition>} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* --- Rota de Homebrew Compartilhado (PÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºblica) --- */}
            <Route path="/shared/:id" element={<PageTransition><SharedHomebrew /></PageTransition>} />
            
            {/* --- Rota de Retrato (PÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âºblica, sem layout padrÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â£o) --- */}
            <Route path="/character-portrait/:id" element={<CharacterPortraitPage />} />
            
            {/* --- Rotas Protegidas --- */}
            <Route path="/create" element={isAuthenticated ? <PageTransition><CharacterForm /></PageTransition> : <Navigate to="/login" replace />} />
            <Route path="/perfil" element={isAuthenticated ? <PageTransition><ProfilePage /></PageTransition> : <Navigate to="/login" replace />} />
            <Route path="/edit-profile" element={isAuthenticated ? <PageTransition><EditProfilePage /></PageTransition> : <Navigate to="/login" replace />} />
            <Route path="/characters" element={isAuthenticated ? <PageTransition><CharacterList /></PageTransition> : <Navigate to="/login" replace />} />
            <Route path="/character-sheet/:id" element={isAuthenticated ? (isEmbedMode ? <CharacterSheet /> : <PageTransition><CharacterSheet /></PageTransition>) : <Navigate to="/login" replace />} />
            <Route path="/homebrews" element={isAuthenticated ? <PageTransition><Homebrews /></PageTransition> : <Navigate to="/login" replace />} />
            <Route path="/campaigns" element={isAuthenticated ? <PageTransition><CampaignList /></PageTransition> : <Navigate to="/login" replace />} />
            <Route path="/create-campaign" element={isAuthenticated ? <PageTransition><CampaignForm /></PageTransition> : <Navigate to="/login" replace />} />
            
            {/* --- ROTAS DA CAMPANHA --- */}
            <Route
              path="/campaign-lobby/:id"
              element={isAuthenticated ? <PageTransition><CampaignLobby /></PageTransition> : <Navigate to="/login" replace />}
            />
            <Route
              path="/campaign-sheet/:id"
              element={isAuthenticated ? <PageTransition><CampaignSheet /></PageTransition> : <Navigate to="/login" replace />}
            />
            <Route
              path="/campaign/:id/refuges"
              element={isAuthenticated ? <PageTransition><RefugeLobby /></PageTransition> : <Navigate to="/login" replace />}
            />
            <Route
              path="/campaign/:id/refuge/:refugeId"
              element={isAuthenticated ? <PageTransition><RefugeDashboard /></PageTransition> : <Navigate to="/login" replace />}
            />
            <Route
              path="/campaign/:id/refuge"
              element={isAuthenticated ? <Navigate to={`/campaign/${location.pathname.split('/')[2]}/refuges`} replace /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/campanha/:id/vtt"
              element={isAuthenticated ? <VTT /> : <Navigate to="/login" replace />}
            />

          </Routes>
        </AnimatePresence>
      </main>
      {shouldShowLayout && <Footer />}
      {shouldShowLayout && <KofiButton />}
    </div>
  );
};

function App() {
  const dispatch = useDispatch();
  
  // Iniciar renovações proativas de token
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
