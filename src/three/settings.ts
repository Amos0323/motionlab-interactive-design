export const colourways = [
  { name: 'Obsidian', shell: '#30323c', metal: '#9299aa', cushion: '#15151e' },
  { name: 'Amethyst', shell: '#9172c2', metal: '#d4c4ed', cushion: '#30263e' },
  { name: 'Glacier', shell: '#b8d0e2', metal: '#e0e7ec', cushion: '#354451' },
  { name: 'Chalk', shell: '#e4dfd2', metal: '#b9ab90', cushion: '#655e55' },
] as const
export type Colourway = (typeof colourways)[number]
export interface ViewerSettings {
  colour: Colourway
  exploded: boolean
  roughness: number
  light: number
  auto: boolean
  enabled: boolean
  active: boolean
  azimuth: number
  elevation: number
  distance: number
  reset: number
}
