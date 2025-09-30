import axios from "axios";
import { updateSkills, updateSkillValue } from '../slices/skillsSlice';

const API_URL = "https://hystoriarpg-production.up.railway.app/api/characters";


// skillActions.js
export const saveSkillsToBackend = (id, skills) => async (dispatch) => {
  try {
    console.log('saveSkillsToBackend - input:', { id, skills });
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Not authorized, no token");
    }

    // Definir quais chaves pertencem a knowledge e practices
    const knowledgeKeys = ['agrarian', 'biological', 'exact', 'medicine', 'social', 'artistic'];
    const practicesKeys = ['sports', 'tools', 'crafts', 'weapons', 'vehicles', 'infiltration'];

    // Converter os valores para números antes de separar em knowledge e practices
    const normalizedSkills = Object.entries(skills).reduce((acc, [key, value]) => {
      acc[key] = parseInt(value) || 0;
      return acc;
    }, {});
    
    console.log('Skills normalizadas:', normalizedSkills);

    const knowledge = {};
    const practices = {};

    Object.entries(normalizedSkills).forEach(([key, value]) => {
      if (knowledgeKeys.includes(key)) {
        knowledge[key] = value;
      } else if (practicesKeys.includes(key)) {
        practices[key] = value;
      }
    });

    // Estrutura correta do payload
    const payload = {
      skills: {
        knowledge,
        practices
      }
    };

    console.log('Separado em:', { knowledge, practices });

    const response = await axios.put(
      `${API_URL}/${id}/skills`,
      payload,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
    );

    console.log('Resposta do servidor:', response.data);

    // Atualizar o Redux com a resposta mesclando knowledge e practices
    dispatch(updateSkills({ ...response.data.knowledge, ...response.data.practices }));
    return response.data;
  } catch (error) {
    console.error('Erro completo:', error);
    throw error;
  }
};