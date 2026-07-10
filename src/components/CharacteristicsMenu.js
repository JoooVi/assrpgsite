import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";

const availableCharacteristics = {
  "-1": [
    { name: "Frágil", cost: -1, description: "Precisa de uma [Sucesso] a menos para baixar um nível de qualidade." },
    { name: "Improvisado", cost: -1, description: "Criado com partes reaproveitadas. Testes com esse item têm um dado a menos." },
  ],
  "1": [
    { name: "Ágil", cost: 1, description: "Em um teste de ataque armado, substitui Potência por Reação." },
    { name: "Discreto", cost: 1, description: "Um item menor. Não ocupa espaço de inventário." },
  ],
  "2": [
    { name: "Eficiente", cost: 2, description: "Em um teste com este item, você pode trocar 1 dado por outro dado permitido." },
    { name: "Durável", cost: 2, description: "Precisa de uma [Sucesso] adicional para perder um nível de qualidade." },
  ],
  "3": [
    { name: "Espaçoso", cost: 3, description: "Vestes, bolsas ou mochilas que aumentam espaços de inventário em +2." },
    { name: "Adrenalina", cost: 3, description: "Começa com seis usos. Cada uso aumenta 6 dados até o próximo repouso." },
    { name: "Armadura", cost: 3, description: "Ao sofrer dano, você pode fazer até três usos por cena." },
  ],
  "4": [
    { name: "Explosivo", cost: 4, description: "Item pensado para ser detonado. Todo item Explosivo também possui Uso Único." },
    { name: "Inflamável", cost: 4, description: "Gera fogo em escala perigosa. Alvos atingidos sofrem 3 de dano de queimadura." },
    { name: "Medicinal", cost: 4, description: "Cancela resultado negativo em teste de Tratamento Médico conforme usos." },
  ],
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 13000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  background: "radial-gradient(circle at 50% 20%, rgba(138, 28, 24, 0.22), rgba(0, 0, 0, 0.84) 48%, rgba(0, 0, 0, 0.92))",
  backdropFilter: "blur(8px)",
  boxSizing: "border-box",
};

const modalStyle = {
  width: "min(820px, 96vw)",
  maxHeight: "88vh",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  color: "#e0e0e0",
  background: "linear-gradient(180deg, rgba(18,18,18,0.98), rgba(7,7,7,0.99))",
  border: "1px solid rgba(255,255,255,0.12)",
  borderTop: "4px solid #8a1c18",
  boxShadow: "0 24px 70px rgba(0,0,0,0.9)",
  fontFamily: '"Roboto Condensed", sans-serif',
};

