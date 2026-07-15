import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHome } from "react-icons/fa";
import "./NotFoundPage.css";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <main className="not-found-page">
      <section className="not-found-panel" aria-labelledby="not-found-title">
        <p className="not-found-code">ERRO 404</p>
        <h1 id="not-found-title">Página não encontrada</h1>
        <p>
          Este endereço não existe ou foi movido. Volte à tela anterior ou retorne
          ao início do Nero.
        </p>
        <div className="not-found-actions">
          <button type="button" className="btn-nero btn-secondary" onClick={() => navigate(-1)}>
            <FaArrowLeft aria-hidden="true" /> Voltar
          </button>
          <Link className="btn-nero btn-primary" to="/">
            <FaHome aria-hidden="true" /> Ir para o início
          </Link>
        </div>
      </section>
    </main>
  );
};

export default NotFoundPage;
