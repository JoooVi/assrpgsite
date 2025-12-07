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
  FaChevronUp 
} from "react-icons/fa";

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

const ItemsList = ({ items, onShare, currentUserId }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

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
    modifiers: [], // Array no estado interno
    characteristics: { points: 0, details: [] },
    isCustom: true,
  };
  const [formData, setFormData] = useState(initialForm);
  
  // Estado auxiliar para o input de texto dos modificadores (separados por vírgula)
  const [modifiersInput, setModifiersInput] = useState("");

  // --- HANDLERS ---

  const handleOpenModal = (item = null) => {
    if (item) {
      // Modo Edição
      setEditingItem(item);
      setFormData(item);
      // Converte array de modificadores para string para exibir no input
      setModifiersInput(item.modifiers ? item.modifiers.join(", ") : "");
    } else {
      // Modo Criação
      setEditingItem(null);
      setFormData(initialForm);
      setModifiersInput("");
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData(initialForm);
    setModifiersInput("");
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return alert("Nome é obrigatório.");

    // Processa a string de modificadores de volta para array
    const processedModifiers = modifiersInput.split(',').map(s => s.trim()).filter(s => s !== "");

    const payload = { 
      ...formData, 
      modifiers: processedModifiers,
      createdBy: currentUserId 
    };

    if (editingItem) {
      dispatch(updateItem({ id: editingItem._id, data: payload }));
    } else {
      dispatch(createItem(payload));
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("ATENÇÃO: Deseja excluir este Item permanentemente?")) {
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
        className="btn-nero btn-primary" 
        onClick={() => handleOpenModal()} 
        style={{ marginBottom: '20px' }}
      >
        <FaPlus /> CRIAR NOVO ITEM
      </button>

      {/* Lista de Cards */}
      <div className="hb-list">
        {(!items || items.length === 0) && (
          <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: '20px' }}>
            Nenhum item customizado encontrado.
          </p>
        )}

        {items && items.map((item) => (
          <div key={item._id} className="hb-card">
            
            {/* Header do Card */}
            <div className="hb-card-header" onClick={() => toggleExpand(item._id)}>
              <span className="hb-card-title">{item.name}</span>
              {expandedId === item._id ? (
                <FaChevronUp className="hb-card-icon open" />
              ) : (
                <FaChevronDown className="hb-card-icon" />
              )}
            </div>

            {/* Corpo do Card */}
            {expandedId === item._id && (
              <div className="hb-card-body">
                <div className="hb-info-row">
                  <span className="hb-label">TIPO:</span> 
                  <span className="hb-value">{item.type}</span>
                </div>
                
                <div className="hb-info-row">
                  <span className="hb-label">ESCASSEZ:</span> 
                  <span className="hb-value">{scarcityLevels[item.category] || item.category}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '10px 0' }}>
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
                  <span className="hb-value">{item.description}</span>
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

      {/* Modal Unificado */}
      {modalOpen && (
        <div className="nero-modal-overlay" onClick={(e) => { if (e.target.className === 'nero-modal-overlay') handleCloseModal() }}>
          <div className="nero-modal">
            <div className="nero-modal-header">
              {editingItem ? "EDITAR ITEM" : "CRIAR NOVO ITEM"}
            </div>
            
            <div className="nero-modal-body">
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
                <input 
                  type="text" 
                  className="nero-input" 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})} 
                  placeholder="Ex: Equipamento, Arma, Consumível"
                />
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

              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>SLOTS</label>
                  <input 
                    type="number" 
                    className="nero-input" 
                    value={formData.slots} 
                    onChange={(e) => setFormData({...formData, slots: Number(e.target.value)})} 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
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

            <div className="nero-modal-footer">
              <button className="btn-nero btn-secondary" onClick={handleCloseModal}>
                CANCELAR
              </button>
              <button className="btn-nero btn-primary" onClick={handleSubmit}>
                SALVAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsList;