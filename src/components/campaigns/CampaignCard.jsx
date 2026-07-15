import React from "react";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { getCampaignStatus } from "../../utils/presentation";
import "./CampaignCard.css";

const DEFAULT_COVER = "https://images.unsplash.com/photo-1626262846282-e36214878a1a?q=80&w=1000&auto=format&fit=crop";

const CampaignCard = ({ campaign, onDelete, compact = false, deleting = false }) => {
  const status = getCampaignStatus(campaign.status);

  return (
    <article className={`campaignCard status-${status.className} ${compact ? "compact" : ""}`}>
      <img
        className="campaignCardImage"
        src={campaign.coverImageUrl || campaign.coverImage || DEFAULT_COVER}
        alt={`Capa da campanha ${campaign.name}`}
      />
      <div className="contentPane">
        <div className="campaignInfo">
          <h2 className="campaignName">{campaign.name}</h2>
          {!compact && (
            <>
              <div className="infoRow"><span className="infoLabel">Assimilador</span><span className="infoValue">{campaign.masterName || campaign.master?.name || "Não informado"}</span></div>
              <div className="infoRow"><span className="infoLabel">Infectados</span><span className="infoValue">{campaign.playersCount ?? campaign.players?.length ?? 0}</span></div>
            </>
          )}
          <div className="infoRow last"><span className="infoLabel">Status</span><span className={`infoValue campaignStatus ${status.className}`}>{status.label}</span></div>
        </div>
        <div className="campaignCardActions">
          <Link className="btn-open" to={`/campaign-lobby/${campaign._id}`} aria-label={`Abrir campanha ${campaign.name}`}>Acessar</Link>
          {onDelete && campaign.isMaster && (
            <button type="button" className="btn-delete" onClick={() => onDelete(campaign)} disabled={deleting} aria-label={`Excluir campanha ${campaign.name}`} title="Excluir campanha"><FaTrash aria-hidden="true" /></button>
          )}
        </div>
      </div>
    </article>
  );
};

export default CampaignCard;
