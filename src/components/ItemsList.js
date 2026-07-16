/* ItemsList.js */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchItems, 
  createItem, 
  updateItem, 
  deleteItem 
} from "../redux/slices/itemsSlice";
import { 
  FaPlus, 
  FaEdit, 
  FaShareAlt, 
  FaTrash, 
  FaChevronDown, 
  FaChevronUp,
  FaCube,
  FaStar
} from "react-icons/fa";
import { useConfirm } from "./notifications/ConfirmProvider";
import SystemText from "./SystemText";
import { dispatchToast } from "./notifications/ToastProvider";
import EmptyState from "./ui/EmptyState";
import Dialog from "./ui/Dialog";
import { getItemImageUrl, normalizeItemImageFields } from "../utils/itemImages";

// Mapeamento de categorias (Escassez)
const scarcityLevels = {
  0: 'Abundante',
  1: 'Pedra',
  2: 'Comum',
  3: 'Incomum',
  4: 'Atípico',
  5: 'Raro',
  6: 'Quase Extinto'
};

const itemTypes = ["Equipamento", "Arma", "Consumível", "Utilidade", "Proteção", "Ferramenta", "Artefato"];

const ItemsList = ({ items, onShare, currentUserId }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const { confirm } = useConfirm();

  // Garante que os itens estejam carregados ao montar o componente
  useEffect(() => {
    if (token && user) {
      dispatch(fetchItems());
    }
  }, [dispatch, token, user]);

  // --- ESTADOS ---
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const initialForm = {
    name: "",
    type: "Equipamento",
    category: 1, // Escassez
    description: "",
    quality: 3,
    slots: 1,
    imageUrl: "",
    iconUrl: "",
    icon: "",
    isArtefato: false,
    modifiers: [], // Array no estado interno
    characteristics: { points: 0, details: [] },
    isCustom: true,
  };
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado auxiliar para o input de texto dos modificadores (separados por vírgula)
  const [modifiersInput, setModifiersInput] = useState("");

  // --- HANDLERS ---

  const handleOpenModal = (item = null) => {
    if (item) {
      // Modo Edição
      setEditingItem(item);
      setFormData(normalizeItemImageFields(item));
      // Converte array de modificadores para string para exibir no input
      setModifiersInput(item.modifiers ? item.modifiers.join(", ") : "");
      setImageFile(null);
    } else {
      // Modo Criação
      setEditingItem(null);
      setFormData(initialForm);
      setModifiersInput("");
      setImageFile(null);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData(initialForm);
    setModifiersInput("");
    setImageFile(null);
  };

  const buildItemPayload = () => {
    const processedModifiers = modifiersInput.split(',').map(s => s.trim()).filter(s => s !== "");
    const normalizedImage = getItemImageUrl(formData);
    const payload = {
      ...formData,
      imageUrl: normalizedImage,
      iconUrl: normalizedImage,
      icon: normalizedImage,
      modifiers: processedModifiers,
      createdBy: currentUserId
    };

    if (!imageFile) return payload;

    const multipart = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      multipart.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
    });
    multipart.append("image", imageFile);
    return multipart;
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    if (!formData.name.trim()) {
      dispatchToast({ message: "Nome é obrigatório.", type: "warning" });
      return;
    }

    const payload = buildItemPayload();
    try {
      setIsSaving(true);
      if (editingItem) {
        await dispatch(updateItem({ id: editingItem._id, data: payload })).unwrap();
        dispatchToast({ message: "Item atualizado.", type: "success" });
      } else {
        await dispatch(createItem(payload)).unwrap();
        dispatchToast({ message: "Item criado.", type: "success" });
      }
      handleCloseModal();
    } catch (error) {
      dispatchToast({
        message: error?.message || "Não foi possível salvar o item.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Excluir item",
      message: "Deseja excluir este item permanentemente?",
      tone: "danger",
      confirmLabel: "Excluir",
    });
    if (confirmed) {
      dispatch(deleteItem(id));
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      {/* Botão Criar */}
      <button 
        className="btn-nero btn-primary hb-create-btn" 
        onClick={() => handleOpenModal()}
      >
        <FaPlus /> CRIAR NOVO ITEM
      </button>

      {/* Lista de Cards */}
      <div className="hb-list">
        {(!items || items.length === 0) && (
          <EmptyState
            compact
            title="Nenhum item customizado"
            description="Crie itens próprios para ampliar o arsenal da sua mesa."
          />
        )}

        {items && items.map((item) => (
          <div key={item._id} className="hb-card">
            
            {/* Header do Card */}
            <div className="hb-card-header" onClick={() => toggleExpand(item._id)}>
              <div className="hb-item-heading">
                <div className="hb-item-icon">
                  {getItemImageUrl(item) ? <img src={getItemImageUrl(item)} alt="" /> : <FaCube />}
                  {item.isArtefato && <span className="hb-item-artifact"><FaStar /></span>}
                </div>
                <div>
                  <span className="hb-card-title">{item.name}</span>
                  <span className="hb-card-subtitle">{item.type || "Item"} · {scarcityLevels[item.category] || item.category}</span>
                </div>
              </div>
              {expandedId === item._id ? (
                <FaChevronUp className="hb-card-icon open" />
              ) : (
                <FaChevronDown className="hb-card-icon" />
              )}
            </div>

            {/* Corpo do Card */}
            {expandedId === item._id && (
              <div className="hb-card-body">
                <div className="hb-item-metrics">
                  <div><span>Qualidade</span><strong>{item.quality ?? 3}</strong></div>
                  <div><span>Slots</span><strong>{item.slots ?? 1}</strong></div>
                  <div><span>Caract.</span><strong>{item.characteristics?.points || 0}</strong></div>
                </div>

                <div className="hb-info-row">
                  <span className="hb-label">TIPO:</span> 
                  <span className="hb-value">{item.type}</span>
                </div>
                
                <div className="hb-info-row">
                  <span className="hb-label">ESCASSEZ:</span> 
                  <span className="hb-value">{scarcityLevels[item.category] || item.category}</span>
                </div>

                <div className="hb-inline-grid hb-inline-grid-two">
                    <div className="hb-info-row">
                        <span className="hb-label">QUALIDADE:</span> <span className="hb-value">{item.quality}</span>
                    </div>
                    <div className="hb-info-row">
                        <span className="hb-label">SLOTS:</span> <span className="hb-value">{item.slots}</span>
                    </div>
                </div>

                <div className="hb-info-row">
                  <span className="hb-label">MODIFICADORES:</span> 
                  <span className="hb-value">{item.modifiers && item.modifiers.length > 0 ? item.modifiers.join(', ') : '-'}</span>
                </div>

                <div className="hb-info-row">
                  <span className="hb-label">PONTOS CARACT.:</span> 
                  <span className="hb-value">{item.characteristics?.points || 0}</span>
                </div>

                <div className="hb-info-row">
                  <span className="hb-label">DESCRIÇÃO:</span> 
                  <span className="hb-value"><SystemText text={item.description} /></span>
                </div>

                <div className="hb-actions">
                  <button className="btn-nero btn-secondary" onClick={() => handleOpenModal(item)}>
                    <FaEdit /> EDITAR
                  </button>
                  <button className="btn-nero btn-secondary" onClick={() => onShare(item)}>
                    <FaShareAlt /> COMPARTILHAR
                  </button>
                  <button className="btn-nero btn-danger" onClick={() => handleDelete(item._id)}>
                    <FaTrash /> EXCLUIR
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "Editar item" : "Criar novo item"}
        description={editingItem ? "Atualize os dados do item." : "Cadastre um item para usar nas fichas e campanhas."}
        size="large"
        className="hb-item-editor-dialog"
        actions={<><button type="button" className="btn-nero btn-secondary" onClick={handleCloseModal} disabled={isSaving}>Cancelar</button><button type="button" className="btn-nero btn-primary" onClick={handleSubmit} disabled={isSaving}>{isSaving ? "Salvando..." : "Salvar item"}</button></>}
      >
            <div className="hb-item-editor-form">
              <div className="form-group">
                <label>NOME</label>
                <input 
                  type="text" 
                  className="nero-input" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ex: Rifle de Precisão"
                />
              </div>

              <div className="form-group">
                <label>TIPO</label>
                <select
                  className="nero-select"
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})} 
                >
                  {itemTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div className="hb-item-preview-row">
                <div className="hb-item-preview">
                  {imageFile || getItemImageUrl(formData) ? (
                    <img src={imageFile ? URL.createObjectURL(imageFile) : getItemImageUrl(formData)} alt="" />
                  ) : <FaCube />}
                  {formData.isArtefato && <span><FaStar /></span>}
                </div>
                <div className="form-group">
                  <label>ÍCONE / IMAGEM DO ITEM</label>
                  <input
                    type="text"
                    className="nero-input"
                    value={getItemImageUrl(formData)}
                    onChange={(e) => setFormData(normalizeItemImageFields({...formData, imageUrl: e.target.value}))}
                    placeholder="Cole uma URL de imagem..."
                  />
                  <input
                    type="file"
                    className="nero-input"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    style={{ marginTop: 8 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>CATEGORIA (ESCASSEZ)</label>
                <select 
                  className="nero-select" 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: Number(e.target.value)})}
                >
                  {Object.entries(scarcityLevels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="hb-form-grid hb-form-grid-two">
                <div className="form-group">
                  <label>SLOTS</label>
                  <input 
                    type="number" 
                    className="nero-input" 
                    value={formData.slots} 
                    onChange={(e) => setFormData({...formData, slots: Number(e.target.value)})} 
                  />
                </div>
                <div className="form-group">
                  <label>QUALIDADE</label>
                  <input 
                    type="number" 
                    className="nero-input" 
                    value={formData.quality} 
                    onChange={(e) => setFormData({...formData, quality: Number(e.target.value)})} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>MODIFICADORES (SEPARAR POR VÍRGULA)</label>
                <input 
                  type="text" 
                  className="nero-input" 
                  value={modifiersInput} 
                  onChange={(e) => setModifiersInput(e.target.value)} 
                  placeholder="Ex: Pesado, Ruidoso, Frágil"
                />
              </div>

              <div className="form-group">
                <label>PONTOS DE CARACTERÍSTICA (OPCIONAL)</label>
                <input 
                  type="number" 
                  className="nero-input" 
                  value={formData.characteristics?.points || 0} 
                  onChange={(e) => setFormData({
                      ...formData, 
                      characteristics: { ...formData.characteristics, points: Number(e.target.value) }
                  })} 
                />
              </div>

              <label className="hb-checkbox-row">
                <input
                  type="checkbox"
                  checked={!!formData.isArtefato}
                  onChange={(e) => setFormData({...formData, isArtefato: e.target.checked})}
                />
                Marcar como artefato
              </label>

              <div className="form-group">
                <label>DESCRIÇÃO</label>
                <textarea 
                  className="nero-textarea" 
                  rows="3" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Detalhes sobre o item..."
                />
              </div>
            </div>
      </Dialog>
    </div>
  );
};

export default ItemsList;
