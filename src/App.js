import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { initializeAuth } from "./redux/slices/authSlice";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CharacterForm from "./pages/CharacterForm";
import CharacterList from "./pages/CharacterList";
import CharacterSheet from "./pages/CharacterSheet";
import SharedHomebrew from "./pages/SharedHomebrew";
import Homebrews from "./pages/Homebrews"; // Importe o componente Homebrews
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Footer from "./components/Footer";
import "./App.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import KofiButton from "./components/KofiButton";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const initApp = async () => {
      await dispatch(initializeAuth());
      if (isAuthenticated && token && user) {
        console.log("Autenticação restaurada:", {
          token: !!token,
          userId: user?._id,
        });
      }
    };

    initApp();
  }, [dispatch]);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/create"
          element={isAuthenticated ? <CharacterForm /> : <LoginPage />}
        />
        <Route
          path="/characters"
          element={isAuthenticated ? <CharacterList /> : <LoginPage />}
        />
        <Route
          path="/character-sheet/:id"
          element={isAuthenticated ? <CharacterSheet /> : <LoginPage />}
        />
        <Route
          path="/homebrews"
          element={isAuthenticated ? <Homebrews /> : <LoginPage />} // Adicione a rota Homebrews
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/shared/:id" element={<SharedHomebrew />} />
      </Routes>
      <Footer />
      <KofiButton />
    </Router>
  );
}

export default App;
