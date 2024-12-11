import axios from 'axios';
import { 
  fetchCharacterStart, 
  fetchCharacterSuccess, 
  fetchCharacterFailure, 
  updateCharacter 
} from '../slices/characterSlice';

// Função para buscar os dados do personagem
export const fetchCharacter = (id, token) => async (dispatch) => {
  dispatch(fetchCharacterStart());  // Inicia o carregamento

  try {
    const response = await axios.get(
      `https://assrpgsite-be-production.up.railway.app/api/characters/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch(fetchCharacterSuccess(response.data));  // Atualiza o estado com os dados
  } catch (error) {
    dispatch(fetchCharacterFailure('Erro ao carregar os dados do personagem'));  // Caso de erro
  }
};

// Função para atualizar os dados do personagem
export const updateCharacterData = (id, token, updatedData) => async (dispatch) => {
  try {
    const response = await axios.put(
      `https://assrpgsite-be-production.up.railway.app/api/characters/${id}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch(updateCharacter(response.data));  // Atualiza o estado com os novos dados
  } catch (error) {
    console.error('Erro ao atualizar os dados:', error.message);
  }
};