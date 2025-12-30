/* CharacterForm.js - BLINDADO CONTRA ENVIO PRECOCE */
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import "./CharacterForm.css";

// Ícones
import { 
  FaCheck, FaArrowLeft, FaArrowRight, FaUpload, 
  FaFirstAid, FaBook, FaBalanceScale, FaHiking, FaFire, FaTree 
} from "react-icons/fa";
import { GiBackpack, GiCompass, GiHood } from "react-icons/gi";
import { MdSecurity } from "react-icons/md";

// Dicionários
const packIcons = {
  Combatente: <MdSecurity />, Curandeiro: <FaFirstAid />, Desbravador: <GiCompass />,
  Estudioso: <FaBook />, Mercador: <FaBalanceScale />, Nômade: <FaHiking />,
  infiltrador: <GiHood />, Selvagem: <FaTree />, Sobrevivente: <FaFire />,
};

const translateKey = (key) => {
    const map = {
      reaction: "Reação", perception: "Percepção", sagacity: "Sagacidade", potency: "Potência", influence: "Influência", resolution: "Resolução",
      geography: "Geografia", medicine: "Medicina", security: "Segurança", biology: "Biologia", erudition: "Erudição", engineering: "Engenharia",
      weapons: "Armas", athletics: "Atletismo", expression: "Expressão", stealth: "Furtividade", crafting: "Manufaturas", survival: "Sobrevivência"
    };
    return map[key.toLowerCase()] || key;
};

// --- COMPONENTES DOS PASSOS ---

const Step1_Informacoes = ({ character, handleInputChange, errors, avatarPreview, handleAvatarChange }) => (
  <div className="fade-in">
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginBottom:'30px'}}>
      <div style={{
          width:'120px', height:'120px', border:'2px solid #444', 
          background:'#000', marginBottom:'10px', display:'flex', alignItems:'center', justifyContent:'center'
      }}>
        {avatarPreview ? (
          <img src={avatarPreview} alt="Avatar" style={{width:'100%', height:'100%', objectFit:'cover'}} />
        ) : (
          <span style={{color:'#333', fontSize:'0.8rem', fontFamily:'monospace'}}>NO_IMAGE</span>
        )}
      </div>
      <label className="btn-nero btn-secondary" style={{padding: '5px 15px', fontSize: '0.8rem'}}>
        <FaUpload style={{marginRight: '5px'}}/> CARREGAR FOTO
        <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
      </label>
    </div>

    <div className="form-grid">
      <div className="form-group">
        <label>Nome do Infectado</label>
        <input type="text" name="name" value={character.name} onChange={handleInputChange} className="nero-input" />
        {errors.name && <small className="error-text">{errors.name}</small>}
      </div>
      <div className="form-group">
        <label>Geração</label>
        <select name="generation" value={character.generation} onChange={handleInputChange} className="nero-select">
          <option value="">SELECIONE...</option>
          <option value="preCollapse">Pré-Colapso</option>
          <option value="collapse">Colapso</option>
          <option value="postCollapse">Pós-Colapso</option>
        </select>
        {errors.generation && <small className="error-text">{errors.generation}</small>}
      </div>
    </div>
  </div>
);

const Step2_Evento = ({ character, handleInputChange, errors }) => (
  <div className="fade-in">
    <span className="section-label">Registro Histórico</span>
    <div className="form-group" style={{marginBottom: '20px'}}>
      <label>Evento Marcante</label>
      <textarea name="event" rows="5" value={character.event} onChange={handleInputChange} className="nero-textarea" placeholder="Descreva o trauma..." />
      {errors.event && <small className="error-text">{errors.event}</small>}
    </div>
    <div className="form-group">
      <label>Ocupação</label>
      <input type="text" name="occupation" value={character.occupation} onChange={handleInputChange} className="nero-input" />
      {errors.occupation && <small className="error-text">{errors.occupation}</small>}
    </div>
  </div>
);

