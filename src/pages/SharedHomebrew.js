/* SharedHomebrew.js */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
// Ícones
import { FaBoxOpen, FaBrain, FaFire, FaDownload, FaExclamationTriangle } from "react-icons/fa";
// Reutilizando o CSS de Homebrews para consistência
import "./Homebrews.css"; 

const SharedHomebrew = () => {
  const { id } = useParams();
  const [homebrewData, setHomebrewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    console.log("SharedHomebrew component mounted");
    const fetchData = async () => {
      try {
        console.log("Fetching data for id:", id);
        const response = await axios.get(
          `https://assrpgsite-be-production.up.railway.app/api/shared/${id}`
        );
        setHomebrewData(response.data);
      } catch (error) {
        console.error("Erro ao carregar homebrew:", error);
        setError(true);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleAddToProfile = async () => {
    try {
      await axios.post(
        `https://assrpgsite-be-production.up.railway.app/api/shared/${id}/add-to-profile`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("DADOS ASSIMILADOS COM SUCESSO.");
    } catch (error) {
      alert("ERRO NA ASSIMILAÇÃO. TENTE NOVAMENTE.");
    }
  };

  const renderIcon = () => {
    const style = { fontSize: '2rem', color: '#ff3333' };
    switch (homebrewData?.type) {
      case "item": return <FaBoxOpen style={style} />;
      case "trait": return <FaBrain style={style} />;
      case "assimilation": return <FaFire style={style} />;
      default: return null;
    }
  };

  const getTypeLabel = (type) => {
      const map = { item: "ITEM CUSTOMIZADO", trait: "CARACTERÍSTICA", assimilation: "ASSIMILAÇÃO" };
      return map[type] || "DADOS DESCONHECIDOS";
  };

  if (loading) return (
    <div className="homebrews-container" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
        <h2 className="hb-title">DECODIFICANDO DADOS...</h2>
    </div>
  );

  if (error || !homebrewData) return (
    <div className="homebrews-container" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
        <div className="hb-panel" style={{textAlign:'center', maxWidth:'500px'}}>
            <FaExclamationTriangle style={{fontSize:'3rem', color:'#bd2c2c', marginBottom:'20px'}}/>
            <h2 style={{color:'#fff', fontFamily:'Orbitron'}}>ARQUIVO CORROMPIDO</h2>
            <p style={{color:'#aaa'}}>Não foi possível recuperar os dados compartilhados.</p>
        </div>
    </div>
  );

  return (
    <div className="homebrews-container">
      <div className="hb-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Cabeçalho do Arquivo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '30px' }}>
          {renderIcon()}
          <div>
            <span style={{ display:'block', color:'#666', fontSize:'0.9rem', fontFamily:'Roboto Condensed', fontWeight:'bold' }}>
                ARQUIVO RECEBIDO: {getTypeLabel(homebrewData.type)}
            </span>
            <h1 style={{ margin: 0, fontFamily: 'Orbitron', color: '#fff', fontSize: '2rem', textTransform: 'uppercase' }}>
              {homebrewData.data.name}
            </h1>
          </div>
        </div>

        {/* Corpo de Dados */}
        <div style={{ background: '#0a0a0a', border: '1px solid #333', padding: '25px', marginBottom: '30px' }}>
          
          {/* Layout para Assimilação */}
          {homebrewData.type === "assimilation" && (
            <>
              <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'15px', marginBottom:'20px'}}>
                 <div className="hb-info-row"><span className="hb-label">SUCESSOS:</span> <span className="hb-value">{homebrewData.data.successCost}</span></div>
                 <div className="hb-info-row"><span className="hb-label">ADAPTAÇÃO:</span> <span className="hb-value">{homebrewData.data.adaptationCost}</span></div>
                 <div className="hb-info-row"><span className="hb-label">PRESSÃO:</span> <span className="hb-value">{homebrewData.data.pressureCost}</span></div>
              </div>
              <div className="hb-info-row" style={{marginBottom:'20px'}}>
                  <span className="hb-label">EVOLUÇÃO:</span> <span className="hb-value" style={{textTransform:'capitalize', color:'#ff3333'}}>{homebrewData.data.evolutionType}</span>
              </div>
            </>
          )}

          {/* Layout para Item */}
          {homebrewData.type === "item" && (
             <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginBottom:'20px'}}>
                <div className="hb-info-row"><span className="hb-label">TIPO:</span> <span className="hb-value">{homebrewData.data.type}</span></div>
                <div className="hb-info-row"><span className="hb-label">QUALIDADE:</span> <span className="hb-value">{homebrewData.data.quality}</span></div>
                <div className="hb-info-row"><span className="hb-label">ESCASSEZ:</span> <span className="hb-value">{homebrewData.data.category}</span></div>
                <div className="hb-info-row"><span className="hb-label">SLOTS:</span> <span className="hb-value">{homebrewData.data.slots}</span></div>
             </div>
          )}

          {/* Layout para Característica */}
          {homebrewData.type === "trait" && (
             <div className="hb-info-row" style={{marginBottom:'20px'}}>
                <span className="hb-label">CUSTO EM PONTOS:</span> <span className="hb-value" style={{fontSize:'1.2rem'}}>{homebrewData.data.pointsCost}</span>
             </div>
          )}

          {/* Descrição (Comum a todos) */}
          <div style={{ borderTop: '1px dashed #333', paddingTop: '20px' }}>
            <span className="hb-label" style={{display:'block', marginBottom:'10px'}}>DESCRIÇÃO DO ARQUIVO:</span>
            <p style={{ color: '#ccc', lineHeight: '1.6', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                {homebrewData.data.description}
            </p>
          </div>
        </div>

        {/* Botão de Ação */}
        <button 
            className="btn-nero btn-primary" 
            onClick={handleAddToProfile} 
            style={{ width: '100%', padding: '15px', fontSize: '1.1rem', justifyContent: 'center' }}
        >
            <FaDownload /> ADICIONAR AO MEU PERFIL
        </button>

      </div>
    </div>
  );
};

export default SharedHomebrew;