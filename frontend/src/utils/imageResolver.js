import { UPLOAD_BASE_URL } from '../services/api'

function clean(value = '') {
  return String(value).toLowerCase().trim()
}

function isValidHttpUrl(value = '') {
  return value.startsWith('http://') || value.startsWith('https://')
}

function resolveStoredImage(value) {
  if (!value) return null

  // External image URL
  if (isValidHttpUrl(value)) return value

  // Local frontend public image
  if (value.startsWith('/images/')) return value

  // Backend uploaded image filename
  return `${UPLOAD_BASE_URL}/${value}`
}

export const GAME_IMAGES = {
  minecraft: '/images/games/minecraft.jpg',
  skyrim: '/images/games/skyrim.jpg',
  'stardew valley': '/images/games/stardew-valley.png',
  'the sims 4': '/images/games/thesims4.png',
  terraria: '/images/games/terraria.jpg',
  'fallout 4': '/images/games/fallout4.jpg',
  'elden ring': '/images/games/eldenring.jpg',
  rimworld: '/images/games/rimworld.jpg',
  'cities skylines': '/images/games/citiesskylines.jpg',
  'baldur\'s gate 3': '/images/games/baldurgate3.jpg',
  'the witcher 3': '/images/games/witcher-3.jpg',
  'monster hunter world': '/images/games/monsterhunterworld.jpg',
  default: '/images/games/default.jpg'
}

export const MOD_TITLE_IMAGES = {
  'neon survival ui': '/images/mods/neon-survival-ui.jpg',
  'crystal biomes': '/images/mods/crystal-biomes.jpg',
  'cozy farm furniture': '/images/mods/cozy-farm-furniture.jpg',
  'modern apartment build kit': '/images/mods/modern-apartment-build-kit.jpg',
  'dragonborn visual overhaul': '/images/mods/dragonborn-visual-overhaul.jpg',
  'pixel cave expansion': '/images/mods/pixel-cave-expansion.jpg',
  'boss arena builder': '/images/mods/boss-arena-builder.jpg',
  'witcher signs visual pack': '/images/mods/witcher-signs-visual-pack.jpg',
  'northern kingdoms reshade': '/images/mods/northern-kingdoms-reshade.jpg'
}

export function resolveGameImage(game) {
  const storedImage = resolveStoredImage(game?.cover_url)
  if (storedImage) return storedImage

  const key = clean(game?.name)
  return GAME_IMAGES[key] || GAME_IMAGES.default
}

export function getGameFallback(gameName) {
  const key = clean(gameName)
  return GAME_IMAGES[key] || GAME_IMAGES.default
}

export function resolveModImage(mod) {
  const storedImage = resolveStoredImage(mod?.image_url)
  if (storedImage) return storedImage

  const title = clean(mod?.title)
  const gameName = clean(mod?.game_name)

  if (MOD_TITLE_IMAGES[title]) {
    return MOD_TITLE_IMAGES[title]
  }

  return GAME_IMAGES[gameName] || GAME_IMAGES.default
}