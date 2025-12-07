import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaDiscord } from "react-icons/fa";

// Importa os estilos CSS Module
import styles from "./ProfilePage.module.css";

// Importa os componentes internos
import CharacterList from "./CharacterList";
import Homebrews from "./Homebrews";

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0); // 0: Geral, 1: Chars, 2: Homebrew, 3: Campaign

  const handleLinkDiscord = () => {
    window.location.href =
      "https://assrpgsite-be-production.up.railway.app/api/auth/discord";
  };

  if (!user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando perfil do agente...</p>
      </div>
    );
  }

  // Lista de abas para facilitar renderização
  const tabs = [
    { label: "Visão Geral", id: 0, disabled: false },
    { label: "Personagens", id: 1, disabled: false },
    { label: "Homebrews", id: 2, disabled: false },
    { label: "Campanhas (Beta)", id: 3, disabled: true },
  ];

  return (
    <div className={styles.profileContainer}>
      <div className={styles.contentCard}>
        
        {/* CABEÇALHO DO PERFIL */}
        <div className={styles.profileHeader}>
          {/* Avatar */}
          <div className={styles.avatarWrapper}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
            ) : (
              <span>{user.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* Info + Botão */}
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{user.name}</h1>
            <p className={styles.profileBio}>
              {user.bio || "Este agente ainda não registrou dados biográficos no sistema."}
            </p>
          </div>

          <button 
            className={styles.editBtn} 
            onClick={() => navigate("/edit-profile")}
          >
            Editar Perfil
          </button>
        </div>

        {/* NAVEGAÇÃO (TABS) */}
        <div className={styles.tabsContainer}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.disabled}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTEÚDO DAS ABAS */}
        <div className={styles.tabPanel}>
          
          {/* Aba 0: Visão Geral */}
          {activeTab === 0 && (
            <div className={styles.contentBox}>
              <h2 className={styles.sectionTitle}>Integrações do Sistema</h2>
              
              <div className={styles.discordContainer}>
                {user.discordId ? (
                  <div className={styles.accountLinked}>
                    <FaDiscord size={24} />
                    <span>Conta do Discord vinculada e sincronizada.</span>
                  </div>
                ) : (
                  <>
                    <p style={{color: '#ccc', marginBottom:'10px'}}>
                      Vincule sua conta do Discord para login rápido e sincronização de dados.
                    </p>
                    <button
                      className={styles.discordBtn}
                      onClick={handleLinkDiscord}
                    >
                      <FaDiscord size={20} />
                      Conectar Discord
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Aba 1: Personagens */}
          {activeTab === 1 && (
            // CharacterList geralmente tem seu próprio container, não precisamos do contentBox padding aqui
            // a não ser que o CharacterList seja 'cru'.
            <CharacterList />
          )}

          {/* Aba 2: Homebrews */}
          {activeTab === 2 && (
            <Homebrews />
          )}

          {/* Aba 3: Campanhas */}
          {activeTab === 3 && (
            <div className={styles.contentBox}>
              <p style={{color:'#888', fontStyle:'italic'}}>
                Módulo de Campanhas em desenvolvimento. Acesso restrito.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;