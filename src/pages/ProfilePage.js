import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Componentes do Material-UI
import {
  Button,
  Typography,
  Paper,
  Box,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
} from "@mui/material";
import { FaDiscord } from "react-icons/fa";

// 1. IMPORTAR SEUS COMPONENTES DE PÁGINA
import CharacterList from "./CharacterList";
import Homebrews from "./Homebrews";

import "./ProfilePage.css";

// Componente para o painel de cada aba (sem alterações)
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        // Removido o padding 'p:3' daqui para que os componentes filhos controlem seu próprio espaçamento
        <Box sx={{ pt: 3 }}>{children}</Box>
      )}
    </div>
  );
}

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleLinkDiscord = () => {
    window.location.href =
      "https://assrpgsite-be-production.up.railway.app/api/auth/discord";
  };

  if (!user) {
    return (
      <Box className="profile-loading-container">
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Carregando perfil...</Typography>
      </Box>
    );
  }

  return (
    <Box className="profile-page-container">
      <Paper className="profile-paper" elevation={3}>
        <Box className="profile-header">
          <Avatar
            src={user.avatar || null}
            sx={{ width: 100, height: 100, border: "2px solid #fff" }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box className="profile-header-info">
            <Typography variant="h4" component="h1" className="profile-name">
              {user.name}
            </Typography>
            <Typography variant="body2" className="profile-bio">
              {user.bio || "Este agente ainda não adicionou uma biografia."}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={() => navigate("/edit-profile")}
            className="edit-profile-button"
          >
            Editar Perfil
          </Button>
        </Box>

        {/* Abas de Navegação (removido o 'disabled') */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            centered
            variant="fullWidth"
          >
            <Tab label="Visão Geral" />
            <Tab label="Personagens" />
            <Tab label="Homebrews" />
            <Tab label="Campanhas" disabled />{" "}
            {/* Deixei campanhas desabilitado por enquanto */}
          </Tabs>
        </Box>

        {/* 2. CONTEÚDO DAS ABAS AGORA COM SEUS COMPONENTES REAIS */}
        <TabPanel value={tab} index={0}>
          <Box sx={{ p: 3 }}>
            {" "}
            {/* Adicionado padding interno para esta aba específica */}
            <Typography variant="h6" gutterBottom>
              Contas Vinculadas
            </Typography>
            {user.discordId ? (
              <Box className="account-linked success">
                <FaDiscord />
                <Typography>Conta do Discord vinculada!</Typography>
              </Box>
            ) : (
              <Box className="account-not-linked">
                <Typography sx={{ mb: 2 }}>
                  Vincule sua conta do Discord para login rápido.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<FaDiscord />}
                  onClick={handleLinkDiscord}
                  sx={{
                    backgroundColor: "#5865F2",
                    "&:hover": { backgroundColor: "#4752C4" },
                  }}
                >
                  Vincular Conta do Discord
                </Button>
              </Box>
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <CharacterList />
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Homebrews />
        </TabPanel>

        <TabPanel value={tab} index={3}>
          <Typography sx={{ p: 3 }}>
            A lista de campanhas do usuário aparecerá aqui no futuro.
          </Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
