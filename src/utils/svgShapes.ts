export type ShapeName = 'Orbit' | 'Bloom' | 'Pebble' | 'Star'
/** All silhouettes share eight cubic segments, order, and winding direction. */
export function createShapePath(name: ShapeName): string {
  const count = 8
  const points = Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2
    const radius =
      name === 'Star'
        ? index % 2
          ? 72
          : 134
        : name === 'Bloom'
          ? index % 2
            ? 108
            : 142
          : name === 'Pebble'
            ? 108 + Math.sin(angle * 3 + 0.7) * 23
            : 120
    return {
      x: 200 + Math.cos(angle) * radius,
      y: 200 + Math.sin(angle) * radius,
    }
  })
  const point = (index: number) => points[(index + count) % count]!
  const start = point(0)
  let path = 'M ' + start.x.toFixed(2) + ' ' + start.y.toFixed(2)
  for (let index = 0; index < count; index++) {
    const previous = point(index - 1),
      current = point(index),
      next = point(index + 1),
      after = point(index + 2)
    const tension = name === 'Star' ? 0.08 : 0.17
    path +=
      ' C ' +
      [
        current.x + (next.x - previous.x) * tension,
        current.y + (next.y - previous.y) * tension,
        next.x - (after.x - current.x) * tension,
        next.y - (after.y - current.y) * tension,
        next.x,
        next.y,
      ]
        .map((value) => value.toFixed(2))
        .join(' ')
  }
  return path + ' Z'
}
export const shapes: readonly {
  name: ShapeName
  color: string
  path: string
}[] = [
  { name: 'Orbit', color: '#b7a1ff', path: createShapePath('Orbit') },
  { name: 'Bloom', color: '#6198ff', path: createShapePath('Bloom') },
  { name: 'Pebble', color: '#8ed8d2', path: createShapePath('Pebble') },
  { name: 'Star', color: '#dfa7e8', path: createShapePath('Star') },
]
