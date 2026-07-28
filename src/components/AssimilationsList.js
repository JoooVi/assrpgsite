import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createAssimilation,
  updateAssimilation,
  deleteAssimilation,
} from "../redux/slices/assimilationsSlice";
import {
  FaPlus,
  FaEdit,
  FaShareAlt,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { useConfirm } from "./notifications/ConfirmProvider";
import { dispatchToast } from "./notifications/ToastProvider";
import EmptyState from "./ui/EmptyState";
import SystemText from "./SystemText";
import Dialog from "./ui/Dialog";

const initialAssimilation = {
  name: "",
  description: "",
  category: "",
  successCost: 0,
  adaptationCost: 0,
  pressureCost: 0,
  evolutionType: "",
  isCustom: true,
};

const costFields = new Set(["successCost", "adaptationCost", "pressureCost"]);

const AssimilationsList = ({ assimilationItems = [], onShare, currentUserId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { confirm } = useConfirm();

  const [selectedAssimilation, setSelectedAssimilation] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAssimilation, setNewAssimilation] = useState(initialAssimilation);
  const [expandedId, setExpandedId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const validateAssimilation = (assimilation) => {
    if (!assimilation.name?.trim()) {
      dispatchToast({ type: "warning", message: "Informe o nome da assimilação." });
      return false;
    }

    if (!assimilation.description?.trim()) {
      dispatchToast({ type: "warning", message: "Informe a descrição da assimilação." });
      return false;
    }

    if (!assimilation.evolutionType) {
      dispatchToast({ type: "warning", message: "Selecione o tipo de evolução." });
      return false;
    }

    return true;
  };

  const handleEditOpen = (assimilation) => {
    setSelectedAssimilation(assimilation);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setSelectedAssimilation(null);
    setEditOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!validateAssimilation(selectedAssimilation)) return;
    if (isSaving) return;

    try {
      setIsSaving(true);
      await dispatch(
        updateAssimilation({
          id: selectedAssimilation._id,
          data: selectedAssimilation,
          createdBy: user._id,
        })
      ).unwrap();
      dispatchToast({ type: "success", message: "Assimilação atualizada." });
      handleEditClose();
    } catch (error) {
      dispatchToast({
        type: "error",
        message: error?.message || "Não foi possível atualizar a assimilação.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateOpen = () => setCreateDialogOpen(true);
  const handleCreateClose = () => setCreateDialogOpen(false);

  const handleCreateAssimilation = async () => {
    if (!validateAssimilation(newAssimilation)) return;
    if (isSaving) return;

    try {
      setIsSaving(true);
      await dispatch(
        createAssimilation({
          ...newAssimilation,
          createdBy: currentUserId,
          userId: currentUserId,
        })
      ).unwrap();
      setNewAssimilation(initialAssimilation);
      handleCreateClose();
      dispatchToast({ type: "success", message: "Assimilação criada." });
    } catch (error) {
      dispatchToast({
        type: "error",
        message: error?.message || "Não foi possível criar a assimilação.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = costFields.has(name) ? Number(value) : value;

    setSelectedAssimilation((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleNewChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = costFields.has(name) ? Number(value) : value;

    setNewAssimilation((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Excluir assimilação",
      message: "Tem certeza que deseja excluir esta assimilação?",
      tone: "danger",
      confirmLabel: "Excluir",
    });

    if (confirmed) {
      dispatch(deleteAssimilation(id));
    }
  };

  const renderAssimilationForm = (assimilation, onChange) => (
    <>
      <div className="form-group">
        <label>Nome</label>
        <input
          type="text"
          name="name"
          className="nero-input"
          value={assimilation.name}
          onChange={onChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Descrição</label>
        <textarea
          name="description"
          className="nero-textarea"
          rows="4"
          value={assimilation.description}
          onChange={onChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Categoria</label>
        <input
          type="text"
          name="category"
          className="nero-input"
          value={assimilation.category}
          onChange={onChange}
        />
      </div>

      <div className="hb-form-grid hb-form-grid-three">
        <div className="form-group">
          <label>Sucessos</label>
          <input
            type="number"
            name="successCost"
            className="nero-input"
            value={assimilation.successCost}
            onChange={onChange}
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Adaptações</label>
          <input
            type="number"
            name="adaptationCost"
            className="nero-input"
            value={assimilation.adaptationCost}
            onChange={onChange}
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Pressão</label>
          <input
            type="number"
            name="pressureCost"
            className="nero-input"
            value={assimilation.pressureCost}
            onChange={onChange}
            min="0"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Tipo de Evolução</label>
        <select
          name="evolutionType"
          className="nero-select"
          value={assimilation.evolutionType}
          onChange={onChange}
          required
        >
          <option value="" disabled>
            Selecione
          </option>
          <option value="copas">Copas</option>
          <option value="ouros">Ouros</option>
          <option value="espadas">Espadas</option>
          <option value="paus">Paus</option>
        </select>
      </div>
    </>
  );

  return (
    <div>
      <button
        className="btn-nero btn-primary hb-create-btn"
        onClick={handleCreateOpen}
      >
        <FaPlus /> Criar Nova Assimilação
      </button>

      <Dialog
        open={createDialogOpen}
        onClose={handleCreateClose}
        title="Criar nova assimilação"
        size="medium"
        actions={<><button type="button" className="btn-nero btn-secondary" onClick={handleCreateClose} disabled={isSaving}>Cancelar</button><button type="button" className="btn-nero btn-primary" onClick={handleCreateAssimilation} disabled={isSaving}>{isSaving ? "Salvando..." : "Criar"}</button></>}
      >
            <div className="nero-modal-body">
              {renderAssimilationForm(newAssimilation, handleNewChange)}
            </div>
      </Dialog>

      <div className="hb-title-small">Minhas Assimilações</div>

      <div className="hb-list">
        {assimilationItems.length > 0 ? (
          assimilationItems.map((assimilation) => (
            <div key={assimilation._id} className="hb-card">
              <div className="hb-card-header" onClick={() => toggleExpand(assimilation._id)}>
                <div>
                  <span className="hb-card-title">{assimilation.name}</span>
                  <span className="hb-card-subtitle">
                    {assimilation.category || "Sem categoria"} •{" "}
                    {assimilation.evolutionType || "Sem evolução"}
                  </span>
                </div>
                {expandedId === assimilation._id ? <FaChevronUp /> : <FaChevronDown />}
              </div>

              {expandedId === assimilation._id && (
                <div className="hb-card-body">
                  <div className="hb-assimilation-metrics">
                    <div>
                      <span>Sucessos</span>
                      <strong>{assimilation.successCost ?? 0}</strong>
                    </div>
                    <div>
                      <span>Adaptações</span>
                      <strong>{assimilation.adaptationCost ?? 0}</strong>
                    </div>
                    <div>
                      <span>Pressão</span>
                      <strong>{assimilation.pressureCost ?? 0}</strong>
                    </div>
                    <div>
                      <span>Evolução</span>
                      <strong>{assimilation.evolutionType || "-"}</strong>
                    </div>
                  </div>

                  <div className="hb-info-row">
                    <span className="hb-label">Descrição:</span>
                    <span className="hb-value">
                      <SystemText text={assimilation.description || "Sem descrição registrada."} />
                    </span>
                  </div>

                  <div className="hb-actions">
                    <button
                      className="btn-nero btn-secondary"
                      onClick={() => handleEditOpen(assimilation)}
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      className="btn-nero btn-secondary"
                      onClick={() => onShare(assimilation)}
                    >
                      <FaShareAlt /> Compartilhar
                    </button>
                    <button
                      className="btn-nero btn-danger"
                      onClick={() => handleDelete(assimilation._id)}
                    >
                      <FaTrash /> Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <EmptyState
            compact
            title="Nenhuma assimilação"
            description="Crie poderes, mutações ou evoluções próprias para sua campanha."
          />
        )}
      </div>

      <Dialog
        open={editOpen && !!selectedAssimilation}
        onClose={handleEditClose}
        title="Editar assimilação"
        size="medium"
        actions={<><button type="button" className="btn-nero btn-secondary" onClick={handleEditClose} disabled={isSaving}>Cancelar</button><button type="button" className="btn-nero btn-primary" onClick={handleSaveEdit} disabled={isSaving}>{isSaving ? "Salvando..." : "Salvar"}</button></>}
      >
        {selectedAssimilation && (
            <div className="nero-modal-body">
              {renderAssimilationForm(selectedAssimilation, handleChange)}
            </div>
        )}
      </Dialog>
    </div>
  );
};

export default AssimilationsList;
