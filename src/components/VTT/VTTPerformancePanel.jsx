import React, { useEffect, useState } from 'react';
import styles from '../../pages/VTT.module.css';
import { DEBUG_VTT_PERFORMANCE, getVttPerformanceMetrics } from '../../utils/vttPerformance';

const readMemoryMb = () => {
  const bytes = window.performance?.memory?.usedJSHeapSize;
  return Number.isFinite(bytes) ? Math.round(bytes / 1024 / 1024) : null;
};

const VTTPerformancePanel = ({ tokens, drawings, fogAreas, revision, pending, historySize }) => {
  const [runtime, setRuntime] = useState(() => ({ ...getVttPerformanceMetrics(), fps: 0, memoryMb: readMemoryMb() }));

  useEffect(() => {
    if (!DEBUG_VTT_PERFORMANCE) return undefined;
    let frameId;
    let frames = 0;
    let lastSample = performance.now();
    let fps = 0;

    const countFrame = (now) => {
      frames += 1;
      if (now - lastSample >= 500) {
        fps = Math.round((frames * 1000) / (now - lastSample));
        frames = 0;
        lastSample = now;
      }
      frameId = requestAnimationFrame(countFrame);
    };
    frameId = requestAnimationFrame(countFrame);

    const intervalId = window.setInterval(() => {
      setRuntime({ ...getVttPerformanceMetrics(), fps, memoryMb: readMemoryMb() });
    }, 500);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearInterval(intervalId);
    };
  }, []);

  if (!DEBUG_VTT_PERFORMANCE) return null;

  return (
    <aside className={styles.performancePanel} aria-label="Diagnóstico de performance do VTT">
      <strong>VTT PERF</strong>
      <span>FPS <b>{runtime.fps}</b></span>
      <span>Tokens <b>{tokens}</b></span>
      <span>Desenhos <b>{drawings}</b></span>
      <span>Fog <b>{fogAreas}</b></span>
      <span>Revisão <b>{revision}</b></span>
      <span>Fila <b>{pending}</b></span>
      <span>Último ack <b>{runtime.lastAckMs || 0} ms</b></span>
      <span>Renders mapa <b>{runtime.mapRenders}</b></span>
      <span>Renders tokens <b>{runtime.tokenRenders}</b></span>
      <span>Commit mapa <b>{runtime.lastMapCommitMs?.toFixed?.(1) || 0} ms</b></span>
      <span>Troca de cena <b>{runtime.lastSceneSwitchMs?.toFixed?.(1) || 0} ms</b></span>
      <span>Histórico <b>{historySize}</b></span>
      <span>Heap <b>{runtime.memoryMb === null ? 'n/d' : `${runtime.memoryMb} MB`}</b></span>
    </aside>
  );
};

export default React.memo(VTTPerformancePanel);
