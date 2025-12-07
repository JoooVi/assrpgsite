/* CharacteristicsList.js */
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCharacteristic,
  updateCharacteristic,
  deleteCharacteristic,
  fetchCharacterTraits,
} from "../redux/slices/characteristicsSlice";
import { 
  FaPlus, 
  FaEdit, 
  FaShareAlt, 
  FaTrash, 
  FaChevronDown, 
  FaChevronUp 
} from "react-icons/fa";

const CharacteristicsList = ({ onShare }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  
  // --- VÍNCULO COM O REDUX ---
  // Buscando todas as características e filtrando pelo usuário logado
  const { characterTraits: allTraits = [] } = useSelector((state) => state.characteristics);
  const userTraits = allTraits.filter(trait => trait.createdBy === user?._id);

  // Garante o carregamento dos dados
  useEffect(() => {
    if (token && user) {
      dispatch(fetchCharacterTraits());
    }
  }, [dispatch, token, user]);

  // --- ESTADOS LOCAIS ---
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Estado do Formulário
  const initialForm = {
    name: "",
    description: "",
    pointsCost: 0,
    category: "Físico", // Valor padrão
    isCustom: true,
  };
  const [formData, setFormData] = useState(initialForm);

  // --- HANDLERS ---

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData(initialForm);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData(initialForm);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return alert("Nome é obrigatório.");

    const payload = { 
      ...formData, 
      createdBy: user?._id 
    };

    if (editingItem) {
      dispatch(updateCharacteristic({ id: editingItem._id, data: payload }));
    } else {
      dispatch(createCharacteristic(payload));
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("ATENÇÃO: Deseja excluir esta Característica permanentemente?")) {
      dispatch(deleteCharacteristic(id));
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
        <FaPlus /> CRIAR NOVA CARACTERÍSTICA
      </button>

      {/* Lista de Cards */}
      <div className="hb-list">
        {(!userTraits || userTraits.length === 0) && (
          <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: '20px' }}>
            Nenhuma característica criada.
          </p>
        )}

        {userTraits && userTraits.map((trait) => (
          <div key={trait._id} className="hb-card">
            
            {/* Cabeçalho do Card */}
            <div className="hb-card-header" onClick={() => toggleExpand(trait._id)}>
              <span className="hb-card-title">{trait.name}</span>
              {expandedId === trait._id ? (
                <FaChevronUp className="hb-card-icon open" />
              ) : (
                <FaChevronDown className="hb-card-icon" />
              )}
            </div>

            {/* Corpo do Card */}
            {expandedId === trait._id && (
              <div className="hb-card-body">
                <div className="hb-info-row">
                  <span className="hb-label">CATEGORIA:</span> 
                  <span className="hb-value">{trait.category}</span>
                </div>
                
                <div className="hb-info-row">
                  <span className="hb-label">CUSTO:</span> 
                  <span className="hb-value">{trait.pointsCost} Pontos</span>
                </div>
                
                <div className="hb-info-row">
                  <span className="hb-label">DESCRIÇÃO:</span> 
                  <span className="hb-value">{trait.description}</span>
                </div>

                <div className="hb-actions">
                  <button className="btn-nero btn-secondary" onClick={() => handleOpenModal(trait)}>
                    <FaEdit /> EDITAR
                  </button>
                  <button className="btn-nero btn-secondary" onClick={() => onShare(trait)}>
                    <FaShareAlt /> COMPARTILHAR
                  </button>
                  <button className="btn-nero btn-danger" onClick={() => handleDelete(trait._id)}>
                    <FaTrash /> EXCLUIR
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Unificado (HTML Puro) */}
      {modalOpen && (
        <div className="nero-modal-overlay" onClick={(e) => { if (e.target.className === 'nero-modal-overlay') handleCloseModal() }}>
          <div className="nero-modal">
            <div className="nero-modal-header">
              {editingItem ? "EDITAR CARACTERÍSTICA" : "NOVA CARACTERÍSTICA"}
            </div>
            
            <div className="nero-modal-body">
              <div className="form-group">
                <label>NOME</label>
                <input 
                  type="text" 
                  className="nero-input" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="Ex: Ambidestria"
                />
              </div>

              <div className="form-group">
                <label>CATEGORIA</label>
                <select 
                  className="nero-select" 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Físico">Físico</option>
                  <option value="Mental">Mental</option>
                  <option value="Social">Social</option>
                  <option value="Habilidade">Habilidade</option>
                </select>
              </div>

              <div className="form-group">
                <label>CUSTO (PONTOS)</label>
                <input 
                  type="number" 
                  className="nero-input" 
                  value={formData.pointsCost} 
                  onChange={(e) => setFormData({...formData, pointsCost: Number(e.target.value)})} 
                />
              </div>

              <div className="form-group">
                <label>DESCRIÇÃO</label>
                <textarea 
                  className="nero-textarea" 
                  rows="4" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  placeholder="Descreva as regras desta característica..."
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

export default CharacteristicsList;