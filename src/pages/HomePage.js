import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import heroDesktopAvif from "../assets/optimized/home/hero-desktop.avif";
import heroDesktopWebp from "../assets/optimized/home/hero-desktop.webp";
import heroMobileAvif from "../assets/optimized/home/hero-mobile.avif";
import heroMobileWebp from "../assets/optimized/home/hero-mobile.webp";
import charactersDesktopAvif from "../assets/optimized/home/characters-desktop.avif";
import charactersDesktopWebp from "../assets/optimized/home/characters-desktop.webp";
import charactersMobileAvif from "../assets/optimized/home/characters-mobile.avif";
import charactersMobileWebp from "../assets/optimized/home/characters-mobile.webp";
import campaignsDesktopAvif from "../assets/optimized/home/campaigns-desktop.avif";
import campaignsDesktopWebp from "../assets/optimized/home/campaigns-desktop.webp";
import campaignsMobileAvif from "../assets/optimized/home/campaigns-mobile.avif";
import campaignsMobileWebp from "../assets/optimized/home/campaigns-mobile.webp";
import homebrewsDesktopAvif from "../assets/optimized/home/homebrews-desktop.avif";
import homebrewsDesktopWebp from "../assets/optimized/home/homebrews-desktop.webp";
import homebrewsMobileAvif from "../assets/optimized/home/homebrews-mobile.avif";
import homebrewsMobileWebp from "../assets/optimized/home/homebrews-mobile.webp";
import vttDesktopAvif from "../assets/optimized/home/vtt-desktop.avif";
import vttDesktopWebp from "../assets/optimized/home/vtt-desktop.webp";
import vttMobileAvif from "../assets/optimized/home/vtt-mobile.avif";
import vttMobileWebp from "../assets/optimized/home/vtt-mobile.webp";
import accessDesktopAvif from "../assets/optimized/home/access-desktop.avif";
import accessDesktopWebp from "../assets/optimized/home/access-desktop.webp";
import accessMobileAvif from "../assets/optimized/home/access-mobile.avif";
import accessMobileWebp from "../assets/optimized/home/access-mobile.webp";
import finalDesktopAvif from "../assets/optimized/home/final-desktop.avif";
import finalDesktopWebp from "../assets/optimized/home/final-desktop.webp";
import finalMobileAvif from "../assets/optimized/home/final-mobile.avif";
import finalMobileWebp from "../assets/optimized/home/final-mobile.webp";

const createArt = (desktopAvif, desktopWebp, mobileAvif, mobileWebp) => ({
  desktopAvif,
  desktopWebp,
  mobileAvif,
  mobileWebp,
});

const heroArt = createArt(heroDesktopAvif, heroDesktopWebp, heroMobileAvif, heroMobileWebp);
const characterArt = createArt(charactersDesktopAvif, charactersDesktopWebp, charactersMobileAvif, charactersMobileWebp);
const campaignArt = createArt(campaignsDesktopAvif, campaignsDesktopWebp, campaignsMobileAvif, campaignsMobileWebp);
const homebrewArt = createArt(homebrewsDesktopAvif, homebrewsDesktopWebp, homebrewsMobileAvif, homebrewsMobileWebp);
const vttArt = createArt(vttDesktopAvif, vttDesktopWebp, vttMobileAvif, vttMobileWebp);
const acessoArt = createArt(accessDesktopAvif, accessDesktopWebp, accessMobileAvif, accessMobileWebp);
const assimilation = createArt(finalDesktopAvif, finalDesktopWebp, finalMobileAvif, finalMobileWebp);

const getArtStyles = ({ desktopAvif, desktopWebp, mobileAvif, mobileWebp }) => ({
  "--section-art-fallback": `url(${desktopWebp})`,
  "--section-art": `image-set(url(${desktopAvif}) type("image/avif"), url(${desktopWebp}) type("image/webp"))`,
  "--section-art-mobile-fallback": `url(${mobileWebp})`,
  "--section-art-mobile": `image-set(url(${mobileAvif}) type("image/avif"), url(${mobileWebp}) type("image/webp"))`,
});
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

const DeferredArtSection = ({ image, className, children, ...sectionProps }) => {
  const sectionRef = useRef(null);
  const [shouldLoadArt, setShouldLoadArt] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || shouldLoadArt) return undefined;

    if (!("IntersectionObserver" in window)) {
      setShouldLoadArt(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoadArt(true);
        observer.disconnect();
      },
      { rootMargin: "500px 0px" }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [shouldLoadArt]);

  return (
    <section
      {...sectionProps}
      ref={sectionRef}
      className={`${className} home-deferred-screen${shouldLoadArt ? " art-ready" : ""}`}
      style={shouldLoadArt ? getArtStyles(image) : undefined}
    >
      {children}
    </section>
  );
};

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
        style={getArtStyles(heroArt)}
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
        <DeferredArtSection
          className={`home-screen home-story-screen ${section.align === "right" ? "content-right" : ""}`}
          key={section.title}
          data-section-index={index + 1}
          image={section.image}
        >
          <div className="home-screen-effects" aria-hidden="true" />

          <article className="home-story-copy home-reveal">
            <span className="section-code">{section.eyebrow}</span>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </article>
        </DeferredArtSection>
      ))}

      <DeferredArtSection
        className="home-screen home-story-screen"
        data-section-index={scrollSections.length + 1}
        image={acessoArt}
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
      </DeferredArtSection>

      <DeferredArtSection
        className="home-screen home-final-screen"
        data-section-index={scrollSections.length + 2}
        image={assimilation}
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
      </DeferredArtSection>
    </main>
  );
};

export default HomePage;
