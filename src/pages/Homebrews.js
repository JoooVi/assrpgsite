// src/pages/Homebrews.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllAssimilations,
} from "../redux/slices/assimilationsSlice";
import { fetchItems } from "../redux/slices/itemsSlice";
import { fetchHomebrews } from "../redux/slices/homebrewsSlice";
import { fetchCharacterTraits } from "../redux/slices/characteristicsSlice"; // Importação adicionada
import {
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import axios from "axios";
import CharacteristicsList from "../components/CharacteristicsList";
import AssimilationsList from "../components/AssimilationsList";
import ItemsList from "../components/ItemsList";
import Swal from "sweetalert2";

const Homebrews = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user); // Usuário atual logado
  const token = useSelector((state) => state.auth.token);

  // Adicionar valores padrão para os seletores
  const { items = [] } = useSelector((state) => state.items);
  const { assimilations = [] } = useSelector((state) => state.assimilations); // Seletores para assimilations
  const { characterTraits = [] } = useSelector((state) => state.characteristics);

  // Filtrar items apenas do usuário atual
  const userItems = items.filter(item => 
    item?.createdBy === currentUser?._id || item?.userId === currentUser?._id
  );

  // Filtrar assimilações apenas do usuário atual
  const userAssimilations = assimilations.filter(assimilation => 
    assimilation.isCustom && assimilation.createdBy === currentUser?._id
  );

  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (!currentUser || !token) return;

    dispatch(fetchAllAssimilations());
    dispatch(fetchItems());
    dispatch(fetchHomebrews());
    dispatch(fetchCharacterTraits());
  }, [dispatch, currentUser, token]);


  useEffect(() => {
    console.log('Current User Items:', {
      userId: currentUser?._id,
      assimilations: assimilations?.filter(a => a?.isCustom) || [],
      items: items || [],
      traits: characterTraits || []
    });
  }, [currentUser, assimilations, items, characterTraits]);

  // Homebrews.js (frontend)
  const handleShare = async (type, data) => {
    try {
      const response = await axios.post(
        "https://assrpgsite-be-production.up.railway.app/api/share", // Use a URL da API de produção aqui
        { type, data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
  
      const shareLink = `${window.location.origin}/shared/${response.data.id}`;
  
      Swal.fire({
        title: 'Link Gerado!',
        html: `
          <input 
            id="shareLink" 
            value="${window.location.origin}/shared/${response.data.id}" 
            readonly 
            style="width: 100%; padding: 8px; margin: 10px 0;"
          >
        `,
        confirmButtonText: 'Copiar',
        preConfirm: () => {
          const input = document.getElementById('shareLink');
          input.select();
          document.execCommand('copy');
        }
      });
  
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      Swal.fire('Erro!', 'Não foi possível compartilhar.', 'error');
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* --- ALTERADO: Aplicado estilo escuro ao Paper principal --- */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          bgcolor: '#1e1e1e', // Fundo escuro
          color: '#e0e0e0'  // Texto claro
        }}
      >
        <Typography 
          variant="h4" 
          gutterBottom 
          textAlign="center"
          sx={{ color: '#ffffff' }} // Cor do título
        >
          Meus Homebrews
        </Typography>

        {/* --- ALTERADO: Aplicado estilo escuro aos Tabs --- */}
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="inherit" // Alterado de 'primary'
          sx={{ 
            color: '#ccc', // Cor das tabs não selecionadas
            borderBottom: '1px solid #4a4a4a'
          }} 
        >
          <Tab label="Assimilações" />
          <Tab label="Itens" />
          <Tab label="Características" />
        </Tabs>

        {/* Conteúdo das Tabs */}
        <Box sx={{ mt: 3 }}>
          {selectedTab === 0 && (
            <AssimilationsList
            onShare={(assimilation) => handleShare('assimilation', assimilation)}
            assimilationItems={userAssimilations}
            currentUserId={currentUser?._id}
          />
          )}

          {selectedTab === 1 && (
            <ItemsList
            items={userItems}
            onShare={(item) => handleShare('item', item)} // ✅ Envia o objeto completo
            currentUserId={currentUser?._id}
          />
          )}

          {selectedTab === 2 && (
            <CharacteristicsList
            onShare={(trait) => handleShare('trait', trait)} // ✅ Envia o objeto completo
            currentUserId={currentUser?._id}
          />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Homebrews;