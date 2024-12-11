// src/actions/skillsActions.js

export const setSkills = (skills) => {
    return {
      type: "SET_SKILLS",
      payload: skills,
    };
  };
  
  export const setInstincts = (instincts) => {
    return {
      type: "SET_INSTINCTS",
      payload: instincts,
    };
  };
  
  export const updateSkill = (key, value) => {
    return {
      type: "UPDATE_SKILL",
      payload: { key, value },
    };
  };
  
  export const updateInstinct = (key, value) => {
    return {
      type: "UPDATE_INSTINCT",
      payload: { key, value },
    };
  };  