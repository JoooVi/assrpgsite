import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaDiscord } from "react-icons/fa";
import PageLoader from "../components/ui/PageLoader";
import { API_URL } from "../config/apiConfig";
import styles from "./ProfilePage.module.css";

const tabs = [
  { label: "Visão Geral", id: 0, disabled: false },
  { label: "Personagens", id: 1, disabled: false },
  { label: "Homebrews", id: 2, disabled: false },
  { label: "Campanhas (Beta)", id: 3, disabled: true },
];

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const handleLinkDiscord = () => {
    window.location.href = `${API_URL}/auth/discord`;
  };

  if (!user) {
    return (
      <PageLoader title="Carregando perfil" subtitle="Recuperando dados do agente..." />
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.contentCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrapper}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
            ) : (
              <span>{user.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div className={styles.profileInfo}>
            <p className={styles.profileKicker}>Registro de agente</p>
            <h1 className={styles.profileName}>{user.name}</h1>
            <p className={styles.profileBio}>
              {user.bio || "Este agente ainda não registrou dados biográficos no sistema."}
            </p>
          </div>

          <button className={styles.editBtn} onClick={() => navigate("/edit-profile")}>
            Editar Perfil
          </button>
        </div>

        <div className={styles.tabsContainer}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ""}`}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.disabled}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.tabPanel}>
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
                    <p className={styles.helperText}>
                      Vincule sua conta do Discord para login rápido e sincronização de dados.
                    </p>
                    <button className={styles.discordBtn} onClick={handleLinkDiscord}>
                      <FaDiscord size={20} />
                      Conectar Discord
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className={styles.contentBox}>
              <h2 className={styles.sectionTitle}>Personagens</h2>
              <p className={styles.helperText}>
                Gerencie seus agentes, fichas e retratos pela tela dedicada de personagens.
              </p>
              <button className={styles.primaryActionBtn} onClick={() => navigate("/characters")}>
                Abrir personagens
              </button>
            </div>
          )}

          {activeTab === 2 && (
            <div className={styles.contentBox}>
              <h2 className={styles.sectionTitle}>Homebrews</h2>
              <p className={styles.helperText}>
                Crie e organize itens, assimilações e características personalizadas para sua mesa.
              </p>
              <button className={styles.primaryActionBtn} onClick={() => navigate("/homebrews")}>
                Abrir homebrews
              </button>
            </div>
          )}

          {activeTab === 3 && (
            <div className={styles.contentBox}>
              <p className={styles.helperText}>Módulo de Campanhas em desenvolvimento. Acesso restrito.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
