// src/App.js
import React, { lazy, Suspense, useEffect } from "react";
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
import PageLoader from "./components/ui/PageLoader";
import FireflyBackground from "./components/FireflyBackground";
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react";
import { getPerformanceRoute } from "./utils/performanceRoute";

// Páginas
import HomePage from "./pages/HomePage";
// Hooks customizados
import useTokenRefresh from "./hooks/useTokenRefresh";

import "./App.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";


// --- IMPORTAÇÕES DE CAMPANHA ---
const CharacterForm = lazy(() => import('./pages/CharacterForm'));
const AuthAccessPage = lazy(() => import('./pages/AuthAccessPage'));
const SharedHomebrew = lazy(() => import('./pages/SharedHomebrew'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const CharacterPortraitPage = lazy(() => import('./pages/CharacterPortraitPage'));
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const CharacterList = lazy(() => import('./pages/CharacterList'));
const CharacterSheet = lazy(() => import('./pages/CharacterSheet'));
const Homebrews = lazy(() => import('./pages/Homebrews'));
const CampaignList = lazy(() => import('./pages/CampaignList'));
const CampaignForm = lazy(() => import('./pages/CampaignForm'));
const CampaignLobby = lazy(() => import('./components/CampaignLobby'));
const CampaignSheet = lazy(() => import(/* webpackChunkName: "campaign-sheet" */ './pages/CampaignSheet'));
const RefugeLobby = lazy(() => import('./pages/RefugeLobby'));
const RefugeDashboard = lazy(() => import('./pages/RefugeDashboard'));
const VTT = lazy(() => import(/* webpackChunkName: "vtt-runtime" */ './pages/VTT'));


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
  const performanceRoute = getPerformanceRoute(location.pathname);
  const requireAuth = (element) => isAuthenticated
    ? element
    : <Navigate to="/login" replace state={{ from: location }} />;

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
      {shouldShowLayout && <FireflyBackground />}
      {shouldShowLayout && <Navbar />}
      <main style={{ flexGrow: 1 }}>
        <SpeedInsights route={performanceRoute} />
        <Analytics />
        <Suspense fallback={<PageLoader title="Carregando módulo" subtitle="Preparando a interface..." fullScreen />}>
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
            <Route path="/create" element={requireAuth(<PageTransition><CharacterForm /></PageTransition>)} />
            <Route path="/perfil" element={requireAuth(<PageTransition><ProfilePage /></PageTransition>)} />
            <Route path="/edit-profile" element={requireAuth(<PageTransition><EditProfilePage /></PageTransition>)} />
            <Route path="/characters" element={requireAuth(<PageTransition><CharacterList /></PageTransition>)} />
            <Route path="/character-sheet/:id" element={requireAuth(isEmbedMode ? <CharacterSheet /> : <PageTransition><CharacterSheet /></PageTransition>)} />
            <Route path="/homebrews" element={requireAuth(<PageTransition><Homebrews /></PageTransition>)} />
            <Route path="/campaigns" element={requireAuth(<PageTransition><CampaignList /></PageTransition>)} />
            <Route path="/create-campaign" element={requireAuth(<PageTransition><CampaignForm /></PageTransition>)} />
            
            {/* --- ROTAS DA CAMPANHA --- */}
            <Route
              path="/campaign-lobby/:id"
              element={requireAuth(<PageTransition><CampaignLobby /></PageTransition>)}
            />
            <Route
              path="/campaign-sheet/:id"
              element={requireAuth(<PageTransition><CampaignSheet /></PageTransition>)}
            />
            <Route
              path="/campaign/:id/refuges"
              element={requireAuth(<PageTransition><RefugeLobby /></PageTransition>)}
            />
            <Route
              path="/campaign/:id/refuge/:refugeId"
              element={requireAuth(<PageTransition><RefugeDashboard /></PageTransition>)}
            />
            <Route
              path="/campaign/:id/refuge"
              element={requireAuth(<Navigate to={`/campaign/${location.pathname.split('/')[2]}/refuges`} replace />)}
            />
            <Route
              path="/campanha/:id/vtt"
              element={requireAuth(<VTT />)}
            />

            <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />

          </Routes>
        </Suspense>
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
