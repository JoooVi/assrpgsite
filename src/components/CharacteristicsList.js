import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCharacteristic,
  updateCharacteristic,
  deleteCharacteristic,
  fetchCharacterTraits,
} from "../redux/slices/characteristicsSlice";
import {
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaPlus,
  FaShareAlt,
  FaTrash,
} from "react-icons/fa";
import { useConfirm } from "./notifications/ConfirmProvider";
import { dispatchToast } from "./notifications/ToastProvider";
import EmptyState from "./ui/EmptyState";
import SystemText from "./SystemText";
import Dialog from "./ui/Dialog";

const initialForm = {
  name: "",
  description: "",
  pointsCost: 0,
  category: "Físico",
  isCustom: true,
};

const characteristicCategories = ["Físico", "Mental", "Social", "Habilidade"];

const CharacteristicsList = ({ traits, onShare }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const { characterTraits: allTraits = [] } = useSelector((state) => state.characteristics);
  const { confirm } = useConfirm();

  const userTraits = allTraits.filter((trait) => trait.createdBy === user?._id);
  const displayTraits = traits || userTraits;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (token && user) {
      dispatch(fetchCharacterTraits());
    }
  }, [dispatch, token, user]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    setFormData(item || initialForm);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormData(initialForm);
  };

  const updateFormField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "pointsCost" ? Number(value) : value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      dispatchToast({ message: "Nome é obrigatório.", type: "warning" });
      return false;
    }

    if (!formData.description.trim()) {
      dispatchToast({ message: "Descrição é obrigatória.", type: "warning" });
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = {
      ...formData,
      createdBy: user?._id,
    };

    if (editingItem) {
      dispatch(updateCharacteristic({ id: editingItem._id, data: payload }));
    } else {
      dispatch(createCharacteristic(payload));
    }
    handleCloseModal();
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "Excluir característica",
      message: "Deseja excluir esta característica permanentemente?",
      tone: "danger",
      confirmLabel: "Excluir",
    });

    if (confirmed) {
      dispatch(deleteCharacteristic(id));
    }
  };

  return (
    <div>
      <button
        className="btn-nero btn-primary hb-create-btn"
        onClick={() => handleOpenModal()}
      >
        <FaPlus /> Criar Nova Característica
      </button>

      <div className="hb-list">
        {(!displayTraits || displayTraits.length === 0) && (
          <EmptyState
            compact
            title="Nenhuma característica"
            description="Crie vantagens, marcas ou complicações para personalizar os agentes."
          />
        )}

        {displayTraits?.map((trait) => (
          <div key={trait._id} className="hb-card">
            <div className="hb-card-header" onClick={() => toggleExpand(trait._id)}>
              <div>
                <span className="hb-card-title">{trait.name}</span>
                <span className="hb-card-subtitle">
                  {trait.category || "Sem categoria"} • {trait.pointsCost ?? 0} pontos
                </span>
              </div>
              {expandedId === trait._id ? (
                <FaChevronUp className="hb-card-icon open" />
              ) : (
                <FaChevronDown className="hb-card-icon" />
              )}
            </div>

            {expandedId === trait._id && (
              <div className="hb-card-body">
                <div className="hb-trait-summary">
                  <div>
                    <span>Categoria</span>
                    <strong>{trait.category || "Sem categoria"}</strong>
                  </div>
                  <div>
                    <span>Custo</span>
                    <strong>{trait.pointsCost ?? 0} pontos</strong>
                  </div>
                </div>

                <div className="hb-info-row">
                  <span className="hb-label">Descrição:</span>
                  <span className="hb-value">
                    <SystemText text={trait.description || "Sem descrição registrada."} />
                  </span>
                </div>

                <div className="hb-actions">
                  <button
                    className="btn-nero btn-secondary"
                    onClick={() => handleOpenModal(trait)}
                  >
                    <FaEdit /> Editar
                  </button>
                  <button
                    className="btn-nero btn-secondary"
                    onClick={() => onShare(trait)}
                  >
                    <FaShareAlt /> Compartilhar
                  </button>
                  <button
                    className="btn-nero btn-danger"
                    onClick={() => handleDelete(trait._id)}
                  >
                    <FaTrash /> Excluir
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
        title={editingItem ? "Editar característica" : "Nova característica"}
        size="medium"
        actions={<><button type="button" className="btn-nero btn-secondary" onClick={handleCloseModal}>Cancelar</button><button type="button" className="btn-nero btn-primary" onClick={handleSubmit}>Salvar</button></>}
      >
            <div className="nero-modal-body">
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  className="nero-input"
                  value={formData.name}
                  onChange={(event) => updateFormField("name", event.target.value)}
                  placeholder="Ex: Ambidestria"
                />
              </div>

              <div className="hb-form-grid hb-form-grid-two">
                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    className="nero-select"
                    value={formData.category}
                    onChange={(event) => updateFormField("category", event.target.value)}
                  >
                    {characteristicCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Custo (pontos)</label>
                  <input
                    type="number"
                    className="nero-input"
                    value={formData.pointsCost}
                    onChange={(event) => updateFormField("pointsCost", event.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  className="nero-textarea"
                  rows="4"
                  value={formData.description}
                  onChange={(event) => updateFormField("description", event.target.value)}
                  placeholder="Descreva as regras desta característica..."
                />
              </div>
            </div>
      </Dialog>
    </div>
  );
};

export default CharacteristicsList;
