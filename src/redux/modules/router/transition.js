import { createReducer } from '../../../helpers/redux';

export const START = 'router/transition/START';
const SET_PROGRESS = 'router/transition/SET_PROGRESS';
export const END = 'router/transition/END';

const setProgress = (value = 3) => {
  if (isNaN(Number(value))) throw new Error('Value of progress should be number');
  return {
    type: SET_PROGRESS,
    value: Number(value),
  };
};

export const end = (stepDuration = 400) => {
  return (dispatch, getState) => {
    if (getState().routerTransition.start) {
      dispatch(setProgress(100));
      setTimeout(() => {
        dispatch({
          type: END,
        });
        setTimeout(() => {
          dispatch(setProgress(0));
        }, stepDuration);
      }, stepDuration);
    }
  };
};

export const start = ({ initialProgress = 15, valueIncreaseProgress = 3, stepDuration = 400, startDelay = 1000 } = {}) => {
  if (isNaN(Number(initialProgress))) throw new Error('Initial progress should be number');
  if (isNaN(Number(stepDuration))) throw new Error('Step Duration progress should be number');

  return (dispatch, getState) => {
    if (getState().routerTransition.start) {
      return;
    }

    dispatch({
      type: START,
      initialProgress: Number(initialProgress),
    });

    const increaseProgress = () => {
      const { start: flagStart, progress } = getState().routerTransition;
      if (flagStart && progress < (100 - initialProgress)) {
        dispatch(setProgress(progress + valueIncreaseProgress));
        setTimeout(increaseProgress, stepDuration);
      }
    };
    setTimeout(increaseProgress, startDelay + stepDuration);
  };
};

const initialState = {
  progress: 0,
  start: false,
};

export default createReducer(initialState, {
  [START]: (state, action) => ({ progress: action.initialProgress, start: true }),
  [END]: (state) => Object.assign({}, state, { start: false }),
  [SET_PROGRESS]: (state, action) => Object.assign({}, state, { progress: action.value }),
});
