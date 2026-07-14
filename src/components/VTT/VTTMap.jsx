import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Line, Text as KonvaText, Rect as KonvaRect, Circle, Arrow, Shape } from 'react-konva';
import useImage from 'use-image';
import VTTToken from './VTTToken';
import styles from '../../pages/VTT.module.css';
import { incrementVttPerformanceMetric } from '../../utils/vttPerformance';

const ZOOM_BY = 1.08;
const DRAW_MIN_POINT_DISTANCE = 2.5;
const DRAW_MAX_COORDINATES = 3000;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const clampScreenOverlay = (x, y, width = 300, height = 94, margin = 12) => ({
  left: Math.min(Math.max(Number(x || 0), margin), Math.max(margin, window.innerWidth - width - margin)),
  top: Math.min(Math.max(Number(y || 0), margin), Math.max(margin, window.innerHeight - height - margin)),
});
const shouldAppendDrawPoint = (points = [], x, y) => {
  if (points.length < 2) return true;
  const lastX = points[points.length - 2];
  const lastY = points[points.length - 1];
  const dx = x - lastX;
  const dy = y - lastY;
  return Math.sqrt(dx * dx + dy * dy) >= DRAW_MIN_POINT_DISTANCE;
};
const compactDrawPoints = (points = []) => {
  if (!Array.isArray(points) || points.length <= DRAW_MAX_COORDINATES) return points;
  const step = Math.ceil(points.length / DRAW_MAX_COORDINATES);
  const compacted = [];
  for (let i = 0; i < points.length - 2; i += 2 * step) {
    compacted.push(points[i], points[i + 1]);
  }
  compacted.push(points[points.length - 2], points[points.length - 1]);
  return compacted;
};

