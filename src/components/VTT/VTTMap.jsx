import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Text as KonvaText, Rect as KonvaRect, Circle } from 'react-konva';
import useImage from 'use-image';
import VTTToken from './VTTToken';

const ZOOM_BY = 1.08;
const GRID_TO_FEET = 5;
const GRID_TO_METERS = 1.5;

const VTTMap = ({
  mapUrl,
  tokens,
  updateTokenPosition,
  updateTokenProps,
  toggleTokenVisibility,
  isMaster,
  showGrid,
  showMapLayer,
  showTokenLayer,
  showGmLayer = true,
  layerOrder = ['map', 'grid', 'token', 'gm'],
  gridSize,
  gridOpacity,
  gridColor = '#334466',
  mapScaleMultiplier = 1,
  selectedTokenId,
  selectedTokenIds,
  setSelectedTokenId,
  setSelectedTokenIds,
  cameraResetKey,
  activeTool = 'select',
  drawColor = '#ffb347',
  drawWidth = 3,
  rulerUnit = 'sq',
  rulerMultiplier = 1.5,
  rulerMoveBudget = 0,
  undoSignal = 0,
  redoSignal = 0,
  onTokenContextMenu,
  initialDrawings = [],
  onAddDrawing,
  onAddShapeToken,
  onRemoveDrawing,
  onEditLabel,
  activeEditorLayer = 'token'
}) => {
  const [image, status] = useImage(mapUrl, 'anonymous');
  const stageRef = useRef(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: mapScaleMultiplier || 1 });
  const cameraRef = useRef({ x: 0, y: 0, scale: mapScaleMultiplier || 1 });
  const [isTokenTransforming, setIsTokenTransforming] = useState(false);
  const [isRightClickPanning, setIsRightClickPanning] = useState(false);
  const lastPointerPositionRef = useRef(null);

  const [drawLines, setDrawLines] = useState(initialDrawings.filter(d => d.type === 'line' || !d.type));
  const [textNotes, setTextNotes] = useState(initialDrawings.filter(d => d.type === 'text'));

  useEffect(() => {
    setDrawLines(initialDrawings.filter(d => d.type === 'line' || !d.type));
    setTextNotes(initialDrawings.filter(d => d.type === 'text'));
  }, [initialDrawings]);

  const drawLineIdRef = useRef('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [rulerStart, setRulerStart] = useState(null);
  const [rulerEnd, setRulerEnd] = useState(null);
  const [rulerFollowTokenId, setRulerFollowTokenId] = useState('');
  const [rulerFollowName, setRulerFollowName] = useState('');

  // Input de texto inline (posição na tela)
  const [textInput, setTextInput] = useState(null);
  const textInputRef = useRef(null);

  useEffect(() => {
    if (textInput && textInputRef.current) textInputRef.current.focus();
  }, [textInput]);

  const [isSelecting, setIsSelecting] = useState(false);

  const [selectionRect, setSelectionRect] = useState(null);
  const selectionStartRef = useRef(null);
  const dragGroupRef = useRef(null);
  const [panSuspended, setPanSuspended] = useState(false);

  const historyRef = useRef([]);
  const redoRef = useRef([]);
  const snapshotBeforeActionRef = useRef(null);

  const stageWidth = window.innerWidth;
  const stageHeight = window.innerHeight;

  const mapWidth = image?.width || stageWidth;
  const mapHeight = image?.height || stageHeight;

  // Separação de visibilidade por camadas
  const visibleTokens = useMemo(() => (isMaster ? tokens : tokens.filter((t) => t.layer !== 'gm')), [isMaster, tokens]);
  const selectableTokens = useMemo(() => (isMaster ? tokens : tokens.filter((t) => t.layer !== 'gm' && t.layer !== 'map')), [isMaster, tokens]);
  const mapTokens = useMemo(() => visibleTokens.filter((t) => t.layer === 'map'), [visibleTokens]);
  const gmTokens = useMemo(() => visibleTokens.filter((t) => t.layer === 'gm'), [visibleTokens]);
  const baseTokens = useMemo(() => visibleTokens.filter((t) => t.layer !== 'map' && t.layer !== 'gm'), [visibleTokens]);

  // Bloqueio de interação baseado na camada
  const canDragToken = (token) => {
    if (!token) return false;
    if (isMaster && activeEditorLayer !== token.layer) return false;
    if (!isMaster && token.layer !== 'token') return false;
    return activeTool === 'select' || activeTool === 'ruler' || activeTool === 'pan';
  };

  const canTransformToken = (token) => {
    if (!token) return false;
    if (isMaster && activeEditorLayer !== token.layer) return false;
    if (!isMaster && token.layer !== 'token') return false;
    return activeTool === 'select' && selectedTokenId === token.id;
  };

  const safeSelectedIds = Array.isArray(selectedTokenIds) && selectedTokenIds.length ? selectedTokenIds : (selectedTokenId ? [selectedTokenId] : []);

  const setSelection = useCallback((ids) => {
    if (setSelectedTokenIds) setSelectedTokenIds(ids);
    if (setSelectedTokenId) setSelectedTokenId(ids[0] || null);
  }, [setSelectedTokenId, setSelectedTokenIds]);

  const getSnapshot = useCallback(() => ({
    drawLines: [...drawLines],
    textNotes: [...textNotes]
  }), [drawLines, textNotes]);

  const applySnapshot = useCallback((snapshot) => {
    setDrawLines(snapshot?.drawLines || []);
    setTextNotes(snapshot?.textNotes || []);
  }, []);

  const pushHistory = useCallback((snapshot) => {
    historyRef.current.push(snapshot);
    if (historyRef.current.length > 120) historyRef.current.shift();
    redoRef.current = [];
  }, []);

  useEffect(() => {
    const nextCam = { x: 0, y: 0, scale: mapScaleMultiplier || 1 };
    cameraRef.current = nextCam;
    setCamera(nextCam);
  }, [cameraResetKey, mapScaleMultiplier]);

  useEffect(() => {
    if (!undoSignal) return;
    const previous = historyRef.current.pop();
    if (!previous) return;
    redoRef.current.push(getSnapshot());
    applySnapshot(previous);
  }, [applySnapshot, getSnapshot, undoSignal]);

  useEffect(() => {
    if (!redoSignal) return;
    const next = redoRef.current.pop();
    if (!next) return;
    historyRef.current.push(getSnapshot());
    applySnapshot(next);
  }, [applySnapshot, getSnapshot, redoSignal]);

  const gridLines = useMemo(() => {
    if (!showGrid || !gridSize || gridSize <= 0) return [];
    const lines = [];
    // Converter a cor hex + opacidade para rgba
    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    };
    const stroke = hexToRgba(gridColor, gridOpacity);
    for (let x = 0; x <= mapWidth; x += gridSize) {
      lines.push(<Line key={`grid-v-${x}`} points={[x, 0, x, mapHeight]} stroke={stroke} strokeWidth={1} listening={false} />);
    }
    for (let y = 0; y <= mapHeight; y += gridSize) {
      lines.push(<Line key={`grid-h-${y}`} points={[0, y, mapWidth, y]} stroke={stroke} strokeWidth={1} listening={false} />);
    }
    return lines;
  }, [showGrid, gridSize, mapWidth, mapHeight, gridOpacity, gridColor]);

  const getTokenBounds = (token) => {
    const scale = Number(token?.scale || 1);
    const radius = 35 * scale;
    return {
      x: (token?.x ?? 0) - radius,
      y: (token?.y ?? 0) - radius,
      width: radius * 2,
      height: radius * 2
    };
  };

  const rectsIntersect = (a, b) => (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );

  const getWorldPointer = (stage) => {
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    return {
      x: (pointer.x - stage.x()) / stage.scaleX(),
      y: (pointer.y - stage.y()) / stage.scaleY()
    };
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale
    };
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * ZOOM_BY : oldScale / ZOOM_BY;
    const base = mapScaleMultiplier || 1;
    const clampedScale = Math.max(0.2 * base, Math.min(4 * base, newScale));
    const nextCam = {
      scale: clampedScale,
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale
    };
    cameraRef.current = nextCam;
    setCamera(nextCam);
  };

  const currentMeasure = useMemo(() => {
    if (!rulerStart || !rulerEnd) return null;
    const dx = rulerEnd.x - rulerStart.x;
    const dy = rulerEnd.y - rulerStart.y;
    const px = Math.sqrt(dx * dx + dy * dy);
    const cells = gridSize > 0 ? px / gridSize : 0;
    let value = px;
    let unitLabel = 'sq';
    if (rulerUnit === 'ft') {
      value = cells * rulerMultiplier;
      unitLabel = 'ft';
    } else if (rulerUnit === 'm') {
      value = cells * rulerMultiplier;
      unitLabel = 'm';
    } else if (rulerUnit === 'sq') {
      value = cells * rulerMultiplier;
      unitLabel = 'sq';
    } else {
      value = px;
      unitLabel = 'px';
    }
    const safeBudget = Number(rulerMoveBudget || 0);
    const overBudget = safeBudget > 0 && value > safeBudget;
    return {
      px, value, unitLabel,
      label: `${unitLabel === 'px' ? Math.round(value) : value.toFixed(1)}${unitLabel}`,
      movementLabel: safeBudget > 0 ? `${unitLabel === 'px' ? Math.round(value) : value.toFixed(1)}/${safeBudget} ${unitLabel}` : '',
      overBudget
    };
  }, [gridSize, rulerEnd, rulerMoveBudget, rulerStart, rulerUnit, rulerMultiplier]);

  const renderToken = (token, forceOpacity = null) => (
    <VTTToken
      key={token.id}
      {...token}
      isMaster={isMaster}
      onDragEnd={updateTokenPosition}
      onToggleVisibility={toggleTokenVisibility}
      selected={safeSelectedIds.includes(token.id)}
      onSelect={() => setSelection([token.id])}
      onUpdateToken={updateTokenProps}
      canDrag={canDragToken(token)}
      canTransform={canTransformToken(token)}
      onTokenPointerDown={(tokenId) => {
        setSelection([tokenId]);
        if (activeTool === 'pan') {
          setPanSuspended(true);
          stageRef.current?.draggable(false);
        }
      }}
      onContextMenu={(evt, info) => onTokenContextMenu?.(evt, info)}
      onEditLabel={onEditLabel}
      gridSize={gridSize}
      forceOpacity={forceOpacity || (token.layer === 'gm' ? 0.55 : 1)}
      onInteractionStart={() => setIsTokenTransforming(true)}
      onInteractionEnd={() => setIsTokenTransforming(false)}
      onTokenDragStart={(tokenInfo) => {
        if (activeTool === 'pan') {
          setPanSuspended(true);
          stageRef.current?.draggable(false);
        }
        if (safeSelectedIds.length > 1 && safeSelectedIds.includes(tokenInfo?.id)) {
          const startPositions = {};
          safeSelectedIds.forEach((id) => {
            const found = tokens.find((t) => String(t.id) === String(id));
            if (found) startPositions[id] = { x: found.x, y: found.y };
          });
          dragGroupRef.current = { anchorId: tokenInfo?.id, startPositions };
        } else {
          dragGroupRef.current = null;
        }
        if (activeTool !== 'ruler') return;
        setRulerFollowTokenId(tokenInfo?.id || '');
        setRulerFollowName(tokenInfo?.name || 'Token');
        setRulerStart({ x: tokenInfo?.x ?? 0, y: tokenInfo?.y ?? 0 });
        setRulerEnd({ x: tokenInfo?.x ?? 0, y: tokenInfo?.y ?? 0 });
      }}
      onTokenDragMove={(tokenInfo) => {
        if (dragGroupRef.current && dragGroupRef.current.anchorId === tokenInfo?.id) {
          const { startPositions } = dragGroupRef.current;
          const anchor = startPositions?.[tokenInfo?.id];
          if (anchor) {
            const dx = (tokenInfo?.x ?? 0) - anchor.x;
            const dy = (tokenInfo?.y ?? 0) - anchor.y;
            Object.entries(startPositions).forEach(([id, startPos]) => {
              if (String(id) === String(tokenInfo?.id)) return;
              updateTokenPosition(id, startPos.x + dx, startPos.y + dy);
            });
          }
        }
        if (activeTool !== 'ruler') return;
        setRulerEnd({ x: tokenInfo?.x ?? 0, y: tokenInfo?.y ?? 0 });
      }}
      onTokenDragEnd={(tokenInfo) => {
        if (activeTool === 'pan') {
          setPanSuspended(false);
          stageRef.current?.draggable(activeTool === 'pan' && !isTokenTransforming);
        }
        if (dragGroupRef.current && dragGroupRef.current.anchorId === tokenInfo?.id) {
          dragGroupRef.current = null;
        }
        if (activeTool !== 'ruler') return;
        setRulerEnd({ x: tokenInfo?.x ?? 0, y: tokenInfo?.y ?? 0 });
      }}
    />
  );

  // Renderização das camadas com as novas permissões do mestre
  const layerNodes = {
    map: showMapLayer ? (
      <Layer id="map-layer" key="map-layer">
        {image && (
          <KonvaImage
            key={mapUrl}
            image={image}
            x={0} y={0}
            width={image.width}
            height={image.height}
            listening={activeTool === 'select' && isMaster && activeEditorLayer === 'map'}
            onContextMenu={(e) => {
              e.cancelBubble = true;
              if (isMaster && activeEditorLayer === 'map') onTokenContextMenu?.(e, 'background-map');
            }}
          />
        )}
        {mapTokens.map(t => renderToken(t, isMaster ? 0.9 : 1))}
      </Layer>
    ) : null,
    grid: showGrid ? <Layer id="grid-layer" key="grid-layer" listening={false}>{gridLines}</Layer> : null,
    token: showTokenLayer ? (
      <Layer id="token-layer" key="token-layer">
        {baseTokens.map(t => renderToken(t))}
      </Layer>
    ) : null,
    gm: isMaster && showGmLayer ? (
      <Layer id="gm-layer" key="gm-layer">
        {gmTokens.map(t => renderToken(t))}
      </Layer>
    ) : null
  };

  return (
    <>
    <Stage
      ref={stageRef}
      width={stageWidth}
      height={stageHeight}
      x={camera.x}
      y={camera.y}
      scaleX={camera.scale}
      scaleY={camera.scale}
      draggable={activeTool === 'pan' && !isTokenTransforming && !panSuspended}
      onContextMenu={(e) => e.evt.preventDefault()}
      onMouseDown={(e) => {
        if (e.evt.button === 2) {
          setIsRightClickPanning(true);
          lastPointerPositionRef.current = { x: e.evt.clientX, y: e.evt.clientY };
          return;
        }

        const stage = e.target.getStage();
        const pos = getWorldPointer(stage);
        if (!pos) return;

        if (['draw', 'rect', 'circle'].includes(activeTool)) {
          snapshotBeforeActionRef.current = getSnapshot();
          let type = 'line';
          if (activeTool === 'rect') type = 'rect';
          if (activeTool === 'circle') type = 'circle';

          const newShape = {
            id: `shape-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            type,
            points: [pos.x, pos.y, pos.x, pos.y],
            color: drawColor,
            width: Number(drawWidth) || 3
          };
          drawLineIdRef.current = newShape.id;
          setIsDrawing(true);
          setDrawLines((prev) => [...prev, newShape]);
          return;
        }

        if (activeTool === 'ruler') {
          const clickedOnToken = e.target.findAncestor('.token-node', true);
          if (clickedOnToken) {
            const tokenId = clickedOnToken.id();
            const tokenName = clickedOnToken.getAttr('tokenName') || 'Token';
            setRulerFollowTokenId(tokenId || '');
            setRulerFollowName(tokenName);
            const followed = selectableTokens.find((t) => String(t.id) === String(tokenId));
            const start = followed ? { x: followed.x, y: followed.y } : pos;
            setRulerStart(start);
            setRulerEnd(pos);
          } else {
            setRulerFollowTokenId('');
            setRulerFollowName('');
            setRulerStart(pos);
            setRulerEnd(pos);
          }
          return;
        }

        const target = e.target;
        const clickedOnToken = target.findAncestor('.token-node', true);
        const nodeName = typeof target.name === 'function' ? target.name() : '';
        const parentClass = target.getParent()?.className || '';
        const clickedOnTransformerHandle =
          parentClass === 'Transformer' || nodeName === 'rotater' || nodeName.includes('anchor') || nodeName === 'middle-left' || nodeName === 'middle-right';

        if (activeTool === 'pan') {
          if (!clickedOnToken) setPanSuspended(false);
          return;
        }

        if (activeTool === 'select' && !clickedOnToken && !clickedOnTransformerHandle) {
          if (isMaster) {
            setSelection([]);
            setIsSelecting(true);
            selectionStartRef.current = pos;
            setSelectionRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
          } else {
            setSelection([]);
          }
        }

        if (isTokenTransforming) return;
        if (!clickedOnToken && !clickedOnTransformerHandle) setSelection([]);
      }}
      onMouseMove={(e) => {
        if (isRightClickPanning) {
          const dx = e.evt.clientX - (lastPointerPositionRef.current?.x || e.evt.clientX);
          const dy = e.evt.clientY - (lastPointerPositionRef.current?.y || e.evt.clientY);
          setCamera((prev) => {
            const nextCam = { ...prev, x: prev.x + dx, y: prev.y + dy };
            cameraRef.current = nextCam;
            return nextCam;
          });
          lastPointerPositionRef.current = { x: e.evt.clientX, y: e.evt.clientY };
          return;
        }

        const stage = e.target.getStage();
        const pos = getWorldPointer(stage);
        if (!pos) return;

        if (isSelecting && selectionStartRef.current) {
          const start = selectionStartRef.current;
          const x = Math.min(start.x, pos.x);
          const y = Math.min(start.y, pos.y);
          const width = Math.abs(pos.x - start.x);
          const height = Math.abs(pos.y - start.y);
          setSelectionRect({ x, y, width, height });
          return;
        }

        if (['rect', 'circle'].includes(activeTool) && isDrawing) {
          setDrawLines((prev) => {
            if (!prev.length) return prev;
            const next = [...prev];
            const last = next[next.length - 1];
            // Overwrite the last 2 points (current X, Y)
            next[next.length - 1] = { ...last, points: [last.points[0], last.points[1], pos.x, pos.y] };
            return next;
          });
          return;
        }

        if (activeTool === 'draw' && isDrawing) {
          setDrawLines((prev) => {
            if (!prev.length) return prev;
            const next = [...prev];
            const last = next[next.length - 1];
            next[next.length - 1] = { ...last, points: [...last.points, pos.x, pos.y] };
            return next;
          });
          return;
        }

        if (activeTool === 'ruler' && rulerStart) {
          setRulerEnd(pos);
        }
      }}
      onDblClick={(e) => {
        if (activeTool !== 'text') return;
        const stage = e.target.getStage();
        const pos = getWorldPointer(stage);
        if (!pos) return;
        // Pegar posição de tela para posicionar o input HTML
        const stageEl = stage.container().getBoundingClientRect();
        const pointer = stage.getPointerPosition();
        setTextInput({
          screenX: stageEl.left + pointer.x,
          screenY: stageEl.top + pointer.y,
          worldX: pos.x,
          worldY: pos.y
        });
      }}
      onMouseUp={(e) => {
        if (isRightClickPanning) {
          setIsRightClickPanning(false);
          lastPointerPositionRef.current = null;
          return;
        }

        if (panSuspended) {
          setPanSuspended(false);
          const stage = e.target.getStage();
          stage.draggable(activeTool === 'pan' && !isTokenTransforming);
        }

        if (isSelecting) {
          const rect = selectionRect;
          if (rect) {
            if (rect.width < 4 && rect.height < 4) {
              setSelection([]);
            } else {
              const selected = selectableTokens
                .filter((t) => rectsIntersect(rect, getTokenBounds(t)))
                .map((t) => t.id);
              setSelection(selected);
            }
          }
          setIsSelecting(false);
          setSelectionRect(null);
          selectionStartRef.current = null;
        }

        if (isTokenTransforming) setIsTokenTransforming(false);

        if (isDrawing) {
          setIsDrawing(false);
          const lineId = drawLineIdRef.current;
          const latestLine = drawLines.find((line) => line.id === lineId);

          drawLineIdRef.current = '';

          if (latestLine) {
            if (['rect', 'circle'].includes(latestLine.type) && onAddShapeToken) {
              // Shapes geométricas viram token oficial
              setDrawLines((prev) => prev.filter(l => l.id !== lineId));
              onAddShapeToken(latestLine);
            } else if (latestLine.type === undefined || latestLine.type === 'line') {
              // Traço de lápis vira drawing token
              setDrawLines((prev) => prev.filter(l => l.id !== lineId));
              if (onAddShapeToken) onAddShapeToken({ ...latestLine, type: 'drawing' });
            } else if (onAddDrawing) {
              onAddDrawing(latestLine);
            }
          }

          if (snapshotBeforeActionRef.current) {
            pushHistory(snapshotBeforeActionRef.current);
            snapshotBeforeActionRef.current = null;
          }
        }

        if (activeTool === 'ruler') {
          setRulerStart(null);
          setRulerEnd(null);
          setRulerFollowTokenId('');
          setRulerFollowName('');
        }
      }}
      onDragMove={(e) => {
        const stage = e.target.getStage();
        if (e.target !== stage) return;
        setCamera((prev) => {
          const nextCam = { ...prev, x: stage.x(), y: stage.y() };
          cameraRef.current = nextCam;
          return nextCam;
        });
      }}
      onDragEnd={(e) => {
        const stage = e.target.getStage();
        if (e.target !== stage) return;
        setCamera((prev) => {
          const nextCam = { ...prev, x: stage.x(), y: stage.y() };
          cameraRef.current = nextCam;
          return nextCam;
        });
      }}
      onWheel={handleWheel}
      style={{ cursor: isRightClickPanning ? 'grabbing' : activeTool === 'pan' ? 'grab' : ['draw', 'rect', 'circle'].includes(activeTool) ? 'crosshair' : activeTool === 'ruler' ? 'crosshair' : activeTool === 'erase' ? 'not-allowed' : activeTool === 'text' ? 'text' : 'default' }}
    >
      {layerOrder.map((layerKey) => layerNodes[layerKey] || null)}

      <Layer id="annotation-layer" key="annotation-layer">
        {drawLines.map((line, idx) => {
          const key = line.id || `draw-${idx}`;
          const isErasing = activeTool === 'erase';
          const onMouseDownErase = (e) => {
            if (!isErasing) return;
            e.cancelBubble = true;
            if (!line.id) return;
            setDrawLines((prev) => prev.filter((item) => item.id !== line.id));
            if (onRemoveDrawing) onRemoveDrawing(line.id);
          };

          if (line.type === 'rect') {
            const width = line.points[2] - line.points[0];
            const height = line.points[3] - line.points[1];
            return (
              <KonvaRect
                key={key}
                x={line.points[0]} y={line.points[1]} width={width} height={height}
                stroke={line.color} strokeWidth={line.width} listening={isErasing} onMouseDown={onMouseDownErase}
              />
            );
          }

          if (line.type === 'circle') {
            const dx = line.points[2] - line.points[0];
            const dy = line.points[3] - line.points[1];
            const radius = Math.sqrt(dx * dx + dy * dy);
            return (
              <Circle
                key={key}
                x={line.points[0]} y={line.points[1]} radius={radius}
                stroke={line.color} strokeWidth={line.width} listening={isErasing} onMouseDown={onMouseDownErase}
              />
            );
          }

          // Default is 'line'
          return (
            <Line
              key={key}
              points={line.points} stroke={line.color} strokeWidth={line.width}
              lineCap="round" lineJoin="round" listening={isErasing} onMouseDown={onMouseDownErase}
            />
          );
        })}

        {isSelecting && selectionRect && (
          <KonvaRect x={selectionRect.x} y={selectionRect.y} width={selectionRect.width} height={selectionRect.height} fill="rgba(95,180,255,0.18)" stroke="rgba(122,215,255,0.8)" strokeWidth={1} dash={[6, 4]} />
        )}

      </Layer>

      {/* Camada HUD superior: régua sempre por cima dos tokens */}
      <Layer listening={false}>
        {rulerStart && rulerEnd && (
          <>
            <Line points={[rulerStart.x, rulerStart.y, rulerEnd.x, rulerEnd.y]} stroke={currentMeasure?.overBudget ? '#ff8080' : '#75e0ff'} strokeWidth={3} dash={[8, 4]} opacity={0.8} />
            <Circle x={rulerStart.x} y={rulerStart.y} radius={4} fill={currentMeasure?.overBudget ? '#ff8080' : '#75e0ff'} />
            <Circle x={rulerEnd.x} y={rulerEnd.y} radius={6} fill={currentMeasure?.overBudget ? '#ff8080' : '#75e0ff'} stroke="#fff" strokeWidth={1} />
            {currentMeasure && (() => {
              const tooltipText = `${rulerFollowName ? `Seguindo ${rulerFollowName} | ` : ''}${currentMeasure.label}${currentMeasure.movementLabel ? ` | ${currentMeasure.movementLabel}` : ''}`;
              const tooltipW = Math.max(80, tooltipText.length * 6.8 + 24);
              return (
                <>
                  <KonvaRect
                    x={rulerEnd.x + 12}
                    y={rulerEnd.y - 14}
                    width={tooltipW}
                    height={26}
                    fill="rgba(20,25,32,0.95)"
                    cornerRadius={6}
                    stroke={currentMeasure.overBudget ? 'rgba(255,120,120,0.8)' : '#3d6b8c'}
                    strokeWidth={1.5}
                    shadowColor="#000"
                    shadowBlur={10}
                    shadowOpacity={0.6}
                  />
                  <KonvaText
                    x={rulerEnd.x + 18}
                    y={rulerEnd.y - 8}
                    text={tooltipText}
                    fontSize={11}
                    fontFamily="system-ui, sans-serif"
                    fontStyle="bold"
                    fill={currentMeasure.overBudget ? '#ffd4d4' : '#bae6ff'}
                  />
                </>
              );
            })()}
          </>
        )}
      </Layer>
    </Stage>

    {/* Input de Texto Inline (ferramenta T) */}
    {textInput && (
      <div style={{
        position: 'fixed',
        left: textInput.screenX,
        top: textInput.screenY,
        zIndex: 99999,
        transform: 'translateY(-50%)',
      }}>
        <input
          ref={textInputRef}
          type="text"
          placeholder="Digite o texto..."
          autoFocus
          style={{
            background: 'rgba(14, 20, 28, 0.96)',
            border: '1.5px solid #3d6b8c',
            borderRadius: 6,
            color: '#d8ecff',
            fontSize: 14,
            padding: '6px 12px',
            outline: 'none',
            minWidth: 180,
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            fontFamily: 'system-ui, sans-serif',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setTextInput(null);
              return;
            }
            if (e.key === 'Enter') {
              const txt = e.target.value.trim();
              if (txt && onAddShapeToken) {
                onAddShapeToken({ type: 'text', text: txt, x: textInput.worldX, y: textInput.worldY });
              }
              setTextInput(null);
            }
          }}
          onBlur={(e) => {
            const txt = e.target.value.trim();
            if (txt && onAddShapeToken) {
              onAddShapeToken({ type: 'text', text: txt, x: textInput.worldX, y: textInput.worldY });
            }
            setTextInput(null);
          }}
        />
        <div style={{ color: '#5a7a9a', fontSize: 10, marginTop: 3, textAlign: 'center' }}>Enter para confirmar · Esc para cancelar</div>
      </div>
    )}
  </>
  );
};

export default VTTMap;