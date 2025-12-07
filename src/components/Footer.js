import React from "react";
import styles from "./Footer.module.css";
import x from "../assets/twitter.png";
import discord from "../assets/discord.png";
import twitch from "../assets/twitch.png";

const Footer = () => {
  return (
    <div className={styles.footerContainer}>
      <div className={styles.footerWrapper}>
        {/* Links principais */}
        <div className={styles.footerLinksContainer}>
          <div className={styles.footerLinksRow}>
            <a href="/sobre-o-assimilacao" className={styles.links}>
              Sobre o RPG de Assimilação
            </a>
            <a
              href="https://www.catarse.me/assimilacaorpg"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.links}
            >
              Apoie Assimilação
            </a>
          </div>
          <div className={styles.footerLinksRow}>
            <a href="/creditos-e-contato" className={styles.links}>
              Entre em Contato
            </a>
            <a href="/politica-de-privacidade" className={styles.links}>
              Política de Privacidade
            </a>
          </div>
          <div className={styles.footerLinksRow}>
            <a
              href="https://x.com/JoooVi_1"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.links}
            >
              Powered by JoooVi.
            </a>
          </div>
        </div>

        {/* Ícones sociais */}
        <div className={styles.iconLinksContainer}>
          
          {/* Link Wiki (Usando Emoji 📖) */}
          <a
            href="https://assimilacao.fandom.com/pt-br/wiki/Assimila%C3%A7%C3%A3o_Wiki"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            title="Wiki do Assimilação RPG"
            style={{ textDecoration: 'none' }} // Remove sublinhado padrão
          >
            {/* O span recebe a classe icon para ganhar a animação de hover/grayscale */}
            <span 
              className={styles.icon} 
              style={{ 
                fontSize: '24px', 
                lineHeight: '1', 
                display: 'inline-block',
                cursor: 'pointer' 
              }}
              role="img" 
              aria-label="Wiki"
            >
              📖
            </span>
          </a>

          <a
            href="https://discord.gg/tzrezdyzhs"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            <img className={styles.icon} src={discord} alt="Discord" />
          </a>
          <a
            href="https://x.com/AssimilacaoRPG"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            <img className={styles.icon} src={x} alt="Twitter" />
          </a>
          <a
            href="https://twitch.tv/rakin"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            <img className={styles.icon} src={twitch} alt="Twitch" />
          </a>
        </div>

        {/* Divisória */}
        <div className={styles.divider}></div>

        {/* Texto de direitos autorais */}
        <div className={styles.footerTextContainer}>
          <div className={styles.footerText}>
            Assimilação RPG é um sistema criado por @Rakin e @ViniciusLAUzito.
            &copy; Todos os direitos reservados.
          </div>
          <div className={styles.footerText}>
            Este site é conteúdo de fã não oficial e segue as diretrizes de
            conteúdo permitido. Não aprovado ou endossado por terceiros.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;