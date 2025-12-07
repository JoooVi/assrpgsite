/* Homebrews.js */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAssimilations } from "../redux/slices/assimilationsSlice";
import { fetchItems } from "../redux/slices/itemsSlice";
import { fetchHomebrews } from "../redux/slices/homebrewsSlice";
import { fetchCharacterTraits } from "../redux/slices/characteristicsSlice";
import axios from "axios";
import CharacteristicsList from "../components/CharacteristicsList";
import AssimilationsList from "../components/AssimilationsList";
import ItemsList from "../components/ItemsList";
import Swal from "sweetalert2";
import "./Homebrews.css"; 

const Homebrews = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const { items = [] } = useSelector((state) => state.items);
  const { assimilations = [] } = useSelector((state) => state.assimilations);
  const { characterTraits = [] } = useSelector((state) => state.characteristics);

  const userItems = items.filter(item => item?.createdBy === currentUser?._id || item?.userId === currentUser?._id);
  const userAssimilations = assimilations.filter(a => a.isCustom && a.createdBy === currentUser?._id);
  const userTraits = characterTraits.filter(t => t.createdBy === currentUser?._id); 

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!currentUser || !token) return;
    dispatch(fetchAllAssimilations());
    dispatch(fetchItems());
    dispatch(fetchHomebrews());
    dispatch(fetchCharacterTraits());
  }, [dispatch, currentUser, token]);

  const handleShare = async (type, data) => {
    try {
      const response = await axios.post(
        "https://assrpgsite-be-production.up.railway.app/api/share",
        { type, data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      Swal.fire({
        title: 'ACESSO LIBERADO',
        text: 'Copie o código de transmissão abaixo:',
        input: 'text',
        inputValue: `${window.location.origin}/shared/${response.data.id}`,
        background: '#111',
        color: '#fff',
        confirmButtonColor: '#8a1c18',
      });
    } catch (error) {
      console.error("Erro:", error);
      Swal.fire({title: 'ERRO NA TRANSMISSÃO', icon: 'error', background: '#111', color: '#fff'});
    }
  };

  return (
    <div className="homebrews-container">
      {/* --- AQUI ESTÁ A MUDANÇA: O WRAPPER AGORA É UM PAINEL --- */}
      <div className="hb-panel">
        
        <h1 className="hb-title">HOMEBREWS</h1>

        {/* Abas Táticas */}
        <div className="hb-tabs">
          <button 
            className={`hb-tab ${activeTab === 0 ? 'active' : ''}`} 
            onClick={() => setActiveTab(0)}
          >
            ASSIMILAÇÕES
          </button>
          <button 
            className={`hb-tab ${activeTab === 1 ? 'active' : ''}`} 
            onClick={() => setActiveTab(1)}
          >
            ITENS
          </button>
          <button 
            className={`hb-tab ${activeTab === 2 ? 'active' : ''}`} 
            onClick={() => setActiveTab(2)}
          >
            CARACTERÍSTICAS
          </button>
        </div>

        {/* Conteúdo */}
        <div className="hb-content">
          {activeTab === 0 && (
            <AssimilationsList
              assimilationItems={userAssimilations}
              onShare={(data) => handleShare('assimilation', data)}
              currentUserId={currentUser?._id}
            />
          )}
          {activeTab === 1 && (
            <ItemsList
              items={userItems}
              onShare={(data) => handleShare('item', data)}
              currentUserId={currentUser?._id}
            />
          )}
          {activeTab === 2 && (
            <CharacteristicsList
              traits={userTraits} 
              onShare={(data) => handleShare('trait', data)}
              currentUserId={currentUser?._id}
            />
          )}
        </div>
      
      </div> {/* Fim do hb-panel */}
    </div>
  );
};

export default Homebrews;