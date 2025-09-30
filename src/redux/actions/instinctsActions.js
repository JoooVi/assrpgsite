import axios from 'axios';
import { updateInstincts, setLoading, setError, setSelectedInstinct } from '../slices/instinctsSlice';

export const fetchInstincts = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/instincts`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
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
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `https://assrpgsite-be-production.up.railway.app/api/characters/${id}/instincts`,
      { instincts: updatedInstincts },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (response?.data?.instincts) {
      dispatch(updateInstincts(response.data.instincts));
    }
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};