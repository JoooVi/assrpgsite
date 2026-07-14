const TOKEN_COMPARISON_KEYS = [
  'id', 'name', 'label', 'labelStyle', 'layer', 'status', 'hp', 'maxHp', 'auraColor',
  'assetType', 'tokenShape', 'shapeType', 'text', 'points', 'color', 'strokeWidth',
  'fillColor', 'fillOpacity', 'opacity', 'tension', 'lineCap', 'width', 'height', 'radius',
  'fontSize', 'fontFamily', 'bold', 'italic', 'underline', 'strokeColor', 'shadow', 'align',
  'hasBg', 'backgroundColor', 'backgroundOpacity', 'x', 'y', 'rotation', 'scale', 'avatarUrl',
  'characterId', 'isVisible', 'isMaster', 'forceOpacity', 'selected', 'canDrag', 'canTransform',
  'activeTool', 'selectionKey', 'interactionKey',
];

export const areTokenPropsEqual = (previous, next) => (
  TOKEN_COMPARISON_KEYS.every((key) => Object.is(previous[key], next[key]))
);
