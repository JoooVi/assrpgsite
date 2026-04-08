import React, { useEffect, useRef } from 'react';
import { Image as KonvaImage, Group, Transformer, Text as KonvaText, Rect as KonvaRect, Circle as KonvaCircle, Line as KonvaLine } from 'react-konva';
import useImage from 'use-image';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const VTTToken = ({
  id,
  name,
  layer,
  status,
  x,
  y,
  rotation = 0,
  scale = 1,
  avatarUrl,
  assetType = 'token',
  shapeType,
  color,
  strokeWidth = 3,
  width,
  height,
  radius,
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
  gridSize,
  isCircularBase,
  text,
  points,
  fontSize = 16,
  label,
  onEditLabel
}) => {
  const [image] = useImage(avatarUrl, 'anonymous');

  const groupRef = useRef(null);
  const trRef = useRef(null);
  const statusText = typeof status === 'string' ? status.trim() : '';
  const statusLabel = statusText.length > 18 ? statusText.slice(0, 17) + '...' : statusText;

  useEffect(() => {
    if (selected && trRef.current && groupRef.current && canTransform) {
      trRef.current.nodes([groupRef.current]);
      
      const tr = trRef.current;
      const customizeAnchor = (name, isRotator) => {
        const anchor = tr.findOne('.' + name);
        if (!anchor) return;
        anchor.sceneFunc((ctx, shape) => {
          const w = shape.width();
          const r = w / 2;
          
          ctx.beginPath();
          ctx.arc(r, r, r, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fillStrokeShape(shape);

          ctx.save();
          ctx.translate(r, r);
          ctx.strokeStyle = '#bae6ff';
          ctx.fillStyle = '#bae6ff';
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          if (name === 'rotater') {
             ctx.beginPath();
             ctx.arc(0, 0, 4, -Math.PI / 2, Math.PI);
             ctx.stroke();
             ctx.beginPath();
             ctx.moveTo(-4 - 2.5, 0);
             ctx.lineTo(-4, 3);
             ctx.lineTo(-4 + 2.5, 0);
             ctx.fill();
          } else if (name === 'middle-right') {
             ctx.beginPath();
             ctx.moveTo(-1, -3);
             ctx.lineTo(2, 0);
             ctx.lineTo(-1, 3);
             ctx.stroke();
          } else if (name === 'middle-left') {
             ctx.beginPath();
             ctx.moveTo(1, -3);
             ctx.lineTo(-2, 0);
             ctx.lineTo(1, 3);
             ctx.stroke();
          } else {
             ctx.beginPath();
             ctx.moveTo(-3, -3);
             ctx.lineTo(3, 3);
             ctx.stroke();
             ctx.beginPath();
             ctx.moveTo(3, 0);
             ctx.lineTo(3, 3);
             ctx.lineTo(0, 3);
             ctx.stroke();
             ctx.beginPath();
             ctx.moveTo(-3, 0);
             ctx.lineTo(-3, -3);
             ctx.lineTo(0, -3);
             ctx.stroke();
          }
          ctx.restore();
        });
      };

      customizeAnchor('rotater', true);
      customizeAnchor('bottom-right', false);
      customizeAnchor('middle-right', false);
      customizeAnchor('middle-left', false);

      tr.getLayer()?.batchDraw();
    }
  }, [selected, canTransform]);

  if (!isVisible && !isMaster) return null;

  return (
    <>
      <Group
        ref={groupRef}
        id={id}
        tokenName={name}
        name="token-node"
        x={x}
        y={y}
        rotation={rotation}
        scaleX={scale}
        scaleY={scale}
        draggable={canDrag}
        opacity={forceOpacity ?? (!isVisible ? 0.5 : 1)}
        onMouseDown={(e) => {
          groupRef.current?.moveToTop();
          const trLayer = trRef.current?.getLayer();
          if (trLayer) trLayer.batchDraw();
          onTokenPointerDown?.(id);
          e.cancelBubble = true;
        }}
        onClick={() => onSelect?.(id)}
        onTap={() => onSelect?.(id)}
        onDragStart={() => {
          if (!canDrag) return;
          onInteractionStart?.();
          onTokenDragStart?.({ id, name, x: groupRef.current?.x?.() ?? x, y: groupRef.current?.y?.() ?? y });
        }}
        onDragMove={(e) => {
          if (!canDrag) return;
          if (gridSize && !e.evt.altKey) {
            const snappedX = Math.round((e.target.x() - gridSize / 2) / gridSize) * gridSize + gridSize / 2;
            const snappedY = Math.round((e.target.y() - gridSize / 2) / gridSize) * gridSize + gridSize / 2;
            e.target.x(snappedX);
            e.target.y(snappedY);
          }
          onTokenDragMove?.({ id, name, x: e.target.x(), y: e.target.y() });
        }}
        onDragEnd={(e) => {
          if (!canDrag) return;
          let finalX = e.target.x();
          let finalY = e.target.y();
          if (gridSize && !e.evt.altKey) {
            finalX = Math.round((finalX - gridSize / 2) / gridSize) * gridSize + gridSize / 2;
            finalY = Math.round((finalY - gridSize / 2) / gridSize) * gridSize + gridSize / 2;
            e.target.x(finalX);
            e.target.y(finalY);
          }
          onDragEnd(id, finalX, finalY);
          onTokenDragEnd?.({ id, name, x: finalX, y: finalY });
          onInteractionEnd?.();
        }}
        onTransformStart={() => {
          if (canTransform) onInteractionStart?.();
        }}
        onTransformEnd={(e) => {
          if (!onUpdateToken || !canTransform) return;
          const node = e.target;
          const nextScale = clamp(Number(Math.abs(node.scaleX()).toFixed(2)), 0.45, 3.2);
          onUpdateToken(id, {
            x: node.x(),
            y: node.y(),
            rotation: Number(node.rotation().toFixed(1)),
            scale: nextScale
          });
          onInteractionEnd?.();
        }}
        onDblClick={(e) => {
          if (!onEditLabel) return;
          // Calcula posição na tela logo ABAIXO do token
          const node = groupRef.current;
          if (!node) return;
          const rect = node.getClientRect({ skipTransform: false });
          onEditLabel(id, label || '', rect.x + rect.width / 2, rect.y + rect.height + 6);
        }}
        onContextMenu={(e) => {
          e.evt.preventDefault();
          e.cancelBubble = true;
          onContextMenu?.(e, { id, name, layer, x, y, isVisible, status: statusText });
        }}
      >
        {assetType === 'text' ? (
          // --- TOKEN DE TEXTO ---
          <>
            <KonvaRect
              x={-6}
              y={-(fontSize * 0.8)}
              width={Math.max(60, (text || '').length * (fontSize * 0.62) + 16)}
              height={fontSize * 1.6}
              fill="rgba(10,14,20,0.82)"
              cornerRadius={5}
              stroke="rgba(103,215,255,0.4)"
              strokeWidth={1}
              opacity={!isVisible ? 0.3 : 1}
            />
            <KonvaText
              x={4}
              y={-(fontSize * 0.5)}
              text={text || ''}
              fontSize={fontSize}
              fontFamily="system-ui, sans-serif"
              fill={color || '#d8ecff'}
              opacity={!isVisible ? 0.3 : 1}
              listening={false}
            />
          </>
        ) : assetType === 'drawing' ? (
          // --- TOKEN DE DESENHO (lápis) ---
          <KonvaLine
            points={points || []}
            stroke={color || '#ffb347'}
            strokeWidth={strokeWidth}
            lineCap="round"
            lineJoin="round"
            opacity={!isVisible ? 0.3 : 1}
            tension={0.4}
          />
        ) : assetType === 'shape' ? (
          shapeType === 'rect' ? (
            <KonvaRect
              width={width}
              height={height}
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={!isVisible ? 0.3 : 1}
            />
          ) : (
            <KonvaCircle
              radius={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={!isVisible ? 0.3 : 1}
            />
          )
        ) : (
          isCircularBase ? (
            <Group 
              clipFunc={(ctx) => {
                ctx.arc(0, 0, 35, 0, Math.PI * 2, false);
              }}
            >
              {!isVisible && (
                <KonvaImage 
                  image={image} 
                  width={70} height={70} x={-35} y={-35} 
                  opacity={0.3} 
                />
              )}
              {isVisible && image && (
                <KonvaImage 
                  image={image} 
                  width={70} height={70} x={-35} y={-35} 
                />
              )}
              {/* Stroke do token circular (simulando um ring de VTT premium) */}
              <KonvaCircle
                 radius={35}
                 stroke="#2d3b4f"
                 strokeWidth={3}
                 listening={false}
              />
              <KonvaCircle
                 radius={33}
                 stroke="#131922"
                 strokeWidth={1}
                 listening={false}
              />
            </Group>
          ) : (
            <>
              {!isVisible && (
                <KonvaImage 
                  image={image} 
                  width={70} height={70} x={-35} y={-35} 
                  opacity={0.3} 
                />
              )}
              {isVisible && image && (
                <KonvaImage 
                  image={image} 
                  width={70} height={70} x={-35} y={-35} 
                  shadowColor="#000" shadowBlur={15} shadowOpacity={0.6} shadowOffsetY={5}
                />
              )}
            </>
          )
        )}
        {statusLabel && (
          <KonvaText
            text={statusLabel}
            x={-46}
            y={-56}
            width={92}
            align="center"
            fontSize={11}
            fill="#e8edf2"
            listening={false}
          />
        )}
        {label && (
          <>
            <KonvaRect
              x={-Math.max(36, label.length * 5.5 + 10) / 2}
              y={42}
              width={Math.max(36, label.length * 5.5 + 10)}
              height={18}
              fill="rgba(8,12,20,0.82)"
              cornerRadius={4}
              stroke="rgba(103,215,255,0.3)"
              strokeWidth={1}
              listening={false}
            />
            <KonvaText
              x={-Math.max(36, label.length * 5.5 + 10) / 2 + 4}
              y={45}
              text={label}
              fontSize={11}
              fontFamily="system-ui, sans-serif"
              fill="#bae6ff"
              listening={false}
            />
          </>
        )}
      </Group>

      {selected && canTransform && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={['middle-left', 'middle-right', 'bottom-right']}
          keepRatio
          flipEnabled={false}
          borderEnabled={true}
          borderStroke="#425770"
          borderDash={[4, 4]}
          anchorStroke="#bae6ff"
          anchorFill="#0f141a"
          anchorCornerRadius={10}
          anchorSize={20}
          anchorStrokeWidth={1}
          rotateAnchorOffset={35}
          padding={16}
        />
      )}
    </>
  );
};

export default VTTToken;