const VTTMap = ({
  mapUrl,
  tokens,
  updateTokenPosition,
  updateTokenProps,
  toggleTokenVisibility,
  removeToken,
  isMaster,
  showGrid,
  showMapLayer,
  showTokenLayer,
  showGmLayer = true,
  layerOrder = ['map', 'grid', 'token', 'gm'],
  gridSize,
  gridOpacity,
  gridColor = '#5d120f',
  mapScaleMultiplier = 1,
  selectedTokenId,
  selectedTokenIds,
  setSelectedTokenId,
  setSelectedTokenIds,
  cameraResetKey,
  activeTool = 'select',
  drawColor = '#ffb347',
  drawWidth = 3,
  drawOpacity = 1,
  drawMode = 'pen',
  shapeTool = 'rect',
  fogOfWar = null,
  fogMode = 'reveal',
  fogShape = 'rect',
  onAddFogArea,
  drawFillColor = '#ff3333',
  drawHasFill = false,
  drawFillOpacity = 0.18,
  drawFontSize = 18,
  drawFontFamily = 'Rajdhani',
  drawFontBold = false,
  drawFontItalic = false,
  drawTextUnderline = false,
  drawTextStrokeColor = '#080b0f',
  drawTextStrokeWidth = 0,
  drawTextShadow = true,
  drawTextAlign = 'left',
  drawTextBgColor = '#080808',
  drawTextBgOpacity = 0.72,
  drawTextBg = false,
  eraseSize = 24,
  rulerUnit = 'sq',
  rulerMultiplier = 1.5,
  rulerMoveBudget = 0,
  activeRulers = {},
  currentUserId = '',
  onRulerStart,
  onRulerUpdate,
  onRulerEnd,
  onTokenContextMenu,
  initialDrawings = [],
  onAddDrawing,
  onAddShapeToken,
  onRemoveDrawing,
  onEditLabel,
  onCommitHistory,
  activeEditorLayer = 'token'
}) => {
  incrementVttPerformanceMetric('mapRenders');
  const [image] = useImage(mapUrl, 'anonymous');
  const stageRef = useRef(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: mapScaleMultiplier || 1 });
  const cameraRef = useRef({ x: 0, y: 0, scale: mapScaleMultiplier || 1 });
  const [isTokenTransforming, setIsTokenTransforming] = useState(false);
  const [isRightClickPanning, setIsRightClickPanning] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const [fogDraft, setFogDraft] = useState(null);
  const lastPointerPositionRef = useRef(null);

  const [drawLines, setDrawLines] = useState(initialDrawings.filter(d => d.type === 'line' || !d.type));

  useEffect(() => {
    setDrawLines(initialDrawings.filter(d => d.type === 'line' || !d.type));
  }, [initialDrawings]);

  const drawLineIdRef = useRef('');
  const currentDrawingRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rulerStart, setRulerStart] = useState(null);
  const [rulerEnd, setRulerEnd] = useState(null);
  const [rulerFollowName, setRulerFollowName] = useState('');

  // Input de texto inline (posiÃ§Ã£o na tela)
  const [textInput, setTextInput] = useState(null);
  const textInputRef = useRef(null);
  const textInputCommittedRef = useRef(false);

  useEffect(() => {
    if (textInput && textInputRef.current) textInputRef.current.focus();
  }, [textInput]);

  const [isSelecting, setIsSelecting] = useState(false);

  const [selectionRect, setSelectionRect] = useState(null);
  const selectionStartRef = useRef(null);
  const dragGroupRef = useRef(null);
  const multiSelectionRectRef = useRef(null);
  const multiTransformStartRef = useRef(null);
  const [liveSelectedTokenPositions, setLiveSelectedTokenPositions] = useState(null);
  const [eraserPreview, setEraserPreview] = useState(null);
  const [panSuspended, setPanSuspended] = useState(false);

  const stageWidth = window.innerWidth;
  const stageHeight = window.innerHeight;

  const mapWidth = image?.width || stageWidth;
  const mapHeight = image?.height || stageHeight;
  const normalizedFog = fogOfWar || {};
  const fogAreas = Array.isArray(normalizedFog.areas) ? normalizedFog.areas : [];
  const isFogVisible = Boolean(normalizedFog.enabled || normalizedFog.hiddenFullPage || fogAreas.length);
  const fogOpacity = isMaster
    ? Number(normalizedFog.dmOpacity ?? 0.35)
    : Number(normalizedFog.playerOpacity ?? 1);

  // SeparaÃ§Ã£o de visibilidade por camadas
  const visibleTokens = useMemo(() => (
    isMaster ? tokens : tokens.filter((t) => t.layer !== 'gm' && t.isVisible !== false)
  ), [isMaster, tokens]);
  const selectableTokens = useMemo(() => {
    if (!isMaster) return tokens.filter((t) => t.layer === 'token' && t.isVisible !== false);
    return tokens.filter((t) => t.layer === activeEditorLayer);
  }, [activeEditorLayer, isMaster, tokens]);
  const mapTokens = useMemo(() => visibleTokens.filter((t) => t.layer === 'map'), [visibleTokens]);
  const gmTokens = useMemo(() => visibleTokens.filter((t) => t.layer === 'gm'), [visibleTokens]);
  const baseTokens = useMemo(() => visibleTokens.filter((t) => t.layer !== 'map' && t.layer !== 'gm'), [visibleTokens]);

  // Bloqueio de interaÃ§Ã£o baseado na camada
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
    return activeTool === 'select' && safeSelectedIds.length === 1 && selectedTokenId === token.id;
  };

  const safeSelectedIds = useMemo(() => {
    if (Array.isArray(selectedTokenIds) && selectedTokenIds.length) return selectedTokenIds;
    return selectedTokenId ? [selectedTokenId] : [];
  }, [selectedTokenId, selectedTokenIds]);

  const getTokenBounds = useCallback((token) => {
    const scale = Number(token?.scale || 1);
    const assetType = token?.assetType || 'token';

    if (assetType === 'text') {
      const fontSize = Number(token?.fontSize || 18);
      const textValue = token?.text || token?.name || 'Texto';
      const width = Math.max(90, textValue.length * fontSize * 0.58) * scale;
      const height = (fontSize + 16) * scale;
      return {
        x: Number(token?.x || 0) - 9 * scale,
        y: Number(token?.y || 0) - (fontSize + 12) * scale,
        width: width + 18 * scale,
        height: height + 14 * scale,
      };
    }

    if (assetType === 'drawing' && Array.isArray(token?.points) && token.points.length >= 4) {
      const xs = token.points.filter((_, index) => index % 2 === 0);
      const ys = token.points.filter((_, index) => index % 2 === 1);
      const minX = Math.min(...xs) * scale;
      const minY = Math.min(...ys) * scale;
      const maxX = Math.max(...xs) * scale;
      const maxY = Math.max(...ys) * scale;
      const padding = (Number(token.strokeWidth || token.width || 3) + 10) * scale;
      return {
        x: Number(token?.x || 0) + minX - padding,
        y: Number(token?.y || 0) + minY - padding,
        width: Math.max(1, maxX - minX) + padding * 2,
        height: Math.max(1, maxY - minY) + padding * 2,
      };
    }

    if (assetType === 'token') {
      if (token?.tokenShape === 'freeform') {
        const width = Number(token?.width || token?.radius * 2 || 70) * scale;
        const height = Number(token?.height || token?.radius * 2 || 70) * scale;
        return {
          x: Number(token?.x || 0) - width / 2,
          y: Number(token?.y || 0) - height / 2,
          width,
          height,
        };
      }

      const radius = Number(token?.radius || 35) * scale;
      return {
        x: Number(token?.x || 0) - radius,
        y: Number(token?.y || 0) - radius,
        width: radius * 2,
        height: radius * 2,
      };
    }

    if (assetType === 'shape') {
      if ((token?.shapeType === 'line' || token?.shapeType === 'arrow') && Array.isArray(token?.points) && token.points.length >= 4) {
        const xs = token.points.filter((_, index) => index % 2 === 0);
        const ys = token.points.filter((_, index) => index % 2 === 1);
        const minX = Math.min(...xs) * scale;
        const minY = Math.min(...ys) * scale;
        const maxX = Math.max(...xs) * scale;
        const maxY = Math.max(...ys) * scale;
        const padding = (Number(token.strokeWidth || 3) + 10) * scale;
        return {
          x: Number(token?.x || 0) + minX - padding,
          y: Number(token?.y || 0) + minY - padding,
          width: Math.max(1, maxX - minX) + padding * 2,
          height: Math.max(1, maxY - minY) + padding * 2,
        };
      }

      if (token?.shapeType === 'circle') {
        const radius = Number(token?.radius || token?.width / 2 || 40) * scale;
        return {
          x: Number(token?.x || 0) - radius,
          y: Number(token?.y || 0) - radius,
          width: radius * 2,
          height: radius * 2,
        };
      }

      const width = Number(token?.width || 100) * scale;
      const height = Number(token?.height || 100) * scale;
      return {
        x: Number(token?.x || 0),
        y: Number(token?.y || 0),
        width,
        height,
      };
    }

    if (token?.width || token?.height) {
      const width = Number(token.width || 0) * scale;
      const height = Number(token.height || 0) * scale;
      return {
        x: (token?.x ?? 0) - width / 2,
        y: (token?.y ?? 0) - height / 2,
        width,
        height
      };
    }

    if (token?.radius) {
      const radius = Number(token.radius || 0) * scale;
      return {
        x: (token?.x ?? 0) - radius,
        y: (token?.y ?? 0) - radius,
        width: radius * 2,
        height: radius * 2
      };
    }

    const radius = 35 * scale;
    return {
      x: (token?.x ?? 0) - radius,
      y: (token?.y ?? 0) - radius,
      width: radius * 2,
      height: radius * 2
    };
  }, []);

  const selectedTokens = useMemo(() => safeSelectedIds
    .map((tokenId) => selectableTokens.find((token) => String(token.id) === String(tokenId)))
    .filter(Boolean), [safeSelectedIds, selectableTokens]);

  const selectedTokensWithLivePositions = useMemo(() => selectedTokens.map((token) => {
    const live = liveSelectedTokenPositions?.[String(token.id)];
    return live ? { ...token, x: live.x, y: live.y } : token;
  }), [liveSelectedTokenPositions, selectedTokens]);

  const selectedGroupBounds = useMemo(() => {
    if (selectedTokensWithLivePositions.length <= 1) return null;
    const tokenBounds = selectedTokensWithLivePositions.map(getTokenBounds);
    const minX = Math.min(...tokenBounds.map((item) => item.x));
    const minY = Math.min(...tokenBounds.map((item) => item.y));
    const maxX = Math.max(...tokenBounds.map((item) => item.x + item.width));
    const maxY = Math.max(...tokenBounds.map((item) => item.y + item.height));
    return {
      x: minX,
      y: minY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
    };
  }, [getTokenBounds, selectedTokensWithLivePositions]);

  const setSelection = useCallback((ids) => {
    if (setSelectedTokenIds) setSelectedTokenIds(ids);
    if (setSelectedTokenId) setSelectedTokenId(ids[0] || null);
  }, [setSelectedTokenId, setSelectedTokenIds]);

  const captureMultiTransformStart = useCallback((node) => {
    if (!selectedGroupBounds || selectedTokensWithLivePositions.length <= 1) return;
    onCommitHistory?.();
    multiTransformStartRef.current = {
      bounds: { ...selectedGroupBounds },
      center: {
        x: selectedGroupBounds.x + selectedGroupBounds.width / 2,
        y: selectedGroupBounds.y + selectedGroupBounds.height / 2,
      },
      tokens: selectedTokensWithLivePositions.map((token) => ({
        id: token.id,
        x: token.x ?? 0,
        y: token.y ?? 0,
        rotation: Number(token.rotation || 0),
        scale: Number(token.scale || 1),
      })),
    };
    multiSelectionRectRef.current = node;
    const liveSnapshot = {};
    selectedTokensWithLivePositions.forEach((token) => {
      liveSnapshot[String(token.id)] = { x: token.x ?? 0, y: token.y ?? 0 };
    });
    setLiveSelectedTokenPositions(liveSnapshot);
  }, [onCommitHistory, selectedGroupBounds, selectedTokensWithLivePositions]);

  const applyMultiTransform = useCallback((node) => {
    const start = multiTransformStartRef.current;
    if (!start || !selectedGroupBounds || selectedTokens.length <= 1) return;

    const scaleX = node.scaleX() || 1;
    const scaleY = node.scaleY() || 1;
    const rotation = Number(node.rotation() || 0);
    const avgScale = (Math.abs(scaleX) + Math.abs(scaleY)) / 2;
    const radians = rotation * Math.PI / 180;
    const sin = Math.sin(radians);
    const cos = Math.cos(radians);
    const targetWidth = start.bounds.width * scaleX;
    const targetHeight = start.bounds.height * scaleY;
    const targetCenter = {
      x: node.x() + targetWidth / 2,
      y: node.y() + targetHeight / 2,
    };

    const nextLivePositions = {};
    start.tokens.forEach((snapshot) => {
      const offsetX = snapshot.x - start.center.x;
      const offsetY = snapshot.y - start.center.y;
      const rotatedX = offsetX * cos - offsetY * sin;
      const rotatedY = offsetX * sin + offsetY * cos;
      const nextX = targetCenter.x + rotatedX * avgScale;
      const nextY = targetCenter.y + rotatedY * avgScale;
      nextLivePositions[String(snapshot.id)] = { x: nextX, y: nextY };
      updateTokenPosition(snapshot.id, nextX, nextY, { history: false });
      updateTokenProps(snapshot.id, {
        rotation: Number((snapshot.rotation + rotation).toFixed(1)),
        scale: Number(clamp(snapshot.scale * avgScale, 0.1, 20).toFixed(2)),
      }, { history: false });
    });
    setLiveSelectedTokenPositions(nextLivePositions);
  }, [selectedGroupBounds, selectedTokens.length, updateTokenPosition, updateTokenProps]);

  const finishMultiTransform = useCallback((node) => {
    if (!multiTransformStartRef.current || !selectedGroupBounds || selectedTokens.length <= 1) return;
    applyMultiTransform(node);
    multiTransformStartRef.current = null;
    multiSelectionRectRef.current = null;
    node.scaleX(1);
    node.scaleY(1);
    window.requestAnimationFrame(() => setLiveSelectedTokenPositions(null));
  }, [applyMultiTransform, selectedGroupBounds, selectedTokens.length]);

  const applyTokenSelection = useCallback((tokenId, evt) => {
    const isModifierPressed = Boolean(evt?.evt?.shiftKey || evt?.evt?.metaKey || evt?.evt?.ctrlKey);
    const isAlreadySelected = safeSelectedIds.some((id) => String(id) === String(tokenId));

    if (isModifierPressed) {
      const nextIds = isAlreadySelected
        ? safeSelectedIds.filter((id) => String(id) !== String(tokenId))
        : [...safeSelectedIds, tokenId];
      setSelection(nextIds);
      return;
    }

    if (isAlreadySelected) {
      setSelection([tokenId]);
      return;
    }

    setSelection([tokenId]);
  }, [safeSelectedIds, setSelection]);

  useEffect(() => {
    const nextCam = { x: 0, y: 0, scale: mapScaleMultiplier || 1 };
    cameraRef.current = nextCam;
    setCamera(nextCam);
  }, [cameraResetKey, mapScaleMultiplier]);

  const gridStroke = useMemo(() => {
    const clean = String(gridColor || '#334466').replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16) || 0;
    const g = parseInt(clean.slice(2, 4), 16) || 0;
    const b = parseInt(clean.slice(4, 6), 16) || 0;
    return `rgba(${r},${g},${b},${gridOpacity})`;
  }, [gridColor, gridOpacity]);

  const drawGrid = useCallback((context, shape) => {
    if (!showGrid || !gridSize || gridSize <= 0) return;
    context.beginPath();
    for (let x = 0; x <= mapWidth; x += gridSize) {
      context.moveTo(x, 0);
      context.lineTo(x, mapHeight);
    }
    for (let y = 0; y <= mapHeight; y += gridSize) {
      context.moveTo(0, y);
      context.lineTo(mapWidth, y);
    }
    context.strokeShape(shape);
  }, [gridSize, mapHeight, mapWidth, showGrid]);

  const rectsIntersect = useCallback((a, b) => (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  ), []);

  const distanceToSegment = (point, start, end) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    if (!dx && !dy) {
      const px = point.x - start.x;
      const py = point.y - start.y;
      return Math.sqrt(px * px + py * py);
    }

    const lengthSquared = dx * dx + dy * dy;
    const projection = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared;
    const t = clamp(projection, 0, 1);
    const closestX = start.x + t * dx;
    const closestY = start.y + t * dy;
    const offsetX = point.x - closestX;
    const offsetY = point.y - closestY;
    return Math.sqrt(offsetX * offsetX + offsetY * offsetY);
  };

  const getDrawingBounds = (line) => {
    if (!line?.points?.length) return null;

    if (line.type === 'rect') {
      const x0 = Math.min(line.points[0], line.points[2]);
      const y0 = Math.min(line.points[1], line.points[3]);
      const width = Math.abs(line.points[2] - line.points[0]);
      const height = Math.abs(line.points[3] - line.points[1]);
      return { x: x0, y: y0, width, height };
    }

    if (line.type === 'circle') {
      const dx = line.points[2] - line.points[0];
      const dy = line.points[3] - line.points[1];
      const radius = Math.sqrt(dx * dx + dy * dy);
      return {
        x: line.points[0] - radius,
        y: line.points[1] - radius,
        width: radius * 2,
        height: radius * 2,
      };
    }

    const xs = [];
    const ys = [];
    for (let i = 0; i < line.points.length; i += 2) {
      xs.push(line.points[i]);
      ys.push(line.points[i + 1]);
    }
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
  };

  const isPointInsideDrawing = useCallback((line, point, radius) => {
    if (!line?.points?.length || !point) return false;
    const strokeRadius = radius + Number(line.width || 0) / 2;

    if (line.type === 'rect') {
      const x0 = Math.min(line.points[0], line.points[2]) - strokeRadius;
      const y0 = Math.min(line.points[1], line.points[3]) - strokeRadius;
      const width = Math.abs(line.points[2] - line.points[0]) + strokeRadius * 2;
      const height = Math.abs(line.points[3] - line.points[1]) + strokeRadius * 2;
      return point.x >= x0 && point.x <= x0 + width && point.y >= y0 && point.y <= y0 + height;
    }

    if (line.type === 'circle') {
      const dx = line.points[2] - line.points[0];
      const dy = line.points[3] - line.points[1];
      const baseRadius = Math.sqrt(dx * dx + dy * dy);
      const offsetX = point.x - line.points[0];
      const offsetY = point.y - line.points[1];
      return Math.sqrt(offsetX * offsetX + offsetY * offsetY) <= baseRadius + strokeRadius;
    }

    for (let i = 0; i < line.points.length - 2; i += 2) {
      const start = { x: line.points[i], y: line.points[i + 1] };
      const end = { x: line.points[i + 2], y: line.points[i + 3] };
      if (distanceToSegment(point, start, end) <= strokeRadius) return true;
    }

    const bounds = getDrawingBounds(line);
    if (!bounds) return false;
    return rectsIntersect(
      { x: point.x - strokeRadius, y: point.y - strokeRadius, width: strokeRadius * 2, height: strokeRadius * 2 },
      bounds,
    );
  }, [rectsIntersect]);

  const splitPolylineByEraser = useCallback((points = [], point, radius, strokeWidth = 0) => {
    if (!Array.isArray(points) || points.length < 4 || !point) return [];
    const hitRadius = radius + Number(strokeWidth || 0) / 2;
    const epsilon = 0.001;
    const segments = [];
    let current = [];

    const pushPoint = (target, nextPoint) => {
      const lastX = target[target.length - 2];
      const lastY = target[target.length - 1];
      if (lastX === nextPoint.x && lastY === nextPoint.y) return;
      target.push(nextPoint.x, nextPoint.y);
    };

    const lerpPoint = (start, end, amount) => ({
      x: start.x + (end.x - start.x) * amount,
      y: start.y + (end.y - start.y) * amount,
    });

    for (let i = 0; i < points.length - 2; i += 2) {
      const start = { x: points[i], y: points[i + 1] };
      const end = { x: points[i + 2], y: points[i + 3] };
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const segmentLength = Math.sqrt(dx * dx + dy * dy);
      const segmentWasErased = distanceToSegment(point, start, end) <= hitRadius;

      if (segmentWasErased) {
        if (!segmentLength) {
          if (current.length >= 4) segments.push(current);
          current = [];
          continue;
        }

        const projection = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (segmentLength * segmentLength);
        const hitCenter = clamp(projection, 0, 1);
        const cutSize = hitRadius / segmentLength;
        const leftT = clamp(hitCenter - cutSize, 0, 1);
        const rightT = clamp(hitCenter + cutSize, 0, 1);

        if (leftT > epsilon) {
          if (!current.length) pushPoint(current, start);
          pushPoint(current, lerpPoint(start, end, leftT));
        }

        if (current.length >= 4) segments.push(current);
        current = rightT < 1 - epsilon ? [lerpPoint(start, end, rightT).x, lerpPoint(start, end, rightT).y] : [];
        continue;
      }

      if (!current.length) pushPoint(current, start);
      pushPoint(current, end);
    }

    if (current.length >= 4) segments.push(current);
    return segments;
  }, []);

  const localDrawingPointToWorld = useCallback((token, localX, localY) => {
    const scale = Number(token?.scale || 1) || 1;
    const rotation = Number(token?.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    return {
      x: Number(token?.x || 0) + (localX * cos - localY * sin) * scale,
      y: Number(token?.y || 0) + (localX * sin + localY * cos) * scale,
    };
  }, []);

  const eraseAtPoint = useCallback((point) => {
    if (!point) return;
    const radius = Math.max(4, Number(eraseSize || 0) / 2);

    const brushBounds = { x: point.x - radius, y: point.y - radius, width: radius * 2, height: radius * 2 };
    const isAnnotationToken = (token) => ['drawing', 'shape', 'text'].includes(token?.assetType);

    const getLocalDrawingHit = (token) => {
      const scale = Number(token.scale || 1) || 1;
      const rotation = -(Number(token.rotation || 0) * Math.PI / 180);
      const dx = point.x - Number(token.x || 0);
      const dy = point.y - Number(token.y || 0);
      return {
        point: {
          x: (dx * Math.cos(rotation) - dy * Math.sin(rotation)) / scale,
          y: (dx * Math.sin(rotation) + dy * Math.cos(rotation)) / scale,
        },
        radius: radius / scale,
      };
    };

    const shouldEraseToken = (token) => {
      if (!token) return false;
      if (!isAnnotationToken(token)) return false;

      if (token.assetType === 'drawing' && Array.isArray(token.points) && token.points.length >= 4) {
        const localHit = getLocalDrawingHit(token);
        return isPointInsideDrawing(
          { points: token.points, width: token.strokeWidth || token.width || 3 },
          localHit.point,
          localHit.radius
        );
      }

      const bounds = getTokenBounds(token);
      if (!bounds) return false;
      return rectsIntersect(brushBounds, bounds);
    };

    const tokenTargets = selectableTokens.filter(shouldEraseToken);
    if (tokenTargets.length && removeToken) {
      tokenTargets.forEach((token) => {
        if (token.assetType !== 'drawing') {
          removeToken(token.id);
          return;
        }

        const localHit = getLocalDrawingHit(token);
        const segments = splitPolylineByEraser(
          token.points,
          localHit.point,
          localHit.radius,
          token.strokeWidth || token.width || 3
        );

        if (!segments.length) {
          removeToken(token.id);
          return;
        }

        updateTokenProps(token.id, { points: segments[0] }, { history: false });

        segments.slice(1).forEach((segment, index) => {
          const worldPoints = [];
          for (let i = 0; i < segment.length; i += 2) {
            const worldPoint = localDrawingPointToWorld(token, segment[i], segment[i + 1]);
            worldPoints.push(worldPoint.x, worldPoint.y);
          }
          onAddShapeToken?.({
            type: 'drawing',
            points: worldPoints,
            color: token.color,
            width: token.strokeWidth || token.width || 3,
            opacity: token.opacity,
            tension: token.tension,
            lineCap: token.lineCap,
            layer: token.layer,
            isVisible: token.isVisible,
            name: `${token.name || 'Traco'} ${index + 2}`,
          });
        });
      });
    }

    setDrawLines((prev) => {
      const next = [];
      let changed = false;
      for (const line of prev) {
        if (isPointInsideDrawing(line, point, radius)) {
          changed = true;
          if (line?.type === 'line' || line?.type === 'freehand' || !line.type) {
            const segments = splitPolylineByEraser(line.points, point, radius, line.width || 3);
            segments.forEach((segment, index) => {
              next.push({ ...line, id: `${line.id || 'line'}-cut-${Date.now()}-${index}`, points: segment });
            });
          } else if (line?.id && onRemoveDrawing && (line.type === 'rect' || line.type === 'circle')) {
            onRemoveDrawing(line.id);
          }
          continue;
        }
        next.push(line);
      }
      return changed ? next : prev;
    });
  }, [eraseSize, getTokenBounds, isPointInsideDrawing, localDrawingPointToWorld, onAddShapeToken, onRemoveDrawing, rectsIntersect, removeToken, selectableTokens, splitPolylineByEraser, updateTokenProps]);

  useEffect(() => {
    if (activeTool !== 'erase') {
      setIsErasing(false);
      setEraserPreview(null);
    }
  }, [activeTool]);

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

  const measureRuler = useCallback((start, end, unit = rulerUnit, multiplier = rulerMultiplier) => {
    if (!start || !end) return null;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const px = Math.sqrt(dx * dx + dy * dy);
    const cells = gridSize > 0 ? px / gridSize : 0;
    let value = px;
    let unitLabel = 'sq';
    if (unit === 'ft') {
      value = cells * multiplier;
      unitLabel = 'ft';
    } else if (unit === 'm') {
      value = cells * multiplier;
      unitLabel = 'm';
    } else if (unit === 'sq') {
      value = cells * multiplier;
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
  }, [gridSize, rulerMoveBudget, rulerMultiplier, rulerUnit]);

  const currentMeasure = useMemo(() => measureRuler(rulerStart, rulerEnd), [measureRuler, rulerEnd, rulerStart]);

  const remoteRulers = useMemo(() => Object.values(activeRulers || {}).filter((ruler) => {
    if (!ruler?.start || !ruler?.end) return false;
    if (currentUserId && String(ruler.userId) === String(currentUserId)) return false;
    return true;
  }), [activeRulers, currentUserId]);

  const renderToken = (token, forceOpacity = null) => (
    <VTTToken
      key={token.id}
      {...token}
      x={liveSelectedTokenPositions?.[String(token.id)]?.x ?? token.x}
      y={liveSelectedTokenPositions?.[String(token.id)]?.y ?? token.y}
      isMaster={isMaster}
      onDragEnd={updateTokenPosition}
      onToggleVisibility={toggleTokenVisibility}
      selected={safeSelectedIds.includes(token.id)}
      onSelect={applyTokenSelection}
      onUpdateToken={updateTokenProps}
      activeTool={activeTool}
      selectionKey={safeSelectedIds.map(String).join('|')}
      interactionKey={safeSelectedIds.some((id) => String(id) === String(token.id))
        ? `${activeTool}:${rulerStart?.x ?? ''}:${rulerStart?.y ?? ''}:${rulerEnd?.x ?? ''}:${rulerEnd?.y ?? ''}:${rulerFollowName}`
        : activeTool}
      canDrag={canDragToken(token)}
      canTransform={canTransformToken(token)}
      onTokenPointerDown={(tokenId, evt) => {
        if (activeTool === 'erase') {
          evt.cancelBubble = true;
          const stage = evt.target.getStage();
          const point = getWorldPointer(stage);
          onCommitHistory?.();
          setEraserPreview(point);
          eraseAtPoint(point);
          setIsErasing(true);
          return;
        }
        applyTokenSelection(tokenId, evt);
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
        const isDraggingSelectedGroup = safeSelectedIds.length > 1 && safeSelectedIds.some((id) => String(id) === String(tokenInfo?.id));
        if (isDraggingSelectedGroup) {
          const startPositions = {};
          safeSelectedIds.forEach((id) => {
            const found = tokens.find((t) => String(t.id) === String(id));
            if (found) startPositions[id] = { x: found.x, y: found.y };
          });
          dragGroupRef.current = { anchorId: tokenInfo?.id, startPositions };
          setLiveSelectedTokenPositions(startPositions);
        } else {
          dragGroupRef.current = null;
          setLiveSelectedTokenPositions(null);
        }
        if (activeTool !== 'ruler') return;
        setRulerFollowName(tokenInfo?.name || 'Token');
        const start = { x: tokenInfo?.x ?? 0, y: tokenInfo?.y ?? 0 };
        setRulerStart(start);
        setRulerEnd(start);
        onRulerStart?.({ start, end: start, followName: tokenInfo?.name || 'Token', unit: rulerUnit, multiplier: rulerMultiplier });
      }}
      onTokenDragMove={(tokenInfo) => {
        if (dragGroupRef.current && dragGroupRef.current.anchorId === tokenInfo?.id) {
          const { startPositions } = dragGroupRef.current;
          const anchor = startPositions?.[tokenInfo?.id];
          if (anchor) {
            const dx = (tokenInfo?.x ?? 0) - anchor.x;
            const dy = (tokenInfo?.y ?? 0) - anchor.y;
            const nextLivePositions = {};
            Object.entries(startPositions).forEach(([id, startPos]) => {
              const nextX = startPos.x + dx;
              const nextY = startPos.y + dy;
              nextLivePositions[String(id)] = { x: nextX, y: nextY };
            });
            setLiveSelectedTokenPositions(nextLivePositions);
          }
        }
        if (activeTool !== 'ruler') return;
        const end = { x: tokenInfo?.x ?? 0, y: tokenInfo?.y ?? 0 };
        setRulerEnd(end);
        if (rulerStart) onRulerUpdate?.({ start: rulerStart, end, followName: rulerFollowName, unit: rulerUnit, multiplier: rulerMultiplier });
      }}
      onTokenDragEnd={(tokenInfo) => {
        if (activeTool === 'pan') {
          setPanSuspended(false);
          stageRef.current?.draggable(activeTool === 'pan' && !isTokenTransforming);
        }
        if (dragGroupRef.current && dragGroupRef.current.anchorId === tokenInfo?.id) {
          const finalPositions = liveSelectedTokenPositions || {};
          Object.entries(finalPositions).forEach(([id, position]) => {
            if (String(id) === String(tokenInfo?.id)) return;
            updateTokenPosition(id, position.x, position.y, { history: false });
          });
          dragGroupRef.current = null;
          window.requestAnimationFrame(() => setLiveSelectedTokenPositions(null));
        }
        if (activeTool !== 'ruler') return;
        setRulerEnd({ x: tokenInfo?.x ?? 0, y: tokenInfo?.y ?? 0 });
        setRulerStart(null);
        setRulerEnd(null);
        setRulerFollowName('');
        onRulerEnd?.();
      }}
    />
  );

  // RenderizaÃ§Ã£o das camadas com as novas permissÃµes do mestre
  const renderFogShape = (area, key, compositeMode = 'source-over', opacity = fogOpacity) => {
    if (!area) return null;
    const commonProps = {
      key,
      fill: '#020202',
      opacity,
      globalCompositeOperation: compositeMode,
      listening: false,
    };

    if (area.shape === 'circle') {
      return <Circle {...commonProps} x={Number(area.x || 0)} y={Number(area.y || 0)} radius={Number(area.radius || 0)} />;
    }

    return (
      <KonvaRect
        {...commonProps}
        x={Number(area.x || 0)}
        y={Number(area.y || 0)}
        width={Number(area.width || 0)}
        height={Number(area.height || 0)}
      />
    );
  };

  const layerNodes = {
    map: (showMapLayer || mapTokens.length > 0) ? (
      <Layer id="map-layer" key="map-layer">
        {showMapLayer && image && (
          <KonvaImage
            key={mapUrl}
            image={image}
            x={0} y={0}
            width={image.width}
            height={image.height}
            perfectDrawEnabled={false}
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
    grid: showGrid ? (
      <Layer id="grid-layer" key="grid-layer" listening={false}>
        <Shape
          sceneFunc={drawGrid}
          stroke={gridStroke}
          strokeWidth={1}
          listening={false}
          perfectDrawEnabled={false}
        />
      </Layer>
    ) : null,
    token: showTokenLayer ? (
      <Layer id="token-layer" key="token-layer">
        {baseTokens.map(t => renderToken(t))}
      </Layer>
    ) : null,
    fog: isFogVisible ? (
      <Layer id="fog-layer" key="fog-layer" listening={false}>
        {normalizedFog.hiddenFullPage && (
          <KonvaRect
            x={0}
            y={0}
            width={mapWidth}
            height={mapHeight}
            fill="#020202"
            opacity={fogOpacity}
            listening={false}
          />
        )}
        {normalizedFog.hiddenFullPage && fogAreas
          .filter((area) => area.mode !== 'hide')
          .map((area) => renderFogShape(area, `fog-reveal-${area.id}`, 'destination-out', 1))}
        {fogAreas
          .filter((area) => area.mode === 'hide')
          .map((area) => renderFogShape(area, `fog-hide-${area.id}`, 'source-over', fogOpacity))}
      </Layer>
    ) : null,
    gm: isMaster && showGmLayer ? (
      <Layer id="gm-layer" key="gm-layer">
        {gmTokens.map(t => renderToken(t))}
      </Layer>
    ) : null
  };
  const baseLayerOrder = layerOrder.filter((layerKey) => layerKey !== 'fog');
  const gmLayerIndex = baseLayerOrder.indexOf('gm');
  const effectiveLayerOrder = isFogVisible
    ? [
        ...baseLayerOrder.slice(0, gmLayerIndex >= 0 ? gmLayerIndex : baseLayerOrder.length),
        'fog',
        ...baseLayerOrder.slice(gmLayerIndex >= 0 ? gmLayerIndex : baseLayerOrder.length),
      ]
    : baseLayerOrder;

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

        if (activeTool === 'erase') {
          e.cancelBubble = true;
          onCommitHistory?.();
          setEraserPreview(pos);
          eraseAtPoint(pos);
          setIsErasing(true);
          return;
        }

        if (activeTool === 'fog' && isMaster) {
          e.cancelBubble = true;
          const draft = {
            id: `fog-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            mode: fogMode === 'hide' ? 'hide' : 'reveal',
            shape: fogShape === 'circle' ? 'circle' : 'rect',
            points: [pos.x, pos.y, pos.x, pos.y],
            createdAt: Date.now(),
          };
          setFogDraft(draft);
          return;
        }

        if (['draw', 'shape', 'rect', 'circle'].includes(activeTool)) {
          let type = activeTool === 'draw' ? 'freehand' : 'line';
          if (activeTool === 'shape') type = shapeTool || 'rect';
          if (activeTool === 'rect') type = 'rect';
          if (activeTool === 'circle') type = 'circle';

          // Calcular propriedades baseadas no modo
          const modeProps = {
            pen:       { tension: 0.0, opacity: drawOpacity, lineCap: 'round' },
            pencil:    { tension: 0.4, opacity: Math.min(drawOpacity, 0.6), lineCap: 'round' },
            marker:    { tension: 0.0, opacity: drawOpacity, lineCap: 'square' },
            highlight: { tension: 0.0, opacity: Math.min(drawOpacity, 0.35), lineCap: 'square' },
          };
          const mp = modeProps[drawMode] || modeProps.pen;
          const effectiveWidth = drawMode === 'highlight' ? Math.max(drawWidth, 18) : drawMode === 'marker' ? Math.max(drawWidth, 8) : drawWidth;

          const newShape = {
            id: `shape-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            type,
            points: activeTool === 'draw' ? [pos.x, pos.y] : [pos.x, pos.y, pos.x, pos.y],
            color: drawColor,
            width: Number(effectiveWidth) || 3,
            opacity: mp.opacity,
            tension: mp.tension,
            lineCap: mp.lineCap,
            drawMode,
            // Fill para formas geomÃ©tricas
            fillColor: drawHasFill ? drawFillColor : null,
            fillOpacity: drawHasFill ? drawFillOpacity : 0,
          };
          drawLineIdRef.current = newShape.id;
          currentDrawingRef.current = newShape;
          setIsDrawing(true);
          setDrawLines((prev) => [...prev, newShape]);
          return;
        }

        if (activeTool === 'ruler') {
          const clickedOnToken = e.target.findAncestor('.token-node', true);
          let start = pos;
          let followName = '';
          if (clickedOnToken) {
            const tokenId = clickedOnToken.id();
            const tokenName = clickedOnToken.getAttr('tokenName') || 'Token';
            followName = tokenName;
            const followed = selectableTokens.find((t) => String(t.id) === String(tokenId));
            start = followed ? { x: followed.x, y: followed.y } : pos;
          }
          setRulerFollowName(followName);
          setRulerStart(start);
          setRulerEnd(pos);
          onRulerStart?.({ start, end: pos, followName, unit: rulerUnit, multiplier: rulerMultiplier });
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

        if (activeTool === 'erase') {
          setEraserPreview(pos);
          if (isErasing) eraseAtPoint(pos);
          return;
        }

        if (activeTool === 'fog' && fogDraft) {
          setFogDraft((prev) => prev ? { ...prev, points: [prev.points[0], prev.points[1], pos.x, pos.y] } : prev);
          return;
        }

        if (isSelecting && selectionStartRef.current) {
          const start = selectionStartRef.current;
          const x = Math.min(start.x, pos.x);
          const y = Math.min(start.y, pos.y);
          const width = Math.abs(pos.x - start.x);
          const height = Math.abs(pos.y - start.y);
          setSelectionRect({ x, y, width, height });
          return;
        }

        if ((activeTool === 'shape' || ['rect', 'circle'].includes(activeTool)) && isDrawing) {
          const current = currentDrawingRef.current;
          if (current) {
            currentDrawingRef.current = { ...current, points: [current.points[0], current.points[1], pos.x, pos.y] };
          }
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
          const current = currentDrawingRef.current;
          if (current) {
            if (!shouldAppendDrawPoint(current.points, pos.x, pos.y)) return;
            currentDrawingRef.current = { ...current, points: [...current.points, pos.x, pos.y] };
          }
          setDrawLines((prev) => {
            if (!prev.length) return prev;
            const next = [...prev];
            const last = next[next.length - 1];
            if (!shouldAppendDrawPoint(last.points, pos.x, pos.y)) return prev;
            next[next.length - 1] = { ...last, points: [...last.points, pos.x, pos.y] };
            return next;
          });
          return;
        }

        if (activeTool === 'ruler' && rulerStart) {
          setRulerEnd(pos);
          onRulerUpdate?.({ start: rulerStart, end: pos, followName: rulerFollowName, unit: rulerUnit, multiplier: rulerMultiplier });
        }

      }}
      onDblClick={(e) => {
        if (activeTool !== 'text') return;
        const stage = e.target.getStage();
        const stageEl = stage.container().getBoundingClientRect();
        const pointer = stage.getPointerPosition();
        const clickedOnToken = e.target.findAncestor('.token-node', true);

        if (clickedOnToken?.getAttr('tokenAssetType') === 'text') {
          e.cancelBubble = true;
          onEditLabel?.(
            clickedOnToken.id(),
            clickedOnToken.getAttr('tokenText') || clickedOnToken.getAttr('tokenName') || '',
            stageEl.left + pointer.x,
            stageEl.top + pointer.y,
            'text'
          );
          return;
        }

        if (clickedOnToken) return;

        const pos = getWorldPointer(stage);
        if (!pos) return;
        setTextInput({
          screenX: stageEl.left + pointer.x,
          screenY: stageEl.top + pointer.y,
          worldX: pos.x,
          worldY: pos.y
        });
        textInputCommittedRef.current = false;
      }}
      onMouseUp={(e) => {
        if (isRightClickPanning) {
          setIsRightClickPanning(false);
          lastPointerPositionRef.current = null;
          return;
        }

        if (isErasing) {
          setIsErasing(false);
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

        if (fogDraft) {
          const [x1, y1, x2, y2] = fogDraft.points;
          const width = Math.abs(x2 - x1);
          const height = Math.abs(y2 - y1);
          if (width > 4 || height > 4) {
            if (fogDraft.shape === 'circle') {
              const radius = Math.max(8, Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2));
              onAddFogArea?.({ id: fogDraft.id, mode: fogDraft.mode, shape: 'circle', x: x1, y: y1, radius, createdAt: fogDraft.createdAt });
            } else {
              onAddFogArea?.({ id: fogDraft.id, mode: fogDraft.mode, shape: 'rect', x: Math.min(x1, x2), y: Math.min(y1, y2), width, height, createdAt: fogDraft.createdAt });
            }
          }
          setFogDraft(null);
        }

        if (isDrawing) {
          setIsDrawing(false);
          const lineId = drawLineIdRef.current;
          const latestLineRaw = currentDrawingRef.current || drawLines.find((line) => line.id === lineId);
          const latestLine = latestLineRaw?.points
            ? { ...latestLineRaw, points: compactDrawPoints(latestLineRaw.points) }
            : latestLineRaw;

          drawLineIdRef.current = '';
          currentDrawingRef.current = null;

          if (latestLine) {
            if (['rect', 'circle', 'line', 'arrow'].includes(latestLine.type) && onAddShapeToken) {
              setDrawLines((prev) => prev.filter(l => l.id !== lineId));
              onAddShapeToken({ ...latestLine, fillColor: latestLine.fillColor, fillOpacity: latestLine.fillOpacity });
            } else if (latestLine.type === undefined || latestLine.type === 'freehand') {
              setDrawLines((prev) => prev.filter(l => l.id !== lineId));
              if (onAddShapeToken) onAddShapeToken({ ...latestLine, type: 'drawing', opacity: latestLine.opacity, lineCap: latestLine.lineCap, tension: latestLine.tension });
            } else if (onAddDrawing) {
              onAddDrawing(latestLine);
            }
          }

        }

        if (activeTool === 'ruler') {
          setRulerStart(null);
          setRulerEnd(null);
          setRulerFollowName('');
          onRulerEnd?.();
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
      onMouseLeave={() => {
        setIsErasing(false);
        setEraserPreview(null);
      }}
      style={{ cursor: isRightClickPanning ? 'grabbing' : activeTool === 'pan' ? 'grab' : ['draw', 'shape', 'rect', 'circle', 'fog'].includes(activeTool) ? 'crosshair' : activeTool === 'ruler' ? 'crosshair' : activeTool === 'erase' ? 'crosshair' : activeTool === 'text' ? 'text' : 'default' }}
    >
      {effectiveLayerOrder.map((layerKey) => layerNodes[layerKey] || null)}

      <Layer id="annotation-layer" key="annotation-layer">
        {drawLines.map((line, idx) => {
          const key = line.id || `draw-${idx}`;

          if (line.type === 'rect') {
            const x0 = Math.min(line.points[0], line.points[2]);
            const y0 = Math.min(line.points[1], line.points[3]);
            const width = Math.abs(line.points[2] - line.points[0]);
            const height = Math.abs(line.points[3] - line.points[1]);
            const fillHex = line.fillColor;
            const fillAlpha = line.fillOpacity ?? 0;
            const fillRgba = fillHex
              ? `rgba(${parseInt(fillHex.slice(1,3),16)},${parseInt(fillHex.slice(3,5),16)},${parseInt(fillHex.slice(5,7),16)},${fillAlpha})`
              : 'transparent';
            return (
              <KonvaRect
                key={key}
                x={x0} y={y0} width={width} height={height}
                stroke={line.color} strokeWidth={line.width}
                fill={fillRgba}
                opacity={line.opacity ?? 1}
                listening={false}
                perfectDrawEnabled={false}
              />
            );
          }

          if (line.type === 'circle') {
            const dx = line.points[2] - line.points[0];
            const dy = line.points[3] - line.points[1];
            const radius = Math.sqrt(dx * dx + dy * dy);
            const fillHex = line.fillColor;
            const fillAlpha = line.fillOpacity ?? 0;
            const fillRgba = fillHex
              ? `rgba(${parseInt(fillHex.slice(1,3),16)},${parseInt(fillHex.slice(3,5),16)},${parseInt(fillHex.slice(5,7),16)},${fillAlpha})`
              : 'transparent';
            return (
              <Circle
                key={key}
                x={line.points[0]} y={line.points[1]} radius={radius}
                stroke={line.color} strokeWidth={line.width}
                fill={fillRgba}
                opacity={line.opacity ?? 1}
                listening={false}
                perfectDrawEnabled={false}
              />
            );
          }

          if (line.type === 'arrow') {
            return (
              <Arrow
                key={key}
                points={line.points}
                stroke={line.color}
                fill={line.color}
                strokeWidth={line.width}
                pointerLength={16}
                pointerWidth={14}
                opacity={line.opacity ?? 1}
                lineCap="round"
                lineJoin="round"
                listening={false}
                perfectDrawEnabled={false}
              />
            );
          }

          // Default is 'line'
          return (
            <Line
              key={key}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.width}
              lineCap={line.lineCap || 'round'}
              lineJoin="round"
              tension={line.tension ?? 0}
              opacity={line.opacity ?? 1}
              listening={false}
              perfectDrawEnabled={false}
            />
          );
        })}

        {isSelecting && selectionRect && (
          <KonvaRect x={selectionRect.x} y={selectionRect.y} width={selectionRect.width} height={selectionRect.height} fill="rgba(95,180,255,0.18)" stroke="rgba(122,215,255,0.8)" strokeWidth={1} dash={[6, 4]} />
        )}

        {activeTool === 'erase' && eraserPreview && (
          <Circle
            x={eraserPreview.x}
            y={eraserPreview.y}
            radius={Math.max(4, Number(eraseSize || 0) / 2)}
            fill={isErasing ? 'rgba(255, 51, 51, 0.18)' : 'rgba(255, 255, 255, 0.055)'}
            stroke={isErasing ? 'rgba(255, 80, 80, 0.95)' : 'rgba(255, 105, 105, 0.72)'}
            strokeWidth={1.5}
            dash={isErasing ? [] : [5, 4]}
            listening={false}
          />
        )}

        {activeTool === 'fog' && fogDraft && (() => {
          const [x1, y1, x2, y2] = fogDraft.points;
          const previewColor = fogDraft.mode === 'hide' ? '#ff3333' : '#66d9ff';
          if (fogDraft.shape === 'circle') {
            return (
              <Circle
                x={x1}
                y={y1}
                radius={Math.max(1, Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2))}
                fill={fogDraft.mode === 'hide' ? 'rgba(255, 51, 51, 0.18)' : 'rgba(102, 217, 255, 0.16)'}
                stroke={previewColor}
                strokeWidth={2}
                dash={[8, 5]}
                listening={false}
              />
            );
          }
          return (
            <KonvaRect
              x={Math.min(x1, x2)}
              y={Math.min(y1, y2)}
              width={Math.abs(x2 - x1)}
              height={Math.abs(y2 - y1)}
              fill={fogDraft.mode === 'hide' ? 'rgba(255, 51, 51, 0.18)' : 'rgba(102, 217, 255, 0.16)'}
              stroke={previewColor}
              strokeWidth={2}
              dash={[8, 5]}
              listening={false}
            />
          );
        })()}

        {selectedGroupBounds && selectedTokens.length > 1 && activeTool === 'select' && (
          <>
            <KonvaRect
              ref={multiSelectionRectRef}
              x={selectedGroupBounds.x}
              y={selectedGroupBounds.y}
              width={selectedGroupBounds.width}
              height={selectedGroupBounds.height}
              fill="rgba(255, 51, 51, 0.035)"
              stroke="rgba(255, 51, 51, 0.9)"
              strokeWidth={2}
              cornerRadius={8}
              shadowColor="#ff3333"
              shadowBlur={14}
              shadowOpacity={0.55}
              draggable
              onMouseDown={(e) => {
                e.cancelBubble = true;
                captureMultiTransformStart(e.target);
              }}
              onClick={(e) => {
                e.cancelBubble = true;
              }}
              onDragStart={(e) => {
                e.cancelBubble = true;
                captureMultiTransformStart(e.target);
              }}
              onDragMove={(e) => applyMultiTransform(e.target)}
              onDragEnd={(e) => {
                e.cancelBubble = true;
                finishMultiTransform(e.target);
              }}
            />
          </>
        )}

      </Layer>

      {/* Camada HUD superior: rÃ©gua sempre por cima dos tokens */}
      <Layer listening={false}>
        {remoteRulers.map((ruler) => {
          const measure = measureRuler(ruler.start, ruler.end, ruler.unit, ruler.multiplier);
          if (!measure) return null;
          const color = ruler.color || '#33d6ff';
          const userName = ruler.userName || 'Jogador';
          const tooltipText = `${userName} - ${measure.label}`;
          const tooltipW = Math.max(92, tooltipText.length * 6.8 + 24);
          return (
            <React.Fragment key={`remote-ruler-${ruler.userId}`}>
              <Line
                points={[ruler.start.x, ruler.start.y, ruler.end.x, ruler.end.y]}
                stroke={color}
                strokeWidth={3}
                dash={[10, 6]}
                opacity={0.85}
                lineCap="round"
                shadowColor={color}
                shadowBlur={14}
                shadowOpacity={0.8}
              />
              <Circle x={ruler.start.x} y={ruler.start.y} radius={7} fill="#070707" stroke={color} strokeWidth={2} shadowColor={color} shadowBlur={10} shadowOpacity={0.75} />
              <Circle x={ruler.start.x} y={ruler.start.y} radius={3} fill={color} />
              <Circle x={ruler.end.x} y={ruler.end.y} radius={9} fill="#070707" stroke={color} strokeWidth={2.5} shadowColor={color} shadowBlur={14} shadowOpacity={0.85} />
              <Circle x={ruler.end.x} y={ruler.end.y} radius={3.5} fill="#fff" />
              <KonvaRect
                x={ruler.end.x + 12}
                y={ruler.end.y - 44}
                width={tooltipW}
                height={26}
                fill="rgba(5,5,5,0.88)"
                cornerRadius={9}
                stroke={color}
                strokeWidth={1.25}
                shadowColor={color}
                shadowBlur={10}
                shadowOpacity={0.42}
              />
              <KonvaText
                x={ruler.end.x + 18}
                y={ruler.end.y - 38}
                text={tooltipText}
                fontSize={10}
                fontFamily="Orbitron"
                fontStyle="bold"
                fill="#ffffff"
              />
            </React.Fragment>
          );
        })}
        {rulerStart && rulerEnd && (
          <>
            <Line
              points={[rulerStart.x, rulerStart.y, rulerEnd.x, rulerEnd.y]}
              stroke={currentMeasure?.overBudget ? '#ff8a8a' : '#ff3333'}
              strokeWidth={3}
              dash={[10, 6]}
              opacity={0.92}
              lineCap="round"
              shadowColor={currentMeasure?.overBudget ? '#ff8a8a' : '#ff3333'}
              shadowBlur={14}
              shadowOpacity={0.85}
            />
            <Circle x={rulerStart.x} y={rulerStart.y} radius={7} fill="#070707" stroke={currentMeasure?.overBudget ? '#ff8a8a' : '#ff3333'} strokeWidth={2} shadowColor={currentMeasure?.overBudget ? '#ff8a8a' : '#ff3333'} shadowBlur={10} shadowOpacity={0.8} />
            <Circle x={rulerStart.x} y={rulerStart.y} radius={3} fill={currentMeasure?.overBudget ? '#ff8a8a' : '#ff3333'} />
            <Circle x={rulerEnd.x} y={rulerEnd.y} radius={9} fill="#070707" stroke={currentMeasure?.overBudget ? '#ff8a8a' : '#ff3333'} strokeWidth={2.5} shadowColor={currentMeasure?.overBudget ? '#ff8a8a' : '#ff3333'} shadowBlur={14} shadowOpacity={0.9} />
            <Circle x={rulerEnd.x} y={rulerEnd.y} radius={3.5} fill="#fff" />
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
                    fill="rgba(5,5,5,0.88)"
                    cornerRadius={9}
                    stroke={currentMeasure.overBudget ? '#ff8a8a' : '#ff3333'}
                    strokeWidth={1.25}
                    shadowColor={currentMeasure.overBudget ? '#ff8a8a' : '#ff3333'}
                    shadowBlur={10}
                    shadowOpacity={0.45}
                  />
                  <KonvaText
                    x={rulerEnd.x + 18}
                    y={rulerEnd.y - 8}
                    text={tooltipText}
                    fontSize={10}
                    fontFamily="Orbitron"
                    fontStyle="bold"
                    fill={currentMeasure.overBudget ? '#ffd4d4' : '#ffffff'}
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
      <form
        className={styles.labelEditorPopup}
        style={{
          ...clampScreenOverlay(textInput.screenX, textInput.screenY - 34, 300, 104),
          border: `1px solid ${drawTextStrokeWidth > 0 ? drawTextStrokeColor : '#ff3333'}`,
          background: drawTextBg ? `rgba(8,8,8,${Math.max(drawTextBgOpacity, 0.88)})` : 'rgba(5, 5, 5, 0.96)',
          boxShadow: drawTextShadow ? '0 18px 44px rgba(0,0,0,0.76), 0 0 18px rgba(255,51,51,0.22)' : '0 14px 36px rgba(0,0,0,0.65)',
        }}
        onSubmit={(e) => {
          e.preventDefault();
          if (textInputCommittedRef.current) return;
          textInputCommittedRef.current = true;
          const txt = e.currentTarget.elements.inlineTextValue.value.trim();
          if (txt && onAddShapeToken) {
            onAddShapeToken({
              type: 'text', text: txt,
              x: textInput.worldX, y: textInput.worldY,
              color: drawColor,
              fontFamily: drawFontFamily,
              fontSize: drawFontSize,
              bold: drawFontBold,
              italic: drawFontItalic,
              underline: drawTextUnderline,
              strokeColor: drawTextStrokeColor,
              strokeWidth: drawTextStrokeWidth,
              shadow: drawTextShadow,
              align: drawTextAlign,
              hasBg: drawTextBg,
              backgroundColor: drawTextBgColor,
              backgroundOpacity: drawTextBgOpacity,
            });
          }
          setTextInput(null);
        }}
      >
        <div className={styles.labelEditorHeader}>
          <span>Novo texto</span>
        </div>
        <input
          ref={textInputRef}
          name="inlineTextValue"
          type="text"
          placeholder="Digite o texto..."
          autoFocus
          className={styles.labelEditorInput}
          style={{
            color: drawColor,
            fontSize: drawFontSize,
            fontFamily: drawFontFamily,
            fontWeight: drawFontBold ? 800 : 500,
            fontStyle: drawFontItalic ? 'italic' : 'normal',
            textDecoration: drawTextUnderline ? 'underline' : 'none',
            textAlign: drawTextAlign,
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setTextInput(null);
          }}
        />
        <div className={styles.labelEditorActions}>
          <span className={styles.labelEditorHint}>Enter salva / Esc cancela</span>
          <button type="button" onClick={() => setTextInput(null)} className={styles.labelEditorButton}>Cancelar</button>
          <button type="submit" className={`${styles.labelEditorButton} ${styles.labelEditorButtonPrimary}`}>Salvar</button>
        </div>
      </form>
    )}
  </>
  );
};

export default React.memo(VTTMap);
