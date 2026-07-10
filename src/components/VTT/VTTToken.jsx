import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image as KonvaImage, Circle, Group, Transformer, Text as KonvaText, Rect as KonvaRect, Line as KonvaLine, Path as KonvaPath, Arrow } from 'react-konva';
import useImage from 'use-image';

const BASE_TOKEN_RADIUS = 35;
const SNAP_ANGLES = [0, 90, 180, 270, 360];
const SNAP_THRESHOLD = 6;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const toNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const normalizeAngle = (value) => ((value % 360) + 360) % 360;

const HANDLE_PATHS = {
  left: 'M201.4 297.4C188.9 309.9 188.9 330.2 201.4 342.7L361.4 502.7C373.9 515.2 394.2 515.2 406.7 502.7C419.2 490.2 419.2 469.9 406.7 457.4L269.3 320L406.6 182.6C419.1 170.1 419.1 149.8 406.6 137.3C394.1 124.8 373.8 124.8 361.3 137.3L201.3 297.3z',
  right: 'M439.1 297.4C451.6 309.9 451.6 330.2 439.1 342.7L279.1 502.7C266.6 515.2 246.3 515.2 233.8 502.7C221.3 490.2 221.3 469.9 233.8 457.4L371.2 320L233.9 182.6C221.4 170.1 221.4 149.8 233.9 137.3C246.4 124.8 266.7 124.8 279.2 137.3L439.2 297.3z',
  rotate: 'M320 128C263.2 128 212.1 152.7 176.9 192L224 192C241.7 192 256 206.3 256 224C256 241.7 241.7 256 224 256L96 256C78.3 256 64 241.7 64 224L64 96C64 78.3 78.3 64 96 64C113.7 64 128 78.3 128 96L128 150.7C174.9 97.6 243.5 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C233 576 156.1 532.6 109.9 466.3C99.8 451.8 103.3 431.9 117.8 421.7C132.3 411.5 152.2 415.1 162.4 429.6C197.2 479.4 254.8 511.9 320 511.9C426 511.9 512 425.9 512 319.9C512 213.9 426 128 320 128z'
};

const getStageWorldPointer = (stage) => {
  const pointer = stage?.getPointerPosition?.();
  if (!pointer) return null;
  return stage.getAbsoluteTransform().copy().invert().point(pointer);
};

const pointFromAngle = (cx, cy, angleDeg, distance) => {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + Math.cos(rad) * distance, y: cy + Math.sin(rad) * distance };
};

const snapRotation = (rotation) => {
  const normalized = normalizeAngle(rotation);
  const snapped = SNAP_ANGLES.find((angle) => Math.abs(normalized - angle) <= SNAP_THRESHOLD || Math.abs(normalized - angle + 360) <= SNAP_THRESHOLD);
  return snapped === undefined ? rotation : snapped === 360 ? 0 : snapped;
};

const rgbaFromHex = (hex, alpha) => {
  const clean = String(hex || '#080808').replace('#', '').padEnd(6, '0');
  const r = parseInt(clean.slice(0, 2), 16) || 8;
  const g = parseInt(clean.slice(2, 4), 16) || 8;
  const b = parseInt(clean.slice(4, 6), 16) || 8;
  return `rgba(${r},${g},${b},${alpha})`;
};

const TokenHandle = ({ type, x, y, radius, iconSize, strokeWidth, shadowBlur, onPointerDown }) => {
  const iconScale = iconSize / 640;
  return (
    <Group
      x={x}
      y={y}
      draggable={false}
      listening
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = type === 'rotate' ? 'grab' : 'ew-resize';
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = 'default';
      }}
      onMouseDown={(e) => {
        e.cancelBubble = true;
        onPointerDown?.(e);
      }}
      onTouchStart={(e) => {
        e.cancelBubble = true;
        onPointerDown?.(e);
      }}
      onClick={(e) => { e.cancelBubble = true; }}
    >
      <Circle radius={radius} fill="#0f1419" stroke="#ff3333" strokeWidth={strokeWidth} shadowColor="#ff3333" shadowBlur={shadowBlur} shadowOpacity={0.72} />
      <KonvaPath data={HANDLE_PATHS[type]} x={-320 * iconScale} y={-320 * iconScale} scaleX={iconScale} scaleY={iconScale} fill="#ffffff" listening={false} />
    </Group>
  );
};