const Step3_Propositos = ({ character, handleInputChange, errors }) => (
  <div className="fade-in">
    <span className="section-label">Motivações</span>
    <div className="form-grid">
      <div className="form-group">
        <label>Propósito Individual 1</label>
        <input type="text" name="purpose1" value={character.purpose1} onChange={handleInputChange} className="nero-input" />
        {errors.purpose1 && <small className="error-text">{errors.purpose1}</small>}
      </div>
      <div className="form-group">
        <label>Propósito Individual 2</label>
        <input type="text" name="purpose2" value={character.purpose2} onChange={handleInputChange} className="nero-input" />
        {errors.purpose2 && <small className="error-text">{errors.purpose2}</small>}
      </div>
      <div className="form-group">
        <label>Propósito Relacional 1</label>
        <input type="text" name="relationalPurpose1" value={character.relationalPurpose1} onChange={handleInputChange} className="nero-input" />
        {errors.relationalPurpose1 && <small className="error-text">{errors.relationalPurpose1}</small>}
      </div>
      <div className="form-group">
        <label>Propósito Relacional 2</label>
        <input type="text" name="relationalPurpose2" value={character.relationalPurpose2} onChange={handleInputChange} className="nero-input" />
        {errors.relationalPurpose2 && <small className="error-text">{errors.relationalPurpose2}</small>}
      </div>
    </div>
  </div>
);

