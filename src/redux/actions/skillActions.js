import api from "../../api";
import { updateSkills } from "../slices/skillsSlice";

const knowledgeKeys = ["geography", "medicine", "security", "biology", "erudition", "engineering"];
const practicesKeys = ["weapons", "athletics", "expression", "stealth", "crafting", "survival"];

export const saveSkillsToBackend = (id, skills) => async (dispatch) => {
  const normalizedSkills = Object.entries(skills).reduce((acc, [key, value]) => {
    acc[key] = parseInt(value, 10) || 0;
    return acc;
  }, {});

  const knowledge = {};
  const practices = {};

  Object.entries(normalizedSkills).forEach(([key, value]) => {
    if (knowledgeKeys.includes(key)) {
      knowledge[key] = value;
    } else if (practicesKeys.includes(key)) {
      practices[key] = value;
    }
  });

  const response = await api.put(`/characters/${id}/skills`, {
    skills: { knowledge, practices },
  });

  dispatch(updateSkills({ ...response.data.knowledge, ...response.data.practices }));
  return response.data;
};
