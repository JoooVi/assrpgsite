import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CharacterForm from "./pages/CharacterForm";
import CharacterList from "./pages/CharacterList";
import CharacterSheet from "./pages/CharacterSheet";
import Footer from "./components/Footer";
import "./App.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

function App() {
  const user = useSelector((state) => state.auth.user);

  console.log("Estado do usuário:", user);

  return (
    <Router>
      <Navbar />
      <Routes className="">
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/create"
          element={user ? <CharacterForm /> : <LoginPage />}
        />
        <Route
          path="/characters"
          element={user ? <CharacterList /> : <LoginPage />}
        />
        <Route
          path="/character-sheet/:id"
          element={user ? <CharacterSheet /> : <LoginPage />}
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;