import * as THREE from 'three'

const CELL_SIZE = 256

// Noise frequency in cycles per tile. Must be an integer for the texture to tile seamlessly.
// Each tile represents ~150mm of wall; at NOISE_FREQ=12 that's ~12.5mm per grain,
// close to coarse concrete aggregate size.
const NOISE_FREQ = 12
const NOISE_STRENGTH = 2.5
const OCTAVES = 3
// Pit surface: surface is flat at height 1, with pits where noise exceeds this threshold.
// Higher = fewer/shallower pits; lower = more/deeper pits. Same model as brickTextures.ts.
const PIT_OFFSET = 0.6

function hash(ix: number, iy: number): number {
	let h = (Math.imul(ix, 1664525) + Math.imul(iy, 1013904223)) | 0
	h ^= h >>> 16
	h = Math.imul(h, 0x45d9f3b)
	h ^= h >>> 16
	return (h >>> 0) / 4294967296
}

// Tileable value noise: wraps at period `period` in both axes so the texture repeats seamlessly.
function tiledValueNoise(x: number, y: number, period: number): number {
	const ix = Math.floor(x), iy = Math.floor(y)
	const fx = x - ix, fy = y - iy
	const ux = fx * fx * (3 - 2 * fx)
	const uy = fy * fy * (3 - 2 * fy)
	// Wrap grid coordinates so hash(0,...) == hash(period,...) etc.
	const p = period
	const a = hash(ix % p, iy % p), b = hash((ix + 1) % p, iy % p)
	const c = hash(ix % p, (iy + 1) % p), d = hash((ix + 1) % p, (iy + 1) % p)
	return a + (b - a) * ux + (c - a) * uy + (d - b - c + a) * ux * uy
}

function fractalNoise(x: number, y: number): number {
	let val = 0, amp = 0.5, freq = 1
	for (let i = 0; i < OCTAVES; i++) {
		// Each octave tiles at period = NOISE_FREQ * freq (still an integer since both are powers of 2 × NOISE_FREQ)
		val += tiledValueNoise(x * freq, y * freq, NOISE_FREQ * freq) * amp
		amp *= 0.5
		freq *= 2
	}
	return val
}

function sampleHeight(px: number, py: number): number {
	const noise = fractalNoise((px / CELL_SIZE) * NOISE_FREQ, (py / CELL_SIZE) * NOISE_FREQ)
	return 1.0 - Math.max(0.0, noise - PIT_OFFSET)
}

/**
 * Generates a tileable procedural concrete normal map (256×256).
 * The texture tiles seamlessly and is designed to repeat every ~150mm of wall surface.
 */
export function generateWallNormalMap(): THREE.CanvasTexture {
	const canvas = document.createElement('canvas')
	canvas.width = CELL_SIZE
	canvas.height = CELL_SIZE
	const ctx = canvas.getContext('2d')!
	const imageData = ctx.createImageData(CELL_SIZE, CELL_SIZE)
	const data = imageData.data

	const h = (px: number, py: number) => sampleHeight(px, py)

	for (let py = 0; py < CELL_SIZE; py++) {
		for (let px = 0; px < CELL_SIZE; px++) {
			// Finite-difference gradient — same convention as brickTextures.ts
			const dx = (h(px + 1, py) - h(px - 1, py)) * NOISE_STRENGTH
			const dy = (h(px, py + 1) - h(px, py - 1)) * NOISE_STRENGTH
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
	return texture
}
