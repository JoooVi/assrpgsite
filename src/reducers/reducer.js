// reducer.js
const characterReducer = (state = {}, action) => {
    switch (action.type) {
      case 'SET_CHARACTER':
        return {
          ...state,
          ...action.payload,
        };
      default:
        return state;
    }
  };
  
  export default characterReducer;  