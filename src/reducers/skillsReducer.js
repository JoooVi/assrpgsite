// src/reducers/skillsReducer.js

const initialState = {
    skills: {},
    instincts: {},
  };
  
  const skillsReducer = (state = initialState, action) => {
    switch (action.type) {
      case "SET_SKILLS":
        return {
          ...state,
          skills: action.payload,
        };
      case "SET_INSTINCTS":
        return {
          ...state,
          instincts: action.payload,
        };
      case "UPDATE_SKILL":
        return {
          ...state,
          skills: {
            ...state.skills,
            [action.payload.key]: action.payload.value,
          },
        };
      case "UPDATE_INSTINCT":
        return {
          ...state,
          instincts: {
            ...state.instincts,
            [action.payload.key]: action.payload.value,
          },
        };
      default:
        return state;
    }
  };
  
  export default skillsReducer;  