import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "./ui/Dialog";
import SystemText from "./SystemText";

const availableCharacteristics = {
  "-1": [
    { name: "Frágil", cost: -1, description: "Precisa de uma [pressao] a menos para baixar um nível de Qualidade. Se estiver no nível 1 (Defeituoso), ficará no nível 0 (Quebrado) no próximo uso." },
    { name: "Improvisado", cost: -1, description: "Criado com partes originalmente feitas com outros objetivos, sem refinamento de criação e com material reaproveitado. Testes com esse item têm um [sucesso] a menos, mas esse efeito pode ser cancelado com o investimento de uma [adaptacao]." },
    { name: "Pesado", cost: -1, description: "Quando está consigo, mesmo que na mochila, torna a personagem mais lenta e cancela um [sucesso] em todo teste que envolva pura movimentação ou furtividade, especialmente em testes de fuga em conflitos. Ocupa dois espaços de inventário." },
    { name: "Uso Único", cost: -1, description: "Basta um único uso para fazer com que o item desapareça ou fique completamente gasto." },
  ],
  "1": [
    { name: "Ágil", cost: 1, description: "Arma branca balanceada capaz de efeitos poderosos em mãos ágeis. Em um teste de ataque armado, substitui Potência por Reação." },
    { name: "Discreto", cost: 1, description: "Um item menor e mais fino ou retrátil que pode ser facilmente escondido e não ocupa espaço de inventário. Não será percebido pelos outros enquanto continuar guardado." },
    { name: "Espaçoso", cost: 1, description: "Vestes, bolsas e/ou mochilas construídas para carregar mais equipamentos. A quantidade de espaços de inventário aumenta em +2. Pode ser comprada mais de uma vez no mesmo equipamento, acumulando os efeitos." },
    { name: "Iluminador", cost: 1, description: "Item usado para iluminação artificial que projeta 6 metros por nível de Qualidade atual (uma lanterna Padrão ilumina 18 metros). Cai um nível de Qualidade se for utilizado por tempo demais, mas o(a) Assimilador(a) deve avisar antes desse consumo; uma tocha simples ilumina 6 metros." },
    { name: "Letal", cost: 1, description: "Arma que pode causar ferimentos profundos. Ao fazer um teste com ela, uma vez por dia pode trocar qualquer [adaptacao] por [sucesso] na jogada. Um uso adicional pode ser realizado para obter um [sucesso] extra, mas o equipamento perde um nível de Qualidade." },
    { name: "Protetivo", cost: 1, description: "Esse item pode ser usado para reduzir dano sofrido. Ao sofrer dano, você pode fazer um uso por cena para evitar a perda de um Ponto de [saude], podendo fazer um uso adicional se quiser baixar um nível de Qualidade para esse propósito." },
    { name: "Restaurador", cost: 1, description: "Alimentos, bebidas ou remédios que ajudam na recuperação. Geralmente começa com seis usos e cada uso alimenta uma personagem por um dia e dá um Ponto de [saude] durante a próxima Recuperação. O efeito não se acumula em uma mesma personagem no mesmo repouso." },
  ],
  "2": [
    { name: "Eficiente", cost: 2, description: "Itens com design pensado para serem ergonômicos e muito práticos. Em um teste com esse item, você pode trocar 1 [d6] por 1 [d10] uma vez por dia. Um uso adicional pode ser realizado em um teste posterior no mesmo dia, mas o equipamento perde um nível de Qualidade." },
    { name: "Durável", cost: 2, description: "Itens reforçados e pensados para sobreviver ao desgaste, como baterias de efeito mais prolongado ou outras formas de extensão de durabilidade. Precisa de uma [pressao] adicional para perder um nível de Qualidade." },
  ],
  "3": [
    { name: "Adrenalina", cost: 3, description: "Encontrada em canetas ou injeções que ajudam a enfrentar dor e cansaço. Geralmente começa com seis usos e cada uso aumenta 6 Pontos de [saude] até o próximo repouso, quando esses pontos são perdidos. Cada uso adicional no mesmo dia exige um teste de Resolução + Atletismo: com êxito, ganha 6 Pontos de [saude] para perdê-los na próxima Recuperação; em caso de falha, perde 8 Pontos de [saude] por forçar o coração. Após o repouso, perde um ponto de [determinacao] para cada uso realizado no dia." },
    { name: "Armadura", cost: 3, description: "Veste de proteção usada para absorver ferimentos. Ao sofrer dano, você pode fazer até três usos por cena para evitar a perda de um Ponto de [saude]. Toda vez que os três usos forem realizados em uma única cena, a armadura baixa um nível de Qualidade." },
  ],
  "4": [
    { name: "Explosivo", cost: 4, description: "Um item pensado para ser detonado. Ao fazer um teste com esse item, você pode eliminá-lo para detonar uma área, destruindo estruturas e ferindo quaisquer criaturas com 4 [d10] de dano. Todo item Explosivo também possui Uso Único, por isso não é possível acumular os pontos das duas categorias." },
    { name: "Inflamável", cost: 4, description: "Itens capazes de gerar fogo em escala perigosa. Ao fazer um teste com esse item, você pode baixar um nível de Qualidade para incinerar uma área, investindo uma quantidade de [sucesso] solicitada pelo(a) Assimilador(a). Alvos atingidos sofrem 3 [d10] de dano de queimadura e precisam investir [sucesso] e [adaptacao] ou sofrerão 2 [d10] desse mesmo tipo de dano no final do turno." },
    { name: "Medicinal", cost: 4, description: "Medicamentos e utensílios médicos geralmente têm essa característica. Começam com seis usos e cada uso cancela uma [pressao] no teste de Tratamento Médico, podendo fazer no máximo uma quantidade de usos por teste igual à graduação em Medicina. Itens de Uso Único podem cancelar até duas [pressao] no mesmo teste." },
  ],
};

