// skillActions.js - CORRIGIDO

import axios from "axios";
import { updateSkills } from '../slices/skillsSlice';

const API_URL = "https://assrpgsite-be-production.up.railway.app/api/characters";

export const saveSkillsToBackend = (id, skills) => async (dispatch) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error("Not authorized, no token");
    }

    // ### SEÇÃO CORRIGIDA ###
    // Atualizamos as listas para conter os nomes das novas perícias.
    const knowledgeKeys = ['geography', 'medicine', 'security', 'biology', 'erudition', 'engineering'];
    const practicesKeys = ['weapons', 'athletics', 'expression', 'stealth', 'crafting', 'survival'];

    // Converter os valores para números antes de separar
    const normalizedSkills = Object.entries(skills).reduce((acc, [key, value]) => {
      acc[key] = parseInt(value) || 0;
      return acc;
    }, {});
    
    const knowledge = {};
    const practices = {};

    // Agora, este loop irá encontrar e separar as perícias novas corretamente.
    Object.entries(normalizedSkills).forEach(([key, value]) => {
      if (knowledgeKeys.includes(key)) {
        knowledge[key] = value;
      } else if (practicesKeys.includes(key)) {
        practices[key] = value;
      }
    });

    const payload = {
      skills: {
        knowledge,
        practices
      }
    };

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

    // Atualiza o estado do Redux com a resposta do servidor
    dispatch(updateSkills({ ...response.data.knowledge, ...response.data.practices }));
    return response.data;
  } catch (error) {
    // Adiciona um log mais detalhado do erro no console para facilitar a depuração
    console.error('Erro detalhado em saveSkillsToBackend:', error.response ? error.response.data : error.message);
    throw error;
  }
};