import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaShieldAlt, FaTv } from "react-icons/fa";
import "./CampaignContextHeader.css";
import { API_BASE_URL } from "../../config/apiConfig";

const statusLabels = {
  active: "Em andamento",
  paused: "Pausada",
  completed: "Encerrada",
};

const CampaignContextHeader = ({ campaign, campaignId, isMaster = false }) => {
  const location = useLocation();
  if (!campaignId) return null;
  const rawCover = campaign?.coverImageUrl || campaign?.coverImage || "";
  const cover = rawCover && !rawCover.startsWith("http")
    ? `${API_BASE_URL}/${rawCover.replace(/\\/g, "/")}`
    : rawCover;

  const links = [
    { to: `/campaign-lobby/${campaignId}`, label: "Visão geral", icon: FaHome },
    { to: `/campanha/${campaignId}/vtt`, label: "VTT", icon: FaTv },
    ...(isMaster ? [{ to: `/campaign-sheet/${campaignId}`, label: "Escudo", icon: FaShieldAlt }] : []),
    { to: `/campaign/${campaignId}/refuges`, label: "Refúgios", icon: FaHome },
  ];

  return (
    <section className="campaign-context" aria-label="Contexto da campanha">
      <div className="campaign-context-identity">
        {cover ? (
          <img src={cover} alt="" />
        ) : (
          <span className="campaign-context-placeholder" aria-hidden="true"><FaShieldAlt /></span>
        )}
        <div>
          <strong>{campaign?.name || "Campanha"}</strong>
          <span>{isMaster ? "Mestre" : "Jogador"} · {statusLabels[campaign?.status] || "Em andamento"}</span>
        </div>
      </div>
      <nav aria-label="Seções da campanha">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || (label === "Refúgios" && location.pathname.startsWith(`/campaign/${campaignId}/refuge`));
          return (
            <Link key={to} to={to} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
              <Icon aria-hidden="true" /> {label}
            </Link>
          );
        })}
      </nav>
    </section>
  );
};

export default CampaignContextHeader;
