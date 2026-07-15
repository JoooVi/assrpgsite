import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaPlus } from "react-icons/fa";
import api from "../api";
import CharacterCard from "../components/characters/CharacterCard";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import SkeletonState from "../components/ui/SkeletonState";
import { useConfirm } from "../components/notifications/ConfirmProvider";
import { dispatchToast } from "../components/notifications/ToastProvider";
import "./CharacterList.css";

const CharacterList = () => {
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const { confirm } = useConfirm();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [operationError, setOperationError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchCharacters = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const response = await api.get("/characters");
      setCharacters(Array.isArray(response.data) ? response.data : []);
    } catch (requestError) {
      if (requestError.response?.status === 404) setCharacters([]);
      else setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => { fetchCharacters(); }, [fetchCharacters]);

  const handleDelete = async (character) => {
    if (deletingId) return;
    const confirmed = await confirm({
      title: "Excluir personagem?",
      message: `A ficha de “${character.name}” será removida permanentemente e não poderá ser desfeita.`,
      tone: "danger",
      confirmLabel: "Excluir personagem",
    });
    if (!confirmed) return;

    setDeletingId(character._id);
    setOperationError("");
    try {
      await api.delete(`/characters/${character._id}`);
      setCharacters((current) => current.filter((item) => item._id !== character._id));
      dispatchToast({ message: "Personagem excluído.", type: "success" });
    } catch {
      setOperationError("A ficha não foi removida. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <SkeletonState variant="cards" count={4} label="Carregando personagens" />;
  if (error) return <div className="characterListContainer"><ErrorState title="Não foi possível carregar os personagens" description="Verifique sua conexão e tente novamente." onRetry={fetchCharacters} /></div>;

  return (
    <div className="characterListContainer">
      <header className="listHeader">
        <h1>AGENTES <span>ATIVOS</span></h1>
        <Link to="/create" className="character-create-button"><FaPlus /> Criar personagem</Link>
      </header>

      {operationError && <ErrorState compact title="Não foi possível excluir o personagem" description={operationError} action={<button type="button" className="btn-nero" onClick={() => setOperationError("")}>Fechar aviso</button>} />}

      {!characters.length ? (
        <EmptyState title="Nenhum agente" description="Crie sua primeira ficha para participar de campanhas e usar o VTT." primaryAction={<Link className="character-create-button" to="/create">Criar personagem</Link>} />
      ) : (
        <div className="characterGrid">
          {characters.map((character) => <CharacterCard key={character._id} character={character} onDelete={handleDelete} deleting={deletingId === character._id} />)}
        </div>
      )}
    </div>
  );
};

export default CharacterList;
