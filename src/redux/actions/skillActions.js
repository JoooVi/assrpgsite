import api from "../../api";
import { updateSkills } from "../slices/skillsSlice";
import { normalizeCharacterSkills, splitCharacterSkills } from "../../utils/characterStats";

export const saveSkillsToBackend = (id, skills) => async (dispatch) => {
  const normalizedSkills = Object.entries(skills).reduce((acc, [key, value]) => {
    acc[key] = parseInt(value, 10) || 0;
    return acc;
  }, {});

  const { knowledge, practices } = splitCharacterSkills(normalizedSkills);

  const response = await api.put(`/characters/${id}/skills`, {
    skills: { knowledge, practices },
  });

  const savedCharacter = response.data?.character || response.data;
  const savedSkills = normalizeCharacterSkills(savedCharacter, normalizedSkills);
  dispatch(updateSkills(savedSkills));
  return { ...response.data, skills: savedSkills };
};
