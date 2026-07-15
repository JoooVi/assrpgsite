import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import heroArt from "../assets/ass.png";
import characterArt from "../assets/homepage1.png";
import campaignArt from "../assets/asssrpg.png";
import homebrewArt from "../assets/homepage2.png";
import vttArt from "../assets/05_A_igreja.jpg";
import acessoArt from "../assets/homepage3.png";
import assimilation from "../assets/assimilation.jpg";
const scrollSections = [
  {
    eyebrow: "Personagens",
    title: "Crie e acompanhe a ficha do seu personagem de Assimilação.",
    text:
      "Monte a ficha, distribua atributos, acompanhe status, inventário, vida, recursos e evolução do personagem durante a campanha.",
    image: characterArt,
    align: "left",
  },
  {
    eyebrow: "Campanhas",
    title: "Crie campanhas e reúna os personagens da mesa.",
    text:
      "Use a área de campanhas para organizar jogadores, vincular personagens, acessar a sala da mesa e preparar o conteúdo que será usado na sessão.",
    image: campaignArt,
    align: "right",
  },
  {
    eyebrow: "Homebrews",
    title: "Crie seus próprios itens, assimilações e características.",
    text:
      "Cadastre conteúdos personalizados para sua mesa, como itens, características, assimilações e regras próprias, mantendo tudo organizado dentro do site.",
    image: homebrewArt,
    align: "left",
  },
  {
    eyebrow: "Refúgios e VTT",
    title: "Prepare refúgios e jogue no VTT integrado.",
    text:
      "Abra mapas, organize cenas e tokens, use Fog of War, chat e rolagens conectados aos personagens da campanha.",
    image: vttArt,
    align: "right",
  },
];

const availableItems = [
  "Fichas de personagem",
  "Campanhas",
  "Refúgios",
  "Itens personalizados",
  "Assimilações",
  "Características",
];

const HomePage = () => {
  useEffect(() => {
    const revealNodes = document.querySelectorAll(".home-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      {
        threshold: 0.28,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    revealNodes.forEach((node) => observer.observe(node));

    return () => {
      revealNodes.forEach((node) => observer.unobserve(node));
      observer.disconnect();
    };
  }, []);

  return (
    <main className="homepage-shell">
      <section
        className="home-screen home-hero-screen content-right"
        data-section-index="0"
        style={{ "--section-art": `url(${heroArt})` }}
      >
        <div className="home-screen-effects" aria-hidden="true" />
        <div className="home-scanline" aria-hidden="true" />

        <div className="home-hero-content home-reveal is-visible">
          <p className="home-kicker">
            <span aria-hidden="true">{"// "}</span>Sistema Fan made de apoio para Assimilação RPG
          </p>

          <h1 className="homepage-title">
            NERO <span className="title-highlight">INDUSTRIES</span>
          </h1>

          <div className="homepage-description">
            <p className="status-label">
              Status do sistema: <span className="status-alert">Crítico</span>
            </p>
            <p>
              Tudo para sua mesa de Assimilação em um só lugar.
            </p>
            <p>Crie fichas de personagens, organize campanhas, monte refúgios e
              registre itens, assimilações e características personalizados para sua mesa.
            </p>
          </div>

          <div className="homepage-links">
            <Link to="/register" className="btn-home home-primary">
              Começar Agora
            </Link>

            <Link to="/login" className="btn-home home-secondary">
              Já Tenho Conta
            </Link>
          </div>
        </div>

        <div className="home-scroll-cue" aria-hidden="true">
          <span>Role para explorar</span>
          <span className="scroll-arrow" />
        </div>
      </section>

      {scrollSections.map((section, index) => (
        <section
          className={`home-screen home-story-screen ${section.align === "right" ? "content-right" : ""}`}
          key={section.title}
          data-section-index={index + 1}
          style={{ "--section-art": `url(${section.image})` }}
        >
          <div className="home-screen-effects" aria-hidden="true" />

          <article className="home-story-copy home-reveal">
            <span className="section-code">{section.eyebrow}</span>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        </section>
      ))}

      <section
        className="home-screen home-story-screen"
        data-section-index={scrollSections.length + 1}
        style={{ "--section-art": `url(${acessoArt})` }}
      >
        <div className="home-screen-effects" aria-hidden="true" />

        <article className="home-story-copy home-reveal">
          <span className="section-code">VTT Alpha disponível</span>
          <h2>Prepare a mesa e continue a sessão no mesmo lugar.</h2>
          <p>
            Crie fichas, organize campanhas e refúgios, registre conteúdos próprios
            e abra o VTT Alpha para usar mapas, tokens, rolagens e ferramentas do mestre.
          </p>

          <ul className="available-list" aria-label="Recursos disponíveis agora">
            {availableItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section
        className="home-screen home-final-screen"
        data-section-index={scrollSections.length + 2}
        style={{ "--section-art": `url(${assimilation})` }}
      >
        <div className="home-screen-effects" aria-hidden="true" />

        <div className="home-final-copy home-reveal">
          <span className="section-code">Acesso ao sistema</span>
          <h2>Comece pela ficha, organize a campanha e expanda sua mesa.</h2>
          <p>
            O site centraliza personagens, campanhas, refúgios, itens, assimilações,
            características e o VTT Alpha em um único fluxo para a mesa.
          </p>
          <div className="homepage-links">
            <Link to="/register" className="btn-home home-primary">
              Solicitar Acesso
            </Link>
            <Link to="/campaigns" className="btn-home home-secondary">
              Ver Campanhas
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
