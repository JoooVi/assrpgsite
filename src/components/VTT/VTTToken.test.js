import { areTokenPropsEqual } from './vttTokenMemo';

const baseToken = {
  id: 'token-1',
  x: 100,
  y: 150,
  scale: 1,
  rotation: 0,
  selected: false,
  activeTool: 'select',
  selectionKey: '',
  interactionKey: 'select',
  avatarUrl: '/token.png',
};

test('ignora apenas callbacks recriados sem mudança visual', () => {
  const previous = { ...baseToken, onDragEnd: () => 'old' };
  const next = { ...baseToken, onDragEnd: () => 'new' };
  expect(areTokenPropsEqual(previous, next)).toBe(true);
});

test.each([
  ['posição', { x: 101 }],
  ['seleção', { selected: true, selectionKey: 'token-1' }],
  ['escala', { scale: 1.2 }],
  ['rotação', { rotation: 90 }],
  ['imagem', { avatarUrl: '/other-token.png' }],
  ['interação', { interactionKey: 'ruler:1:2' }],
])('renderiza novamente quando muda %s', (label, patch) => {
  expect(areTokenPropsEqual(baseToken, { ...baseToken, ...patch })).toBe(false);
});
