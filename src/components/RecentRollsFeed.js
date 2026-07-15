import React from "react";
import EmptyState from "./ui/EmptyState";
import RollResultCard from "./RollResultCard";
import "./RecentRollsFeed.css";

const translateKey = (key) => {
  const translations = {
    geography: "Geografia",
    medicine: "Medicina",
    security: "Segurança",
    biology: "Biologia",
    erudition: "Erudição",
    engineering: "Engenharia",
    weapons: "Armas",
    athletics: "Atletismo",
    expression: "Expressão",
    stealth: "Furtividade",
    crafting: "Manufaturas",
    survival: "Sobrevivência",
    perception: "Percepção",
    potency: "Potência",
    influence: "Influência",
    resolution: "Resolução",
    sagacity: "Sagacidade",
    reaction: "Reação",
  };
  return translations[key] || key;
};

const RecentRollsFeed = ({ rolls }) => {
  if (!rolls?.length) {
    return (
      <EmptyState
        compact
        title="Nenhuma rolagem recente"
        description="As rolagens da campanha aparecem aqui em tempo real."
      />
    );
  }

  return (
    <div className="recent-rolls-feed" aria-label="Histórico recente de rolagens">
      {rolls.map((roll, index) => (
        <RollResultCard
          key={roll._id || roll.id || roll.timestamp || index}
          roll={roll.roll || []}
          actorName={roll.rollerName || "Mestre"}
          actionLabel={translateKey(roll.skill) || "Rolagem livre"}
          formula={roll.formula}
          timestamp={roll.timestamp}
          selection={roll.selection}
          variant={index === 0 ? "latest" : "compact"}
          recent={index === 0}
        />
      ))}
    </div>
  );
};

export default RecentRollsFeed;