const characteristicCategoryOrder = ["-1", "1", "2", "3", "4"];

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
    const existingIndex = characteristics.findIndex(({ name }) => name === characteristic.name);
    const allowsDuplicates = characteristic.name === "Espaçoso";
    if (existingIndex >= 0 && !allowsDuplicates) return;

    const existingUseUniqueIndex = characteristics.findIndex(({ name }) => name === "Uso Único");
    const existingUseUnique = characteristics[existingUseUniqueIndex];
    const standaloneUseUnique = existingUseUnique && existingUseUnique.includedBy !== "Explosivo";
    const requiredPoints = characteristic.cost + (characteristic.name === "Explosivo" && standaloneUseUnique ? 1 : 0);
    if (points < requiredPoints) return;

    let nextDetails = [...characteristics, { ...characteristic, marked: false }];
    let nextPoints = points - requiredPoints;

    if (characteristic.name === "Explosivo") {
      if (existingUseUniqueIndex >= 0) {
        nextDetails = nextDetails.map((detail) => (
          detail.name === "Uso Único" ? { ...detail, includedBy: "Explosivo" } : detail
        ));
      } else {
        const useUnique = availableCharacteristics["-1"].find(({ name }) => name === "Uso Único");
        nextDetails.push({ ...useUnique, marked: false, includedBy: "Explosivo" });
      }
    }

    setCharacteristics(nextDetails);
    setPoints(nextPoints);
    emitChange(nextDetails, nextPoints);
  };

  const handleRemoveCharacteristic = (index) => {
    const removedCharacteristic = characteristics[index];
    const removesExplosiveGroup = removedCharacteristic.name === "Explosivo" || removedCharacteristic.includedBy === "Explosivo";
    const nextDetails = removesExplosiveGroup
      ? characteristics.filter((detail) => detail.name !== "Explosivo" && detail.includedBy !== "Explosivo")
      : characteristics.filter((_, currentIndex) => currentIndex !== index);
    const nextPoints = points + (removesExplosiveGroup ? 4 : removedCharacteristic.cost);
    setCharacteristics(nextDetails);
    setPoints(nextPoints);
    emitChange(nextDetails, nextPoints);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Editar características"
      description="Características do item"
      size="large"
      className="item-characteristics-dialog"
      overlayClassName="nero-dialog-overlay-nested"
      actions={(
        <button type="button" onClick={onClose} className="btn-nero btn-secondary">
          Fechar
        </button>
      )}
    >
        <div>
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
                      <p style={{ margin: "4px 0 0", color: "#aaa", fontSize: "0.88rem", lineHeight: 1.4 }}><SystemText text={characteristic.description} /></p>
                    </div>
                    <button type="button" aria-label={`Remover característica ${characteristic.name}`} title={`Remover ${characteristic.name}`} onClick={() => handleRemoveCharacteristic(index)} style={{ display: "grid", placeItems: "center", width: 34, height: 34, border: "1px solid #500", background: "rgba(138,28,24,0.14)", color: "#ff6666", cursor: "pointer" }}>
                      <DeleteIcon aria-hidden="true" fontSize="small" />
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
            {characteristicCategoryOrder.map((category) => (
              <div key={category} style={{ marginBottom: 18 }}>
                <div style={{ color: "#ff5555", borderBottom: "1px solid #333", paddingBottom: 6, marginBottom: 8, fontWeight: 800, textTransform: "uppercase" }}>
                  Categoria {category}
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {availableCharacteristics[category].map((characteristic) => {
                    const alreadyApplied = characteristics.some(({ name }) => name === characteristic.name);
                    const allowsDuplicates = characteristic.name === "Espaçoso";
                    const standaloneUseUnique = characteristics.some(({ name, includedBy }) => name === "Uso Único" && includedBy !== "Explosivo");
                    const requiredPoints = characteristic.cost + (characteristic.name === "Explosivo" && standaloneUseUnique ? 1 : 0);
                    const canAdd = (!alreadyApplied || allowsDuplicates) && points >= requiredPoints;
                    return (
                      <div key={characteristic.name} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", padding: 12, border: "1px solid #333", background: "#111" }}>
                        <div>
                          <strong style={{ color: "#fff" }}>{characteristic.name}</strong>
                          <p style={{ margin: "4px 0 0", color: "#aaa", fontSize: "0.88rem", lineHeight: 1.4 }}><SystemText text={characteristic.description} /></p>
                        </div>
                        <button
                          type="button"
                          disabled={!canAdd}
                          aria-label={`Adicionar característica ${characteristic.name}`}
                          title={`Adicionar ${characteristic.name}`}
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
    </Dialog>
  );
};

export default CharacteristicsMenu;