const Step4_Equipamento = ({ character, handlePackSelect, initialEquipmentPacks }) => (
  <div className="fade-in">
    <span className="section-label">Requisição de Suprimentos</span>
    <div className="equipment-grid">
      {initialEquipmentPacks.map((pack) => (
        <div
          key={pack.name}
          className={`equip-card ${character.initialPack === pack.name ? 'selected' : ''}`}
          onClick={() => handlePackSelect(pack)}
        >
          {character.initialPack === pack.name && <FaCheck className="card-check" />}
          <div className="card-header">
            <span className="card-icon">{packIcons[pack.name] || <GiBackpack />}</span>
            <span className="card-title">{pack.name.toUpperCase()}</span>
          </div>
          <div className="card-items">
            {pack.items.join(', ')}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Step5_Distribuicao = ({ character, handleInstinctChange, handleNestedChange, remainingInstinctPoints, remainingPoints, translateKey }) => (
  <div className="fade-in">
    <span className="section-label">Instintos</span>
    <div className="points-chip">
       PONTOS: {remainingInstinctPoints}
    </div>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', marginBottom: '30px'}}>
      {Object.keys(character.instincts).map((instinct) => (
        <div key={instinct} className="instinct-row">
           <span style={{color: '#aaa', fontWeight: 'bold', fontSize: '0.9rem'}}>{translateKey(instinct).toUpperCase()}</span>
           <div className="instinct-actions">
              <button type="button" className="btn-control" onClick={() => handleInstinctChange(instinct, character.instincts[instinct] - 1)} disabled={character.instincts[instinct] <= 1}>-</button>
              <span className="instinct-val">{character.instincts[instinct]}</span>
              <button type="button" className="btn-control" onClick={() => handleInstinctChange(instinct, character.instincts[instinct] + 1)} disabled={character.instincts[instinct] >= 3 || remainingInstinctPoints <= 0}>+</button>
           </div>
        </div>
      ))}
    </div>

    <span className="section-label">Conhecimentos & Práticas</span>
    <div className="points-chip">
       PONTOS: {remainingPoints}
    </div>
    
    <div className="compact-grid">
       {/* CONHECIMENTOS */}
       {Object.keys(character.knowledge).map((k) => (
         <div key={k} className="compact-group">
            <label>{translateKey(k)}</label>
            <input 
              type="number" 
              min="0" 
              max="2" 
              name={k} 
              value={character.knowledge[k]} 
              onChange={(e) => handleNestedChange("knowledge", e)} 
              className="compact-input" 
            />
         </div>
       ))}
       
       {/* PRÁTICAS */}
       {Object.keys(character.practices).map((p) => (
         <div key={p} className="compact-group">
            <label>{translateKey(p)}</label>
            <input 
              type="number" 
              min="0" 
              max="2" 
              name={p} 
              value={character.practices[p]} 
              onChange={(e) => handleNestedChange("practices", e)} 
              className="compact-input" 
            />
         </div>
       ))}
    </div>
  </div>
);

const Step6_CaboDeGuerra = ({ character, handleTugOfWarChange }) => {
  const det = character.determinationLevel;
  const ass = character.assimilationLevel;

  return (
    <div className="fade-in">
      <span className="section-label" style={{ borderLeftColor: det > ass ? '#a73c39' : '#3b4766' }}>
        Cabo de Guerra
      </span>
      
      <div className="tug-display" style={{ gap: '10px' }}>
         {/* LADO ESQUERDO: ASSIMILAÇÃO (Azul #3b4766) */}
         <div className={`stat-box ${ass >= 5 ? 'active-blue-project' : ''}`}>
             <span className="stat-label" style={{ fontSize: '0.7rem', color: '#666' }}>ASSIMILAÇÃO</span>
             <span className="stat-num" style={{ color: '#3b4766', fontSize: '2.5rem', fontWeight: 'bold', display: 'block' }}>
               {ass}
             </span>
         </div>

         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#222', fontWeight: 'bold' }}>
           VS
         </div>

         {/* LADO DIREITO: DETERMINAÇÃO (Vermelho #a73c39) */}
         <div className={`stat-box ${det >= 5 ? 'active-red-project' : ''}`}>
             <span className="stat-label" style={{ fontSize: '0.7rem', color: '#666' }}>DETERMINAÇÃO</span>
             <span className="stat-num" style={{ color: '#a73c39', fontSize: '2.5rem', fontWeight: 'bold', display: 'block' }}>
               {det}
             </span>
         </div>
      </div>

      <div className="range-wrapper">
        <div className="range-limits">
            <span className="limit-ass">Assimilado</span>
            <span className="limit-det">Racional</span>
        </div>
        
        <input 
            type="range" 
            min="1" 
            max="9" 
            step="1"
            value={det} 
            onChange={handleTugOfWarChange} 
            className="nero-range"
        />
        
        <div style={{ 
          textAlign: 'center', 
          fontSize: '0.6rem', 
          color: '#9c9393ff', 
          marginTop: '15px', 
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
           Ajuste a influência da Assimilação sobre o personagem
        </div>
      </div>

      <div style={{
        textAlign: 'center', 
        color: det > ass ? '#a73c39' : '#3b4766', 
        fontSize: '0.9rem', 
        border: '1px solid #111', 
        padding: '20px', 
        background: '#050505',
        borderRadius: '4px',
        transition: 'color 0.3s ease'
      }}>
          {det > ass 
            ? "As emoções humanas ainda controlam a força deste corpo." 
            : "A simbiose com a Assimilação se torna profunda. Seus sentidos transcendem o humano."}
      </div>
    </div>
  );
};
// --- COMPONENTE PRINCIPAL ---

const initialEquipmentPacks = [
    { name: "Combatente", items: ["Bebida", "Corda", "Faca", "Lança", "Machado"] },
    { name: "Curandeiro", items: ["Álcool", "Curativos", "Faca", "Kit de costura", "Serrote"] },
    { name: "Desbravador", items: ["Bússola", "Facão", "Mapas", "Saco de dormir", "Tenda"] },
    { name: "Estudioso", items: ["Caderno", "Velas", "Canivete", "Kit escrita", "Livros"] },
    { name: "Mercador", items: ["Ábaco", "Balança", "Caderno", "Kit escrita", "Mapas"] },
    { name: "Nômade", items: ["Flechas x10", "Arco", "Facão", "Manto", "Sinalizador"] },
    { name: "infiltrador", items: ["Corda", "Faca", "Gazuas", "Manto", "Pé de Cabra"] },
    { name: "Selvagem", items: ["Faca osso", "Lança", "Pintura", "Rede dormir", "Rede pesca"] },
    { name: "Sobrevivente", items: ["Corda", "Machado", "Pederneira", "Saco dormir"] },
];

const stepsLabels = ["Dados", "Histórico", "Propósitos", "Equipamento", "Atributos", "Psique"];

export default function CharacterForm() {
  const [character, setCharacter] = useState({
    name: "", generation: "", event: "", occupation: "", purpose1: "", purpose2: "", relationalPurpose1: "", relationalPurpose2: "",
    inventory: [], initialPack: "",
    instincts: { reaction: 1, perception: 1, sagacity: 1, potency: 1, influence: 1, resolution: 1 },
    knowledge: { geography: 0, medicine: 0, security: 0, biology: 0, erudition: 0, engineering: 0 },
    practices: { weapons: 0, athletics: 0, expression: 0, stealth: 0, crafting: 0, survival: 0 },
    determinationLevel: 9, determinationPoints: 9, assimilationLevel: 1, assimilationPoints: 1,
  });
  
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remainingPoints, setRemainingPoints] = useState(7);
  const [remainingInstinctPoints, setRemainingInstinctPoints] = useState(3);
  const [errors, setErrors] = useState({});
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  const [allItems, setAllItems] = useState([]);
  const [areItemsLoading, setAreItemsLoading] = useState(true);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchItems = async () => {
      if (token) {
        setAreItemsLoading(true);
        try {
          const response = await axios.get("https://assrpgsite-be-production.up.railway.app/api/items", { headers: { Authorization: `Bearer ${token}` } });
          setAllItems(response.data);
        } catch (err) { console.error(err); setError("Erro ao carregar itens."); } 
        finally { setAreItemsLoading(false); }
      } else { setAreItemsLoading(false); }
    };
    fetchItems();
  }, [token]);

  // Handlers básicos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCharacter({ ...character, [name]: value });
    if (value) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) { setAvatar(file); setAvatarPreview(URL.createObjectURL(file)); }
  };

  const handlePackSelect = (pack) => {
    if (!pack || areItemsLoading || allItems.length === 0) return;
    const newInventory = [];
    pack.items.forEach(itemName => {
        const dbItem = allItems.find(i => i.name.toLowerCase().includes(itemName.toLowerCase().split(' ')[0]));
        if(dbItem) {
             newInventory.push({
                quality: dbItem.quality || 3, quantity: 1, slotLocation: 'mochila', currentUses: 0,
                itemData: { 
                    originalItemId: dbItem._id, name: dbItem.name, type: dbItem.type, category: dbItem.category, 
                    slots: dbItem.slots, modifiers: dbItem.modifiers || [], isArtefato: dbItem.isArtefato || false, 
                    description: dbItem.description || "", characteristics: dbItem.characteristics || { points: 0, details: [] } 
                }
            });
        }
    });
    setCharacter(prev => ({ ...prev, initialPack: pack.name, inventory: newInventory }));
  };

  const handleNestedChange = (cat, e) => {
    const { name, value } = e.target;
    const val = parseInt(value) || 0;
    const currentTotal = Object.values(character.knowledge).reduce((a,b)=>a+b,0) + Object.values(character.practices).reduce((a,b)=>a+b,0);
    const oldVal = character[cat][name];
    if ((currentTotal - oldVal + val) <= 7) {
        setCharacter(prev => ({ ...prev, [cat]: { ...prev[cat], [name]: val } }));
        setRemainingPoints(7 - (currentTotal - oldVal + val));
    }
  };

  const handleInstinctChange = (name, val) => {
    if (val < 1 || val > 3) return;
    const diff = val - character.instincts[name];
    if (diff > 0 && diff > remainingInstinctPoints) return;
    setRemainingInstinctPoints(prev => prev - diff);
    setCharacter(prev => ({ ...prev, instincts: { ...prev.instincts, [name]: val } }));
  };

  const handleTugOfWarChange = (e) => {
    const val = parseInt(e.target.value);
    setCharacter(prev => ({ ...prev, determinationLevel: val, determinationPoints: val, assimilationLevel: 10-val, assimilationPoints: 10-val }));
  };

  // --- NAVEGAÇÃO ---

  const validateStep = () => {
     let newErrors = {};
     let isValid = true;
     if (activeStep === 0) {
         if (!character.name) { newErrors.name = "Obrigatório"; isValid = false; }
         if (!character.generation) { newErrors.generation = "Obrigatório"; isValid = false; }
     }
     if (activeStep === 1) {
         if (!character.event) { newErrors.event = "Obrigatório"; isValid = false; }
         if (!character.occupation) { newErrors.occupation = "Obrigatório"; isValid = false; }
     }
     if (activeStep === 2) {
         if (!character.purpose1) { newErrors.purpose1 = "Obrigatório"; isValid = false; }
         if (!character.purpose2) { newErrors.purpose2 = "Obrigatório"; isValid = false; }
     }
     if (activeStep === 3) {
         if (!character.initialPack) { setError("Selecione um pacote."); isValid = false; }
     }
     if (activeStep === 4) {
         if (remainingPoints > 0) { setError(`Distribua todos os atributos.`); isValid = false; }
         else if (remainingInstinctPoints > 0) { setError(`Distribua todos os instintos.`); isValid = false; }
     }
     setErrors(newErrors);
     return isValid;
  };

  const handleNext = (e) => {
    if(e) e.preventDefault(); // PREVINE BUGS DE SUBMIT ACIDENTAL
    
    if (validateStep()) {
        setActiveStep(p => p + 1);
        setError("");
    } else {
        if(!error) setError("Preencha todos os campos obrigatórios.");
    }
  };

  const handleBack = () => { setActiveStep(p => p - 1); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // PROTEÇÃO #1: Bloqueia envio se não estiver na última etapa (index 5)
    // Isso é vital. Se algo no passo 4 tentar submeter, isso para.
    if (activeStep !== stepsLabels.length - 1) return;

    if (!validateStep()) return; 

    setLoading(true);
    const formData = new FormData();
    const appendData = (data, root) => { 
        if(data && typeof data === 'object' && !(data instanceof File)) { 
            Object.keys(data).forEach(key => appendData(data[key], root ? `${root}[${key}]` : key)); 
        } else { formData.append(root, data); } 
    };

    Object.keys(character).forEach(key => {
        if(key === 'inventory') formData.append(key, JSON.stringify(character[key]));
        else appendData(character[key], key);
    });
    if (avatar) formData.append('avatar', avatar);

    try { 
        await axios.post("https://assrpgsite-be-production.up.railway.app/api/characters", formData, { headers: { Authorization: `Bearer ${token}` } }); 
        setSuccess(true); 
    } catch(err) { 
        console.error(err); setError("Erro ao criar personagem."); 
    } finally { setLoading(false); }
  };

  const getStepContent = (step) => {
      const props = { character, handleInputChange, errors, avatarPreview, handleAvatarChange, handlePackSelect, initialEquipmentPacks, handleInstinctChange, handleNestedChange, remainingInstinctPoints, remainingPoints, translateKey, handleTugOfWarChange };
      switch(step) {
          case 0: return <Step1_Informacoes {...props} />;
          case 1: return <Step2_Evento {...props} />;
          case 2: return <Step3_Propositos {...props} />;
          case 3: return <Step4_Equipamento {...props} />;
          case 4: return <Step5_Distribuicao {...props} />;
          case 5: return <Step6_CaboDeGuerra {...props} />;
          default: return null;
      }
  };

  return (
    <div className="character-form-page">
      <div className="nero-form-card">
        <div className="form-title">FICHA DE RECRUTAMENTO</div>
        
        <div className="nero-stepper">
           {stepsLabels.map((label, i) => (
             <div key={label} className={`step-item ${i === activeStep ? 'active' : ''} ${i < activeStep ? 'completed' : ''}`}>
               {label}
             </div>
           ))}
        </div>

        {/* PROTEÇÃO #3: Se não for a última etapa, este form não deve ter um "submit" implícito facilmente. */}
        <form onSubmit={handleSubmit} onKeyDown={(e) => { if(e.key === 'Enter' && e.target.type !== 'textarea') e.preventDefault(); }}>
          
          {getStepContent(activeStep)}
          
          <div className="form-actions">
            <button type="button" onClick={handleBack} disabled={activeStep === 0 || loading} className="btn-nero btn-secondary">
               <FaArrowLeft /> VOLTAR
            </button>
            
            {/* 
                PROTEÇÃO #2: Chaves Únicas (Key) para impedir "Button Thrashing". 
                Ao usar keys diferentes, o React desmonta o botão e monta um novo, zerando eventos de clique antigos.
            */}
            {activeStep === stepsLabels.length - 1 ? (
                <button 
                    key="btn-finish" 
                    type="submit" 
                    disabled={loading} 
                    className="btn-nero btn-primary"
                >
                    {loading ? "ENVIANDO..." : "FINALIZAR"} <FaCheck />
                </button>
            ) : (
                <button 
                    key="btn-next" 
                    type="button" 
                    onClick={handleNext} 
                    className="btn-nero btn-primary"
                >
                    PRÓXIMO <FaArrowRight />
                </button>
            )}
          </div>
          
          {error && <div style={{color: '#bd2c2c', textAlign: 'center', marginTop: '20px', fontWeight:'bold', border:'1px solid #bd2c2c', padding:'10px'}}>ERRO: {error}</div>}
          {success && <div style={{color: '#4caf50', textAlign: 'center', marginTop: '20px', fontWeight:'bold', border:'1px solid #4caf50', padding:'10px'}}>REGISTRO CONFIRMADO.</div>}
        </form>
      </div>
    </div>
  );
}