import { updateInstincts, setLoading, setError } from '../slices/instinctsSlice';
import api from '../../api';
import { normalizeCharacterInstincts } from '../../utils/characterStats';

export const fetchInstincts = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.get(`/characters/${id}/instincts`);
    
    if (response?.data) {
      // Garantir que o formato está correto
      const normalizedInstincts = normalizeCharacterInstincts(response.data);
      dispatch(updateInstincts(normalizedInstincts));
    }
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export const saveInstinctsToBackend = (id, updatedInstincts) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.put(`/characters/${id}/instincts`, { instincts: updatedInstincts });
    if (response?.data?.instincts) {
      dispatch(updateInstincts(normalizeCharacterInstincts(response.data, updatedInstincts)));
    }
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};
