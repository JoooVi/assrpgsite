export const DEBUG_VTT_PERFORMANCE =
  process.env.NODE_ENV !== 'production' &&
  process.env.REACT_APP_DEBUG_VTT_PERFORMANCE === 'true';

const metrics = {
  mapRenders: 0,
  tokenRenders: 0,
  lastAckMs: 0,
  lastMapCommitMs: 0,
  lastSceneSwitchMs: 0,
};

export const incrementVttPerformanceMetric = (name, amount = 1) => {
  if (!DEBUG_VTT_PERFORMANCE) return;
  metrics[name] = Number(metrics[name] || 0) + amount;
};

export const setVttPerformanceMetric = (name, value) => {
  if (!DEBUG_VTT_PERFORMANCE) return;
  metrics[name] = Number(value || 0);
};

export const getVttPerformanceMetrics = () => ({ ...metrics });