const VTTToken = ({
  id,
  name,
  label,
  labelStyle,
  layer,
  status,
  hp,
  maxHp,
  auraColor,
  assetType,
  tokenShape,
  shapeType,
  text,
  points = [],
  color,
  strokeWidth,
  fillColor,
  fillOpacity,
  opacity,
  tension,
  lineCap,
  width,
  height,
  radius,
  fontSize,
  fontFamily,
  bold,
  italic,
  underline,
  strokeColor,
  shadow,
  align,
  hasBg,
  backgroundColor,
  backgroundOpacity,
  x,
  y,
  rotation = 0,
  scale = 1,
  avatarUrl,
  characterId,
  isVisible = true,
  isMaster,
  onDragEnd,
  onToggleVisibility,
  onUpdateToken,
  forceOpacity,
  selected,
  onSelect,
  canDrag = true,
  canTransform = true,
  onInteractionStart,
  onInteractionEnd,
  onTokenPointerDown,
  onTokenDragStart,
  onTokenDragMove,
  onTokenDragEnd,
  onContextMenu,
  activeTool
}) => {
  const [image] = useImage(avatarUrl, 'anonymous');
  const [draftTransform, setDraftTransform] = useState(null);
  const [livePosition, setLivePosition] = useState(null);
  const [activeHandle, setActiveHandle] = useState(null);
  const draftTransformRef = useRef(null);
  const handleInteractionRef = useRef(null);
  const groupRef = useRef(null);
  const trRef = useRef(null);

  const isStandardToken = !assetType || assetType === 'token';
  const resolvedTokenShape = tokenShape === 'freeform' ? 'freeform' : 'circle';
  const isFreeformToken = isStandardToken && resolvedTokenShape === 'freeform';
  const baseRadius = toNumber(radius, BASE_TOKEN_RADIUS) || BASE_TOKEN_RADIUS;
  const imageNaturalWidth = image ? image.width : 0;
  const imageNaturalHeight = image ? image.height : 0;
  const freeformWidth = Math.max(12, toNumber(width, imageNaturalWidth || baseRadius * 2));
  const freeformHeight = Math.max(12, toNumber(height, imageNaturalHeight || baseRadius * 2));
  const safeScale = clamp(toNumber(scale, 1), 0.1, 20);
  const safeRotation = toNumber(rotation, 0);
  const visualScale = draftTransform?.scale ?? safeScale;
  const visualRotation = draftTransform?.rotation ?? safeRotation;
  const tokenX = livePosition?.x ?? toNumber(x, 0);
  const tokenY = livePosition?.y ?? toNumber(y, 0);
  const tokenRadius = baseRadius * visualScale;
  const freeformHalfWidth = (freeformWidth * visualScale) / 2;
  const freeformHalfHeight = (freeformHeight * visualScale) / 2;
  const tokenOuterHalfWidth = isFreeformToken ? freeformHalfWidth : tokenRadius;
  const tokenOuterHalfHeight = isFreeformToken ? freeformHalfHeight : tokenRadius;
  const baseResizeDistance = isFreeformToken ? freeformWidth / 2 : baseRadius;
  const stageScale = groupRef.current?.getStage?.()?.scaleX?.() || 1;
  const handleBaseSize = isFreeformToken ? Math.max(freeformHalfWidth, freeformHalfHeight) : tokenRadius;
  const minHandleRadius = 9 / stageScale;
  const maxHandleRadius = 17 / stageScale;
  const handleRadius = clamp(handleBaseSize * 0.2, minHandleRadius, maxHandleRadius);
  const handleIconSize = handleRadius * 1.1;
  const handleStrokeWidth = clamp(handleRadius * 0.18, 1.4 / stageScale, 2.6 / stageScale);
  const handleShadowBlur = clamp(handleRadius * 0.75, 6 / stageScale, 14 / stageScale);
  const rotateOffset = clamp(tokenRadius * 0.35, 18 / stageScale, 42 / stageScale);
  const freeformRotateOffset = clamp(Math.max(freeformHalfWidth, freeformHalfHeight) * 0.22, 18 / stageScale, 42 / stageScale);
  const activeRotateOffset = isFreeformToken ? freeformRotateOffset : rotateOffset;
  const horizontalHandleDistance = tokenOuterHalfWidth + handleRadius * 0.08;
  const verticalHandleDistance = tokenOuterHalfHeight + activeRotateOffset;
  const statusText = typeof status === 'string' ? status.trim() : '';
  const statusLabel = statusText.length > 18 ? statusText.slice(0, 17) + '...' : statusText;
  const displayLabel = typeof label === 'string' ? label.trim() : '';

  const imgWidth = image ? image.width : toNumber(width, 60);
  const imgHeight = image ? image.height : toNumber(height, 60);
  const vectorStroke = color || '#ffb347';
  const vectorStrokeWidth = toNumber(strokeWidth, 3);
  const textValue = text || name || 'Texto';
  const textFontSize = toNumber(fontSize, 18);
  const textFontFamily = fontFamily || 'Rajdhani';
  const textFontStyle = `${bold ? 'bold' : ''} ${italic ? 'italic' : ''}`.trim() || 'normal';
  const textStrokeWidth = toNumber(strokeWidth, 0);
  const textStroke = strokeColor && strokeColor !== 'transparent' ? strokeColor : undefined;
  const textBgFill = hasBg ? rgbaFromHex(backgroundColor || '#080808', toNumber(backgroundOpacity, 0.72)) : 'transparent';

  const safeLabelStyle = labelStyle || {};
  const labelFontSize = toNumber(safeLabelStyle.fontSize, 12);
  const labelFontFamily = safeLabelStyle.fontFamily || 'Rajdhani';
  const labelOffsetX = toNumber(safeLabelStyle.offsetX, 0);
  const labelOffsetY = toNumber(safeLabelStyle.offsetY, 0);
  const labelPosition = safeLabelStyle.position || 'bottom';
  const labelBgOpacity = toNumber(safeLabelStyle.backgroundOpacity, 0.72);

  const vectorBounds = useMemo(() => {
    if (assetType === 'text') {
      return { width: Math.max(90, textValue.length * textFontSize * 0.58), height: textFontSize + 16 };
    }
    if (assetType === 'shape') {
      if (shapeType === 'circle') {
        const size = toNumber(radius || width / 2, 40) * 2;
        return { width: size, height: size };
      }
      return { width: toNumber(width, 100), height: toNumber(height, 100) };
    }
    if (assetType === 'drawing' && points.length >= 2) {
      const xs = points.filter((_, index) => index % 2 === 0);
      const ys = points.filter((_, index) => index % 2 === 1);
      return { width: Math.max(30, Math.max(...xs) - Math.min(...xs)), height: Math.max(30, Math.max(...ys) - Math.min(...ys)) };
    }
    return { width: imgWidth, height: imgHeight };
  }, [assetType, height, imgHeight, imgWidth, points, radius, shapeType, textFontSize, textValue, width]);

  useEffect(() => {
    if (!isStandardToken && selected && canTransform && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [selected, canTransform, isStandardToken, textValue, vectorBounds.width, vectorBounds.height, width, height, radius, points]);

  useEffect(() => {
    if (!selected) {
      draftTransformRef.current = null;
      handleInteractionRef.current = null;
      setDraftTransform(null);
      setActiveHandle(null);
    }
  }, [selected]);

  useEffect(() => {
    setLivePosition(null);
  }, [x, y]);

  useEffect(() => () => {
    handleInteractionRef.current = null;
    const stage = groupRef.current?.getStage?.();
    if (stage) stage.container().style.cursor = 'default';
  }, []);

  const setDraft = (next) => {
    draftTransformRef.current = next;
    setDraftTransform(next);
  };

  if (!isVisible && !isMaster) return null;

  const labelY = (baseOffset = 0) => {
    if (labelPosition === 'top') return tokenY - tokenOuterHalfHeight - 28 + baseOffset + labelOffsetY;
    if (labelPosition === 'center') return tokenY - 8 + baseOffset + labelOffsetY;
    return tokenY + tokenOuterHalfHeight + 8 + baseOffset + labelOffsetY;
  };

  const updateManualHandleTransform = (stage) => {
    const interaction = handleInteractionRef.current;
    if (!interaction) return;
    const pointer = getStageWorldPointer(stage);
    if (!pointer) return;
    if (interaction.mode === 'resize') {
      const dx = pointer.x - interaction.center.x;
      const dy = pointer.y - interaction.center.y;
      const resizeBase = interaction.baseResizeDistance || baseResizeDistance || baseRadius;
      const nextScale = clamp(Number((Math.sqrt(dx * dx + dy * dy) / resizeBase).toFixed(2)), 0.25, 3.2);
      const next = { scale: nextScale, rotation: draftTransformRef.current?.rotation ?? interaction.startRotation };
      setDraft(next);
      return;
    }
    const rawRotation = Math.atan2(pointer.y - interaction.center.y, pointer.x - interaction.center.x) * 180 / Math.PI + 90;
    const nextRotation = Number(snapRotation(rawRotation).toFixed(1));
    const next = { scale: draftTransformRef.current?.scale ?? interaction.startScale, rotation: nextRotation };
    setDraft(next);
  };

  const beginManualHandleInteraction = (evt, mode) => {
    if (!canTransform || !isStandardToken) return;
    const stage = evt.target.getStage();
    if (!stage) return;
    evt.evt?.preventDefault?.();
    evt.evt?.stopPropagation?.();
    onInteractionStart?.();
    const nextMode = mode === 'rotate' ? 'rotate' : 'resize';
    setActiveHandle(nextMode);
    handleInteractionRef.current = {
      mode: nextMode,
      center: { x: tokenX, y: tokenY },
      startScale: visualScale,
      startRotation: visualRotation,
      baseResizeDistance,
    };
    stage.container().style.cursor = nextMode === 'rotate' ? 'grabbing' : 'ew-resize';

    const handleMove = (event) => {
      event.preventDefault?.();
      stage.setPointersPositions(event);
      updateManualHandleTransform(stage);
      stage.batchDraw();
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
      stage.container().style.cursor = 'default';
      commitManualTransform();
      handleInteractionRef.current = null;
      setActiveHandle(null);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    updateManualHandleTransform(stage);
  };

  const commitManualTransform = () => {
    if (!onUpdateToken || !canTransform) {
      draftTransformRef.current = null;
      handleInteractionRef.current = null;
      setDraftTransform(null);
      setActiveHandle(null);
      onInteractionEnd?.();
      return;
    }
    const finalDraft = draftTransformRef.current || draftTransform;
    const nextScale = finalDraft?.scale ?? safeScale;
    const nextRotation = finalDraft?.rotation ?? safeRotation;
    onUpdateToken(id, { x: tokenX, y: tokenY, scale: nextScale, rotation: nextRotation });
    draftTransformRef.current = null;
    handleInteractionRef.current = null;
    setDraftTransform(null);
    setActiveHandle(null);
    onInteractionEnd?.();
  };

  const leftHandle = pointFromAngle(tokenX, tokenY, visualRotation + 180, horizontalHandleDistance);
  const rightHandle = pointFromAngle(tokenX, tokenY, visualRotation, horizontalHandleDistance);
  const rotateHandle = pointFromAngle(tokenX, tokenY, visualRotation - 90, verticalHandleDistance);

  return (
    <>
      <Group
        ref={groupRef}
        id={id}
        tokenName={name}
        tokenAssetType={assetType || 'token'}
        tokenShape={resolvedTokenShape}
        tokenText={textValue}
        name="token-node"
        x={tokenX}
        y={tokenY}
        rotation={isStandardToken ? visualRotation : safeRotation}
        scaleX={isStandardToken ? visualScale : safeScale}
        scaleY={isStandardToken ? visualScale : safeScale}
        draggable={canDrag && !activeHandle}
        opacity={forceOpacity ?? (!isVisible ? 0.5 : 1)}
        onMouseDown={(e) => { onTokenPointerDown?.(id, e); e.cancelBubble = true; }}
        onClick={(e) => { e.cancelBubble = true; }}
        onTap={(e) => onSelect?.(id, e)}
        onMouseEnter={(e) => {
          if (activeTool === 'select') {
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = canDrag ? 'move' : 'pointer';
          }
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage();
          if (stage && !activeHandle) stage.container().style.cursor = 'default';
        }}
        onDragStart={() => {
          if (!canDrag) return;
          onInteractionStart?.();
          const startPosition = { x: groupRef.current?.x?.() ?? tokenX, y: groupRef.current?.y?.() ?? tokenY };
          setLivePosition(startPosition);
          onTokenDragStart?.({ id, name, ...startPosition });
        }}
        onDragMove={(e) => {
          if (!canDrag) return;
          const nextPosition = { x: e.target.x(), y: e.target.y() };
          setLivePosition(nextPosition);
          onTokenDragMove?.({ id, name, ...nextPosition });
        }}
        onDragEnd={(e) => {
          if (!canDrag) return;
          const nextPosition = { x: e.target.x(), y: e.target.y() };
          setLivePosition(nextPosition);
          onDragEnd(id, nextPosition.x, nextPosition.y);
          onTokenDragEnd?.({ id, name, ...nextPosition });
          onInteractionEnd?.();
        }}
        onTransformStart={() => { if (!isStandardToken && canTransform) onInteractionStart?.(); }}
        onTransformEnd={(e) => {
          if (!onUpdateToken || !canTransform || isStandardToken) return;
          const node = e.target;
          const nextScale = clamp(Number(Math.abs(node.scaleX()).toFixed(2)), 0.1, 20);
          onUpdateToken(id, { x: node.x(), y: node.y(), rotation: Number(node.rotation().toFixed(1)), scale: nextScale });
          onInteractionEnd?.();
        }}
        onDblClick={() => {
          if (activeTool === 'text') return;
          if (isMaster) onToggleVisibility(id);
        }}
        onContextMenu={(e) => {
          e.evt.preventDefault();
          e.cancelBubble = true;
          onContextMenu?.(e, { id, name, label, layer, x: tokenX, y: tokenY, isVisible, status: statusText, hp, maxHp, auraColor, assetType, text, characterId, tokenShape: resolvedTokenShape, radius: baseRadius, width: freeformWidth, height: freeformHeight, naturalWidth: imageNaturalWidth, naturalHeight: imageNaturalHeight });
        }}
      >
        {assetType === 'text' ? (
          <>
            {hasBg && <KonvaRect width={vectorBounds.width + 14} height={vectorBounds.height + 8} x={-7} y={-textFontSize - 9} fill={textBgFill} cornerRadius={8} />}
            <KonvaText text={textValue} x={0} y={-textFontSize} width={vectorBounds.width} fontFamily={textFontFamily} fontSize={textFontSize} fontStyle={textFontStyle} textDecoration={underline ? 'underline' : ''} align={align || 'left'} fill={vectorStroke} stroke={textStroke} strokeWidth={textStroke ? textStrokeWidth : 0} shadowColor={shadow ? '#000' : undefined} shadowBlur={shadow ? 8 : 0} shadowOpacity={shadow ? 0.65 : 0} />
          </>
        ) : assetType === 'drawing' ? (
          <KonvaLine
            points={points}
            stroke={vectorStroke}
            strokeWidth={vectorStrokeWidth}
            hitStrokeWidth={Math.max(vectorStrokeWidth + 12, 18)}
            lineCap={lineCap || 'round'}
            lineJoin="round"
            tension={tension ?? 0}
            opacity={opacity ?? 1}
          />
        ) : assetType === 'shape' ? (
          shapeType === 'circle' ? (
            <Circle radius={toNumber(radius || width / 2, 40)} stroke={vectorStroke} strokeWidth={vectorStrokeWidth} fill={fillColor ? rgbaFromHex(fillColor, toNumber(fillOpacity, 0.18)) : 'rgba(255, 51, 51, 0.08)'} opacity={opacity ?? 1} />
          ) : shapeType === 'line' ? (
            <KonvaLine
              points={points?.length ? points : [0, 0, toNumber(width, 100), 0]}
              stroke={vectorStroke}
              strokeWidth={vectorStrokeWidth}
              hitStrokeWidth={Math.max(vectorStrokeWidth + 12, 18)}
              lineCap="round"
              lineJoin="round"
              opacity={opacity ?? 1}
            />
          ) : shapeType === 'arrow' ? (
            <Arrow
              points={points?.length ? points : [0, 0, toNumber(width, 100), 0]}
              stroke={vectorStroke}
              fill={vectorStroke}
              strokeWidth={vectorStrokeWidth}
              hitStrokeWidth={Math.max(vectorStrokeWidth + 12, 18)}
              pointerLength={16}
              pointerWidth={14}
              lineCap="round"
              lineJoin="round"
              opacity={opacity ?? 1}
            />
          ) : (
            <KonvaRect width={toNumber(width, 100)} height={toNumber(height, 100)} stroke={vectorStroke} strokeWidth={vectorStrokeWidth} fill={fillColor ? rgbaFromHex(fillColor, toNumber(fillOpacity, 0.18)) : 'rgba(255, 51, 51, 0.08)'} opacity={opacity ?? 1} />
          )
        ) : isStandardToken ? (
          <>
            {isFreeformToken ? (
              <>
                {auraColor && (
                  <KonvaRect
                    x={-freeformWidth / 2}
                    y={-freeformHeight / 2}
                    width={freeformWidth}
                    height={freeformHeight}
                    fill={auraColor}
                    opacity={0.08}
                    shadowColor={auraColor}
                    shadowBlur={28 / visualScale}
                    shadowOpacity={0.72}
                    listening={false}
                  />
                )}
                {selected && canTransform && (
                  <KonvaRect
                    x={-freeformWidth / 2}
                    y={-freeformHeight / 2}
                    width={freeformWidth}
                    height={freeformHeight}
                    fill="transparent"
                    stroke="rgba(255,51,51,0.92)"
                    strokeWidth={2.5 / visualScale}
                    shadowColor="#ff3333"
                    shadowBlur={16 / visualScale}
                    shadowOpacity={0.75}
                    listening={false}
                  />
                )}
                {image ? (
                  <KonvaImage image={image} width={freeformWidth} height={freeformHeight} x={-freeformWidth / 2} y={-freeformHeight / 2} />
                ) : (
                  <KonvaRect x={-freeformWidth / 2} y={-freeformHeight / 2} width={freeformWidth} height={freeformHeight} fill="#10161d" stroke="#ff3333" strokeWidth={2 / visualScale} />
                )}
              </>
            ) : (
              <>
                {auraColor && <Circle radius={baseRadius + 12} fill={auraColor} opacity={0.16} shadowColor={auraColor} shadowBlur={28} shadowOpacity={0.7} listening={false} />}
                {selected && canTransform && <Circle radius={baseRadius + 8} fill="transparent" stroke="rgba(255,51,51,0.92)" strokeWidth={2.5 / visualScale} shadowColor="#ff3333" shadowBlur={18 / visualScale} shadowOpacity={0.9} listening={false} />}
                <Group name="token-body-clean">
                  <Circle radius={baseRadius} fill="#111" stroke={!isVisible ? '#888' : '#ff3333'} strokeWidth={3 / visualScale} shadowColor="#000" shadowBlur={10 / visualScale} shadowOpacity={0.55} />
                  {image && <KonvaImage image={image} width={(baseRadius * 2) - 10} height={(baseRadius * 2) - 10} x={-baseRadius + 5} y={-baseRadius + 5} cornerRadius={baseRadius - 5} />}
                </Group>
              </>
            )}
          </>
        ) : (
          image && <KonvaImage image={image} width={imgWidth} height={imgHeight} x={-imgWidth / 2} y={-imgHeight / 2} />
        )}
      </Group>

      {(displayLabel || statusLabel) && isStandardToken && (
        <Group listening={false}>
          {displayLabel && (
            <>
              <KonvaRect x={tokenX - 48 * visualScale + labelOffsetX} y={labelY()} width={96 * visualScale} height={(labelFontSize + 9) * visualScale} cornerRadius={7 * visualScale} fill={rgbaFromHex(safeLabelStyle.backgroundColor || '#080808', labelBgOpacity)} stroke={safeLabelStyle.borderColor || 'rgba(255,51,51,0.48)'} strokeWidth={1} />
              <KonvaText text={displayLabel} x={tokenX - 44 * visualScale + labelOffsetX} y={labelY(5 * visualScale)} width={88 * visualScale} align="center" fontFamily={labelFontFamily} fontSize={labelFontSize * visualScale} fontStyle="bold" fill={safeLabelStyle.color || '#f2f2f2'} />
            </>
          )}
          {statusLabel && (
            <>
              <KonvaRect x={tokenX - 43 * visualScale} y={tokenY - tokenOuterHalfHeight - 24} width={86 * visualScale} height={17 * visualScale} cornerRadius={6 * visualScale} fill="rgba(8,8,8,0.7)" stroke="rgba(255,255,255,0.16)" strokeWidth={1} />
              <KonvaText text={statusLabel} x={tokenX - 40 * visualScale} y={tokenY - tokenOuterHalfHeight - 20} width={80 * visualScale} align="center" fontFamily="Rajdhani" fontSize={10 * visualScale} fontStyle="bold" fill="#ffb3b3" />
            </>
          )}
        </Group>
      )}

      {selected && canTransform && isStandardToken && (
        <>
          <TokenHandle type="left" x={leftHandle.x} y={leftHandle.y} radius={handleRadius} iconSize={handleIconSize} strokeWidth={handleStrokeWidth} shadowBlur={handleShadowBlur} onPointerDown={(e) => beginManualHandleInteraction(e, 'resize')} />
          <TokenHandle type="right" x={rightHandle.x} y={rightHandle.y} radius={handleRadius} iconSize={handleIconSize} strokeWidth={handleStrokeWidth} shadowBlur={handleShadowBlur} onPointerDown={(e) => beginManualHandleInteraction(e, 'resize')} />
          <TokenHandle type="rotate" x={rotateHandle.x} y={rotateHandle.y} radius={handleRadius} iconSize={handleIconSize} strokeWidth={handleStrokeWidth} shadowBlur={handleShadowBlur} onPointerDown={(e) => beginManualHandleInteraction(e, 'rotate')} />
          {(draftTransform || activeHandle === 'rotate') && <KonvaText text={normalizeAngle(visualRotation).toFixed(1) + '°'} x={tokenX - 28} y={tokenY - tokenOuterHalfHeight - activeRotateOffset - 30 / stageScale} width={56} align="center" fontSize={13 / stageScale} fontStyle="bold" fill="#fff" stroke="#0f1419" strokeWidth={3 / stageScale} fillAfterStrokeEnabled listening={false} />}
        </>
      )}

      {selected && canTransform && !isStandardToken && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={['middle-left', 'middle-right']}
          keepRatio
          flipEnabled={false}
          borderEnabled
          borderStroke="rgba(255,51,51,0.9)"
          borderDash={[6, 4]}
          anchorStroke="#ff3333"
          anchorFill="#ffffff"
          anchorCornerRadius={999}
          anchorSize={24}
          rotateAnchorOffset={28}
          padding={4}
          ignoreStroke
          shouldOverdrawWholeArea
          onTransformStart={() => onInteractionStart?.()}
          onTransformEnd={() => onInteractionEnd?.()}
        />
      )}
    </>
  );
};

export default React.memo(VTTToken);
