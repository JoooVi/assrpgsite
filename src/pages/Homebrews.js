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
import ErrorState from "../components/ui/ErrorState";
import SkeletonState from "../components/ui/SkeletonState";
import { getPublicErrorMessage } from "../utils/httpErrors";
import "./Homebrews.css";

const matchesSearch = (entry, search, fields) => (
  !search || fields.some((field) => String(entry?.[field] || "").toLowerCase().includes(search))
);

const getOwnerId = (entry) => entry?.createdBy?._id || entry?.createdBy || entry?.userId?._id || entry?.userId;

const mergeUniqueById = (...collections) => Array.from(
  collections.flat().reduce((entries, entry) => {
    const key = String(entry?._id || "");
    if (key) entries.set(key, entry);
    return entries;
  }, new Map()).values()
);

const Homebrews = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const { items = [], loading: itemsLoading, error: itemsError } = useSelector((state) => state.items);
  const {
    allAssimilations = [],
    userAssimilations: ownedAssimilations = [],
    loading: assimilationsLoading,
    error: assimilationsError,
  } = useSelector((state) => state.assimilations);
  const { characterTraits = [], loading: traitsLoading, error: traitsError } = useSelector((state) => state.characteristics);

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  const userItems = useMemo(() => (
    items.filter((item) => String(getOwnerId(item) || "") === String(currentUser?._id || ""))
  ), [currentUser?._id, items]);

  const assimilationCatalog = useMemo(
    () => mergeUniqueById(allAssimilations, ownedAssimilations),
    [allAssimilations, ownedAssimilations]
  );

  const userAssimilations = useMemo(() => (
    assimilationCatalog.filter((assimilation) => (
      assimilation.isCustom !== false
      && String(getOwnerId(assimilation) || "") === String(currentUser?._id || "")
    ))
  ), [assimilationCatalog, currentUser?._id]);

  const userTraits = useMemo(() => (
    characterTraits.filter((trait) => String(getOwnerId(trait) || "") === String(currentUser?._id || ""))
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

  const loadHomebrews = React.useCallback(async () => {
    if (!currentUser || !token) return Promise.resolve();
    try {
      await Promise.all([
        dispatch(fetchAllAssimilations()),
        dispatch(fetchItems()),
        dispatch(fetchCharacterTraits()),
      ]);
    } finally {
      setHasLoaded(true);
    }
  }, [currentUser, dispatch, token]);

  useEffect(() => {
    loadHomebrews();
  }, [loadHomebrews]);

  const loading = itemsLoading || assimilationsLoading || traitsLoading;
  const loadError = itemsError || assimilationsError || traitsError;

  if (!hasLoaded && loading && !items.length && !assimilationCatalog.length && !characterTraits.length) {
    return <SkeletonState variant="cards" count={3} label="Carregando homebrews" />;
  }

  if (hasLoaded && loadError && !items.length && !assimilationCatalog.length && !characterTraits.length) {
    return (
      <div className="homebrews-container">
        <ErrorState
          title="Não foi possível carregar os homebrews"
          description="Seus conteúdos não foram alterados. Tente sincronizar novamente."
          onRetry={loadHomebrews}
        />
      </div>
    );
  }

  const handleShare = async (type, data) => {
    try {
      const response = await api.post("/share", { type, sourceId: data?._id });
      const shareUrl = `${window.location.origin}/shared/${response.data.id}`;

      try {
        await navigator.clipboard.writeText(shareUrl);
        dispatchToast({ message: "Link de compartilhamento copiado.", type: "success" });
      } catch {
        dispatchToast({ message: `Link gerado: ${shareUrl}`, type: "info", duration: 9000 });
      }
    } catch (error) {
      console.error("Erro ao compartilhar homebrew:", error);
      dispatchToast({ message: getPublicErrorMessage(error, "Erro ao gerar link de compartilhamento."), type: "error" });
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
