import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaCube, FaPlus, FaSearch, FaStar, FaUser } from "react-icons/fa";
import { createItem, fetchItems } from "../redux/slices/itemsSlice";
import "../pages/Homebrews.css";
import EmptyState from "./ui/EmptyState";
import PageLoader from "./ui/PageLoader";
import { getItemImageUrl, normalizeItemImageFields } from "../utils/itemImages";
import { dispatchToast } from "./notifications/ToastProvider";
import Dialog from "./ui/Dialog";

const initialItemForm = {
  name: "",
  type: "Equipamento",
  category: 3,
  description: "",
  quality: 3,
  slots: 1,
  imageUrl: "",
  iconUrl: "",
  icon: "",
  modifiers: "",
  isArtefato: false,
  isConsumable: false,
  resourceType: "",
  characteristics: { points: 0, details: [] },
  isCustom: true,
};

const ItemsModal = ({ open, handleClose, onItemSelect }) => {
  const dispatch = useDispatch();
  const { items: allItems = [], loading } = useSelector((state) => state.items);
  const user = useSelector((state) => state.auth.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("system");
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(initialItemForm);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (open) dispatch(fetchItems());
    if (!open) {
      setIsCreating(false);
      setFormData(initialItemForm);
      setImageFile(null);
      setSearchTerm("");
      setActiveTab("system");
    }
  }, [dispatch, open]);

  const filteredItems = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return allItems.filter((item) => {
      if (!search) return true;
      return [item.name, item.type, item.category, item.description]
        .some((field) => String(field || "").toLowerCase().includes(search));
    });
  }, [allItems, searchTerm]);

  const systemItems = filteredItems.filter((item) => !item.isCustom);
  const customItems = filteredItems.filter((item) => item.isCustom && String(item.createdBy || "") === String(user?._id || ""));
  const visibleItems = activeTab === "system" ? systemItems : customItems;

  if (!open) return null;

  const handleCreateAndAdd = async () => {
    if (!formData.name.trim()) {
      dispatchToast({ message: "Nome do item ? obrigat?rio.", type: "warning" });
      return;
    }

    const modifiers = formData.modifiers
      .split(",")
      .map((modifier) => modifier.trim())
      .filter(Boolean);
    const imageUrl = getItemImageUrl(formData);
    const payload = {
      ...formData,
      imageUrl,
      iconUrl: imageUrl,
      icon: imageUrl,
      modifiers,
      resourceType: formData.resourceType || null,
      isCustom: true,
    };

    let requestPayload = payload;
    if (imageFile) {
      requestPayload = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        requestPayload.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
      });
      requestPayload.append("image", imageFile);
    }

    try {
      const createdItem = await dispatch(createItem(requestPayload)).unwrap();
      onItemSelect(createdItem);
      setIsCreating(false);
      setFormData(initialItemForm);
      setImageFile(null);
      dispatchToast({ message: "Item criado e adicionado ao invent?rio.", type: "success" });
    } catch (error) {
      dispatchToast({ message: error?.message || "Falha ao criar item.", type: "error" });
    }
  };

  const renderItemCard = (item) => (
    <button key={item._id} type="button" className="hb-picker-item-card" onClick={() => onItemSelect(item)}>
      {item.isArtefato && <FaStar className="hb-picker-artifact" />}
      <span className="hb-picker-item-icon">
        {getItemImageUrl(item) ? <img src={getItemImageUrl(item)} alt="" /> : <FaCube />}
      </span>
      <strong>{item.name}</strong>
      <span>{item.type || item.category || "Item"}</span>
      <small>S:{item.slots || 1} | Q:{item.quality || 3}</small>
    </button>
  );

  return (
    <Dialog open={open} onClose={handleClose} title={isCreating ? "Criar item" : "Adicionar item"} description="Arsenal da ficha" size="large" className="hb-picker-dialog">
        <div className="hb-picker-controls">
          {!isCreating && (
            <label className="hb-picker-search">
              <FaSearch />
              <input
                className="nero-input"
                placeholder="Buscar por nome, tipo ou descrição..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
          )}

          <div className="hb-picker-tabs">
            <button
              type="button"
              className={activeTab === "system" && !isCreating ? "active" : ""}
              onClick={() => {
                setActiveTab("system");
                setIsCreating(false);
              }}
            >
              Sistema <span>{systemItems.length}</span>
            </button>
            <button
              type="button"
              className={activeTab === "custom" && !isCreating ? "active" : ""}
              onClick={() => {
                setActiveTab("custom");
                setIsCreating(false);
              }}
            >
              <FaUser /> Meus itens <span>{customItems.length}</span>
            </button>
            <button
              type="button"
              className={isCreating ? "active" : ""}
              onClick={() => {
                setActiveTab("custom");
                setIsCreating(true);
              }}
            >
              <FaPlus /> Criar item
            </button>
          </div>
        </div>

        <div className="hb-picker-scroll">
          {loading ? (
            <PageLoader title="Carregando arsenal" subtitle="Listando itens disponíveis..." compact />
          ) : isCreating ? (
            <div className="nero-modal-body" style={{ padding: 0 }}>
              <div className="hb-item-preview-row">
                <div className="hb-item-preview">
                  {imageFile || getItemImageUrl(formData) ? (
                    <img src={imageFile ? URL.createObjectURL(imageFile) : getItemImageUrl(formData)} alt="" />
                  ) : <FaCube />}
                  {formData.isArtefato && <span><FaStar /></span>}
                </div>
                <div className="form-group">
                  <label>IMAGEM DO ITEM</label>
                  <input
                    className="nero-input"
                    value={getItemImageUrl(formData)}
                    onChange={(event) => setFormData(normalizeItemImageFields({ ...formData, imageUrl: event.target.value }))}
                    placeholder="Cole uma URL de imagem..."
                  />
                  <input
                    type="file"
                    className="nero-input"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                    style={{ marginTop: 8 }}
                  />
                </div>
              </div>

              <div className="hb-form-grid hb-form-grid-two">
                <div className="form-group">
                  <label>NOME</label>
                  <input className="nero-input" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Ex: Rifle de Precisão" />
                </div>
                <div className="form-group">
                  <label>TIPO</label>
                  <input className="nero-input" value={formData.type} onChange={(event) => setFormData({ ...formData, type: event.target.value })} placeholder="Equipamento, Arma, Consumível..." />
                </div>
              </div>

              <div className="hb-form-grid hb-form-grid-two">
                <div className="form-group">
                  <label>ESCASSEZ</label>
                  <input type="number" min="0" max="6" className="nero-input" value={formData.category} onChange={(event) => setFormData({ ...formData, category: Number(event.target.value) })} />
                </div>
                <div className="form-group">
                  <label>SLOTS</label>
                  <input type="number" min="0" className="nero-input" value={formData.slots} onChange={(event) => setFormData({ ...formData, slots: Number(event.target.value) })} />
                </div>
              </div>

              <div className="form-group">
                <label>MODIFICADORES</label>
                <input className="nero-input" value={formData.modifiers} onChange={(event) => setFormData({ ...formData, modifiers: event.target.value })} placeholder="Pesado, Ruidoso, Frágil" />
              </div>

              <div className="form-group">
                <label>DESCRIÇÃO</label>
                <textarea className="nero-textarea" rows="3" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} placeholder="Detalhes sobre o item..." />
              </div>

              <label className="hb-checkbox-row">
                <input type="checkbox" checked={!!formData.isArtefato} onChange={(event) => setFormData({ ...formData, isArtefato: event.target.checked })} />
                Marcar como artefato
              </label>
              <label className="hb-checkbox-row">
                <input type="checkbox" checked={!!formData.isConsumable} onChange={(event) => setFormData({ ...formData, isConsumable: event.target.checked })} />
                Consumível
              </label>

              <div className="nero-modal-footer" style={{ paddingInline: 0 }}>
                <button className="btn-nero btn-secondary" onClick={() => setIsCreating(false)}>CANCELAR</button>
                <button className="btn-nero btn-primary" onClick={handleCreateAndAdd}>CRIAR E ADICIONAR</button>
              </div>
            </div>
          ) : (
            <div className="hb-picker-item-grid">
              {visibleItems.length > 0 ? (
                visibleItems.map(renderItemCard)
              ) : (
                <div className="hb-picker-empty">
                  <EmptyState
                    compact
                    title={activeTab === "system" ? "Nenhum item encontrado" : "Nenhum item próprio"}
                    description={activeTab === "system" ? "Tente ajustar a busca." : "Crie itens customizados por aqui ou na ?rea de Homebrews."}
                  />
                </div>
              )}
            </div>
          )}
        </div>
    </Dialog>
  );
};

export default ItemsModal;
