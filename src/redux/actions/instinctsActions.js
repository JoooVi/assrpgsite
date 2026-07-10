import { updateInstincts, setLoading, setError, setSelectedInstinct } from '../slices/instinctsSlice';
import api from '../../api';

export const fetchInstincts = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await api.get(`/characters/${id}/instincts`);
    
    if (response?.data) {
      // Garantir que o formato está correto
      dispatch(updateInstincts(response.data.instincts || {}));
      dispatch(setSelectedInstinct(response.data.instincts || {}));
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
      dispatch(updateInstincts(response.data.instincts));
    }
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};