const CharacteristicsMenu = ({ open, item, onClose, onChange }) => {
  const [characteristics, setCharacteristics] = useState([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (item && item.characteristics) {
      setCharacteristics(item.characteristics.details || []);
      setPoints(item.characteristics.points || 0);
    } else {
      setCharacteristics([]);
      setPoints(0);
    }
  }, [item]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const emitChange = (nextDetails, nextPoints) => {
    onChange({
      ...item,
      characteristics: {
        details: nextDetails,
        points: nextPoints,
      },
    });
  };

  const handleAddCharacteristic = (characteristic) => {
    if (points < characteristic.cost) return;
    const nextCharacteristic = { ...characteristic, marked: false };
    const nextDetails = [...characteristics, nextCharacteristic];
    const nextPoints = points - characteristic.cost;
    setCharacteristics(nextDetails);
    setPoints(nextPoints);
    emitChange(nextDetails, nextPoints);
  };

  const handleRemoveCharacteristic = (index) => {
    const removedCharacteristic = characteristics[index];
    const nextDetails = characteristics.filter((_, currentIndex) => currentIndex !== index);
    const nextPoints = points + removedCharacteristic.cost;
    setCharacteristics(nextDetails);
    setPoints(nextPoints);
    emitChange(nextDetails, nextPoints);
  };

  return (
    <div style={overlayStyle} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div style={modalStyle}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid #333", background: "linear-gradient(90deg, rgba(138,28,24,0.18), #151515 44%)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ display: "block", color: "#ff5555", fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Características do item
            </span>
            <span style={{ color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Editar características</span>
          </div>
          <button type="button" aria-label="Fechar características" onClick={onClose} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", fontSize: "1.5rem" }}>
            ×
          </button>
        </div>

        <div style={{ padding: 20, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 18, padding: 14, border: "1px solid #333", background: "#101010" }}>
            <div>
              <div style={{ color: "#888", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.12em" }}>Pontos disponíveis</div>
              <div style={{ color: "#fff", fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>{points}</div>
            </div>
            <div style={{ color: "#aaa", fontSize: "0.86rem", maxWidth: 420 }}>
              Características negativas devolvem pontos. Características positivas consomem pontos disponíveis.
            </div>
          </div>

          <section style={{ marginBottom: 24 }}>
            <h3 style={{ margin: "0 0 10px", color: "#fff", textTransform: "uppercase", fontSize: "1rem" }}>Aplicadas</h3>
            {characteristics.length > 0 ? (
              <div style={{ display: "grid", gap: 8 }}>
                {characteristics.map((characteristic, index) => (
                  <div key={`${characteristic.name}-${index}`} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", padding: 12, border: "1px solid #333", background: "#151515" }}>
                    <div>
                      <strong style={{ color: "#fff" }}>{characteristic.name}</strong>
                      <span style={{ marginLeft: 8, color: "#ff5555", fontSize: "0.82rem" }}>({characteristic.cost})</span>
                      <p style={{ margin: "4px 0 0", color: "#aaa", fontSize: "0.88rem", lineHeight: 1.4 }}>{characteristic.description}</p>
                    </div>
                    <button type="button" onClick={() => handleRemoveCharacteristic(index)} style={{ display: "grid", placeItems: "center", width: 34, height: 34, border: "1px solid #500", background: "rgba(138,28,24,0.14)", color: "#ff6666", cursor: "pointer" }}>
                      <DeleteIcon fontSize="small" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 14, border: "1px dashed #333", color: "#777", background: "#101010" }}>
                Nenhuma característica aplicada.
              </div>
            )}
          </section>

          <section>
            <h3 style={{ margin: "0 0 10px", color: "#fff", textTransform: "uppercase", fontSize: "1rem" }}>Adicionar</h3>
            {Object.keys(availableCharacteristics).map((category) => (
              <div key={category} style={{ marginBottom: 18 }}>
                <div style={{ color: "#ff5555", borderBottom: "1px solid #333", paddingBottom: 6, marginBottom: 8, fontWeight: 800, textTransform: "uppercase" }}>
                  Custo {category}
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {availableCharacteristics[category].map((characteristic) => {
                    const canAdd = points >= characteristic.cost;
                    return (
                      <div key={characteristic.name} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", padding: 12, border: "1px solid #333", background: "#111" }}>
                        <div>
                          <strong style={{ color: "#fff" }}>{characteristic.name}</strong>
                          <p style={{ margin: "4px 0 0", color: "#aaa", fontSize: "0.88rem", lineHeight: 1.4 }}>{characteristic.description}</p>
                        </div>
                        <button
                          type="button"
                          disabled={!canAdd}
                          onClick={() => handleAddCharacteristic(characteristic)}
                          style={{
                            minWidth: 38,
                            height: 34,
                            border: `1px solid ${canAdd ? "#2e7d32" : "#333"}`,
                            background: canAdd ? "rgba(46,125,50,0.16)" : "#151515",
                            color: canAdd ? "#8fff9a" : "#555",
                            cursor: canAdd ? "pointer" : "not-allowed",
                            fontWeight: 800,
                          }}
                        >
                          +
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        </div>

        <div style={{ padding: "14px 18px", borderTop: "1px solid #333", display: "flex", justifyContent: "flex-end", background: "#151515" }}>
          <button type="button" onClick={onClose} style={{ padding: "9px 20px", border: "1px solid #444", background: "transparent", color: "#ccc", cursor: "pointer", textTransform: "uppercase", fontWeight: 800 }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacteristicsMenu;
