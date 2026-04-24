import * as THREE from 'three'

const CELL_SIZE = 256
const WALL_REPEAT_X = 10 // ≈ WALL_WIDTH / 150
const WALL_REPEAT_Y = 2  // ≈ WALL_HEIGHT / 150

export interface WallConfig {
	noiseFreq: number     // cycles per tile — must be an integer for seamless tiling
	noiseStrength: number // depth of normal-map bumps
	octaves: number       // fractal octaves (integer)
	pitOffset: number     // pit surface threshold: higher = fewer/shallower pits
	radius: number        // mm — edge rounding radius
}

export const DEFAULT_WALL_CONFIG: WallConfig = {
	noiseFreq: 15,
	noiseStrength: 7,
	octaves: 4,
	pitOffset: 0.6,
	radius: 4,
}

function hash(ix: number, iy: number): number {
	let h = (Math.imul(ix, 1664525) + Math.imul(iy, 1013904223)) | 0
	h ^= h >>> 16
	h = Math.imul(h, 0x45d9f3b)
	h ^= h >>> 16
	return (h >>> 0) / 4294967296
}

// Tileable value noise: wraps at period `period` so the texture repeats seamlessly.
// period must be a positive integer for the wrap to produce consistent grid values.
function tiledValueNoise(x: number, y: number, period: number): number {
	const ix = Math.floor(x), iy = Math.floor(y)
	const fx = x - ix, fy = y - iy
	const ux = fx * fx * (3 - 2 * fx)
	const uy = fy * fy * (3 - 2 * fy)
	const p = period
	const a = hash(ix % p, iy % p), b = hash((ix + 1) % p, iy % p)
	const c = hash(ix % p, (iy + 1) % p), d = hash((ix + 1) % p, (iy + 1) % p)
	return a + (b - a) * ux + (c - a) * uy + (d - b - c + a) * ux * uy
}

function fractalNoise(x: number, y: number, config: WallConfig): number {
	let val = 0, amp = 0.5, freq = 1
	for (let i = 0; i < config.octaves; i++) {
		val += tiledValueNoise(x * freq, y * freq, config.noiseFreq * freq) * amp
		amp *= 0.5
		freq *= 2
	}
	return val
}

function sampleHeight(px: number, py: number, config: WallConfig): number {
	const noise = fractalNoise((px / CELL_SIZE) * config.noiseFreq, (py / CELL_SIZE) * config.noiseFreq, config)
	return 1.0 - Math.max(0.0, noise - config.pitOffset)
}

/**
 * Generates a tileable procedural concrete normal map (256×256).
 * noiseFreq must be a positive integer for seamless tiling.
 */
export function generateWallNormalMap(config: WallConfig): THREE.CanvasTexture {
	const canvas = document.createElement('canvas')
	canvas.width = CELL_SIZE
	canvas.height = CELL_SIZE
	const ctx = canvas.getContext('2d')!
	const imageData = ctx.createImageData(CELL_SIZE, CELL_SIZE)
	const data = imageData.data

	const h = (px: number, py: number) => sampleHeight(px, py, config)

	for (let py = 0; py < CELL_SIZE; py++) {
		for (let px = 0; px < CELL_SIZE; px++) {
			const dx = (h(px + 1, py) - h(px - 1, py)) * config.noiseStrength
			const dy = (h(px, py + 1) - h(px, py - 1)) * config.noiseStrength
			const dz = 1.0
			const len = Math.sqrt(dx * dx + dy * dy + dz * dz)

			const idx = (py * CELL_SIZE + px) * 4
			data[idx + 0] = Math.round((dx / len * 0.5 + 0.5) * 255)
			data[idx + 1] = Math.round((dy / len * 0.5 + 0.5) * 255)
			data[idx + 2] = Math.round((dz / len * 0.5 + 0.5) * 255)
			data[idx + 3] = 255
		}
	}

	ctx.putImageData(imageData, 0, 0)
	const texture = new THREE.CanvasTexture(canvas)
	texture.wrapS = THREE.RepeatWrapping
	texture.wrapT = THREE.RepeatWrapping
	texture.repeat.set(WALL_REPEAT_X, WALL_REPEAT_Y)
	return texture
}
