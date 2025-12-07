import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  createAssimilation, 
  updateAssimilation, 
  deleteAssimilation 
} from "../redux/slices/assimilationsSlice";
// Ícones do React-Icons para substituir os do MUI
import { 
  FaPlus, 
  FaEdit, 
  FaShareAlt, 
  FaTrash, 
  FaChevronDown, 
  FaChevronUp 
} from "react-icons/fa";

const AssimilationsList = ({ assimilationItems, onShare, currentUserId }) => {
  const { userAssimilations } = useSelector((state) => state.assimilations);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth); // Mantido conforme original

  // --- ESTADOS ORIGINAIS (MANTIDOS) ---
  const [selectedAssimilation, setSelectedAssimilation] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  // const [isModalOpen, setIsModalOpen] = useState(false); // Mantido mas não usado visualmente no original
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const [newAssimilation, setNewAssimilation] = useState({
    name: "",
    description: "",
    category: "",
    successCost: 0,
    adaptationCost: 0,
    pressureCost: 0,
    evolutionType: "",
    isCustom: true,
  });

  // --- ESTADO ADICIONAL APENAS PARA UI (Substituir Accordion) ---
  const [expandedId, setExpandedId] = useState(null);
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // --- HANDLERS ORIGINAIS (MANTIDOS) ---

  const handleEditOpen = (assimilation) => {
    setSelectedAssimilation(assimilation);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setSelectedAssimilation(null);
    setEditOpen(false);
  };

  const handleSaveEdit = () => {
    dispatch(
      updateAssimilation({
        id: selectedAssimilation._id,
        data: selectedAssimilation,
        createdBy: user._id,
      })
    );
    handleEditClose();
  };

  const handleCreateOpen = () => setCreateDialogOpen(true);
  const handleCreateClose = () => setCreateDialogOpen(false);

  const handleCreateAssimilation = () => {
    dispatch(createAssimilation({ 
      ...newAssimilation, 
      createdBy: currentUserId,
      userId: currentUserId
    }));
    setNewAssimilation({
      name: "",
      description: "",
      category: "",
      successCost: 0,
      adaptationCost: 0,
      pressureCost: 0,
      evolutionType: "",
      isCustom: true,
    });
    handleCreateClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSelectedAssimilation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    setNewAssimilation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta Assimilação?")) {
      dispatch(deleteAssimilation(id));
    }
  };

  return (
    <div>
      {/* BOTÃO CRIAR */}
      <button
        className="btn-nero btn-primary"
        onClick={handleCreateOpen}
        style={{ marginBottom: '20px' }}
      >
        <FaPlus style={{ marginRight: '8px' }} /> Criar Nova Assimilação
      </button>

      {/* --- DIALOG DE CRIAÇÃO (Substituindo MUI Dialog por HTML/CSS Modal) --- */}
      {createDialogOpen && (
        <div className="nero-modal-overlay">
          <div className="nero-modal">
            <div className="nero-modal-header">
              Criar Nova Assimilação
            </div>
            <div className="nero-modal-body">
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  name="name"
                  className="nero-input"
                  value={newAssimilation.name}
                  onChange={handleNewChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  name="description"
                  className="nero-textarea"
                  rows="4"
                  value={newAssimilation.description}
                  onChange={handleNewChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <input
                  type="text"
                  name="category"
                  className="nero-input"
                  value={newAssimilation.category}
                  onChange={handleNewChange}
                  required
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Sucessos</label>
                  <input
                    type="number"
                    name="successCost"
                    className="nero-input"
                    value={newAssimilation.successCost}
                    onChange={handleNewChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Adaptações</label>
                  <input
                    type="number"
                    name="adaptationCost"
                    className="nero-input"
                    value={newAssimilation.adaptationCost}
                    onChange={handleNewChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Pressão</label>
                  <input
                    type="number"
                    name="pressureCost"
                    className="nero-input"
                    value={newAssimilation.pressureCost}
                    onChange={handleNewChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tipo de Evolução</label>
                <select
                  name="evolutionType"
                  className="nero-select"
                  value={newAssimilation.evolutionType}
                  onChange={handleNewChange}
                  required
                >
                  <option value="" disabled>Selecione</option>
                  <option value="copas">Copas</option>
                  <option value="ouros">Ouros</option>
                  <option value="espadas">Espadas</option>
                </select>
              </div>
            </div>
            <div className="nero-modal-footer">
              <button className="btn-nero btn-secondary" onClick={handleCreateClose}>
                Cancelar
              </button>
              <button className="btn-nero btn-primary" onClick={handleCreateAssimilation}>
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- LISTA DE ASSIMILAÇÕES (Substituindo MUI Accordion por Cards) --- */}
      <div className="hb-title-small" style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '15px', fontFamily: 'Orbitron' }}>
        Minhas Assimilações
      </div>

      <div className="hb-list">
        {userAssimilations.length > 0 ? (
          userAssimilations.map((assimilation) => (
            <div key={assimilation._id} className="hb-card">
              {/* Header do Card (Simula AccordionSummary) */}
              <div className="hb-card-header" onClick={() => toggleExpand(assimilation._id)}>
                <span className="hb-card-title">{assimilation.name}</span>
                {expandedId === assimilation._id ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              {/* Corpo do Card (Simula AccordionDetails) */}
              {expandedId === assimilation._id && (
                <div className="hb-card-body">
                  <div className="hb-info-row"><span className="hb-label">Descrição:</span> {assimilation.description}</div>
                  <div className="hb-info-row"><span className="hb-label">Categoria:</span> {assimilation.category}</div>
                  <div className="hb-info-row"><span className="hb-label">Custo em Sucessos:</span> {assimilation.successCost}</div>
                  <div className="hb-info-row"><span className="hb-label">Custo em Adaptações:</span> {assimilation.adaptationCost}</div>
                  <div className="hb-info-row"><span className="hb-label">Custo em Pressão:</span> {assimilation.pressureCost}</div>
                  <div className="hb-info-row"><span className="hb-label">Tipo de Evolução:</span> {assimilation.evolutionType}</div>
                  
                  <div className="hb-actions">
                    <button
                      className="btn-nero btn-secondary"
                      onClick={() => handleEditOpen(assimilation)}
                    >
                      <FaEdit style={{ marginRight: '5px' }} /> Editar
                    </button>
                    <button
                      className="btn-nero btn-secondary"
                      onClick={() => onShare(assimilation)}
                    >
                      <FaShareAlt style={{ marginRight: '5px' }} /> Compartilhar
                    </button>
                    <button
                      className="btn-nero btn-danger"
                      onClick={() => handleDelete(assimilation._id)}
                    >
                      <FaTrash style={{ marginRight: '5px' }} /> Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p style={{ color: '#aaa', fontStyle: 'italic' }}>Você ainda não criou nenhuma Assimilação.</p>
        )}
      </div>

      {/* --- DIALOG DE EDIÇÃO (Substituindo MUI Dialog) --- */}
      {editOpen && selectedAssimilation && (
        <div className="nero-modal-overlay">
          <div className="nero-modal">
            <div className="nero-modal-header">
              Editar Assimilação
            </div>
            <div className="nero-modal-body">
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  name="name"
                  className="nero-input"
                  value={selectedAssimilation.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  name="description"
                  className="nero-textarea"
                  rows="4"
                  value={selectedAssimilation.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <input
                  type="text"
                  name="category"
                  className="nero-input"
                  value={selectedAssimilation.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label>Sucessos</label>
                  <input
                    type="number"
                    name="successCost"
                    className="nero-input"
                    value={selectedAssimilation.successCost}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Adaptações</label>
                  <input
                    type="number"
                    name="adaptationCost"
                    className="nero-input"
                    value={selectedAssimilation.adaptationCost}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Pressão</label>
                  <input
                    type="number"
                    name="pressureCost"
                    className="nero-input"
                    value={selectedAssimilation.pressureCost}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tipo de Evolução</label>
                <select
                  name="evolutionType"
                  className="nero-select"
                  value={selectedAssimilation.evolutionType}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Selecione</option>
                  <option value="copas">Copas</option>
                  <option value="ouros">Ouros</option>
                  <option value="espadas">Espadas</option>
                </select>
              </div>
            </div>
            <div className="nero-modal-footer">
              <button className="btn-nero btn-secondary" onClick={handleEditClose}>
                Cancelar
              </button>
              <button className="btn-nero btn-primary" onClick={handleSaveEdit}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssimilationsList;