import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAssimilations } from "../redux/slices/assimilationsSlice";
import { fetchCharacterTraits } from "../redux/slices/characteristicsSlice";
import { fetchItems } from "../redux/slices/itemsSlice";
import AssimilationsList from "../components/AssimilationsList";
import CharacteristicsList from "../components/CharacteristicsList";
import ItemsList from "../components/ItemsList";
import { dispatchToast } from "../components/notifications/ToastProvider";
import api from "../api";
import "./Homebrews.css";

const matchesSearch = (entry, search, fields) => (
  !search || fields.some((field) => String(entry?.[field] || "").toLowerCase().includes(search))
);

const Homebrews = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const { items = [] } = useSelector((state) => state.items);
  const { assimilations = [] } = useSelector((state) => state.assimilations);
  const { characterTraits = [] } = useSelector((state) => state.characteristics);

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const userItems = useMemo(() => (
    items.filter((item) => item?.createdBy === currentUser?._id || item?.userId === currentUser?._id)
  ), [currentUser?._id, items]);

  const userAssimilations = useMemo(() => (
    assimilations.filter((assimilation) => assimilation.isCustom && assimilation.createdBy === currentUser?._id)
  ), [assimilations, currentUser?._id]);

  const userTraits = useMemo(() => (
    characterTraits.filter((trait) => trait.createdBy === currentUser?._id)
  ), [characterTraits, currentUser?._id]);

  const search = searchTerm.trim().toLowerCase();
  const filteredAssimilations = userAssimilations.filter((item) => matchesSearch(item, search, ["name", "category", "description"]));
  const filteredItems = userItems.filter((item) => matchesSearch(item, search, ["name", "type", "description"]));
  const filteredTraits = userTraits.filter((trait) => matchesSearch(trait, search, ["name", "category", "description"]));

  const tabs = [
    { label: "Assimilações", count: userAssimilations.length },
    { label: "Itens", count: userItems.length },
    { label: "Características", count: userTraits.length },
  ];

  useEffect(() => {
    if (!currentUser || !token) return;
    dispatch(fetchAllAssimilations());
    dispatch(fetchItems());
    dispatch(fetchCharacterTraits());
  }, [dispatch, currentUser, token]);

  const handleShare = async (type, data) => {
    try {
      const response = await api.post("/share", { type, data });
      const shareUrl = `${window.location.origin}/shared/${response.data.id}`;

      try {
        await navigator.clipboard.writeText(shareUrl);
        dispatchToast({ message: "Link de compartilhamento copiado.", type: "success" });
      } catch {
        dispatchToast({ message: `Link gerado: ${shareUrl}`, type: "info", duration: 9000 });
      }
    } catch (error) {
      console.error("Erro ao compartilhar homebrew:", error);
      dispatchToast({ message: "Erro ao gerar link de compartilhamento.", type: "error" });
    }
  };

  return (
    <div className="homebrews-container">
      <div className="hb-panel">
        <div className="hb-hero">
          <div>
            <span className="hb-eyebrow">Criação da mesa</span>
            <h1 className="hb-title">Homebrews</h1>
            <p>Cadastre itens, assimilações e características próprias para usar nas fichas e campanhas.</p>
          </div>
          <div className="hb-summary-grid">
            <div><strong>{userAssimilations.length}</strong><span>Assimilações</span></div>
            <div><strong>{userItems.length}</strong><span>Itens</span></div>
            <div><strong>{userTraits.length}</strong><span>Características</span></div>
          </div>
        </div>

        <div className="hb-toolbar">
          <input
            type="search"
            className="nero-input hb-search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nome, tipo ou descrição..."
          />
        </div>

        <div className="hb-tabs" role="tablist" aria-label="Categorias de homebrew">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              className={`hb-tab ${activeTab === index ? "active" : ""}`}
              onClick={() => setActiveTab(index)}
              type="button"
            >
              {tab.label}
              <span>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="hb-content">
          {activeTab === 0 && (
            <AssimilationsList
              assimilationItems={filteredAssimilations}
              onShare={(data) => handleShare("assimilation", data)}
              currentUserId={currentUser?._id}
            />
          )}
          {activeTab === 1 && (
            <ItemsList
              items={filteredItems}
              onShare={(data) => handleShare("item", data)}
              currentUserId={currentUser?._id}
            />
          )}
          {activeTab === 2 && (
            <CharacteristicsList
              traits={filteredTraits}
              onShare={(data) => handleShare("trait", data)}
              currentUserId={currentUser?._id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Homebrews;
