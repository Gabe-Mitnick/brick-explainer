import * as THREE from 'three'

// Atlas layout constants
const ATLAS_COLS = 15
const ATLAS_ROWS = 14 // 210 cells ≥ MAX_BRICKS (200)
const CELL_SIZE = 64
// How far apart adjacent cells are in noise-coordinate space (>1 = no overlap between cells)
const CELL_STRIDE = 2.0

// Fast integer hash — avoids Math.sin, runs ~10x faster for large texture generation
function hash(ix: number, iy: number, seed: number): number {
	let h = (Math.imul(ix, 1664525) + Math.imul(iy, 1013904223) + Math.imul(seed | 0, 1518500249)) | 0
	h ^= h >>> 16; h = Math.imul(h, 0x45d9f3b); h ^= h >>> 16
	return (h >>> 0) / 4294967296
}

function valueNoise(x: number, y: number, seed: number): number {
	const ix = Math.floor(x)
	const iy = Math.floor(y)
	const fx = x - ix
	const fy = y - iy
	const ux = fx * fx * (3 - 2 * fx)
	const uy = fy * fy * (3 - 2 * fy)
	const a = hash(ix, iy, seed)
	const b = hash(ix + 1, iy, seed)
	const c = hash(ix, iy + 1, seed)
	const d = hash(ix + 1, iy + 1, seed)
	return a + (b - a) * ux + (c - a) * uy + (d - b - c + a) * ux * uy
}

function fractalNoise(x: number, y: number, seed: number, octaves = 4): number {
	let val = 0
	let amp = 0.5
	let freq = 1
	for (let i = 0; i < octaves; i++) {
		val += valueNoise(x * freq, y * freq, seed + i * 31) * amp
		amp *= 0.5
		freq *= 2
	}
	return val
}

export interface TextureDebugConfig {
	noiseStrength: number // depth of normal-map bumps
	noiseFrequency: number // spatial frequency of bumps
	pitOffset: number // higher = fewer/shallower pits; lower = more/deeper pits
}

export const DEFAULT_TEXTURE_DEBUG: TextureDebugConfig = {
	noiseStrength: 5.0,
	noiseFrequency: 20.0,
	pitOffset: 0.55,
}

// Each cell offsets its noise coordinates by CELL_STRIDE, giving a unique pattern per brick.
function sampleHeight(px: number, py: number, cellCol: number, cellRow: number, config: TextureDebugConfig): number {
	const nx = (px / CELL_SIZE + cellCol * CELL_STRIDE) * config.noiseFrequency
	const ny = (py / CELL_SIZE + cellRow * CELL_STRIDE) * config.noiseFrequency
	const noise = fractalNoise(nx, ny, 0)
	return 1.0 - Math.max(0.0, noise - config.pitOffset)
}

export interface BrickTextures {
	atlas: THREE.CanvasTexture
	// Per-brick clones of the atlas with different UV offsets — share one GPU upload
	maps: THREE.CanvasTexture[]
}

export function generateBrickTextures(config: TextureDebugConfig): BrickTextures {
	const atlasW = ATLAS_COLS * CELL_SIZE
	const atlasH = ATLAS_ROWS * CELL_SIZE

	const canvas = document.createElement('canvas')
	canvas.width = atlasW
	canvas.height = atlasH
	const ctx = canvas.getContext('2d')!
	const imageData = ctx.createImageData(atlasW, atlasH)

	for (let cellRow = 0; cellRow < ATLAS_ROWS; cellRow++) {
		for (let cellCol = 0; cellCol < ATLAS_COLS; cellCol++) {
			for (let py = 0; py < CELL_SIZE; py++) {
				for (let px = 0; px < CELL_SIZE; px++) {
					const h = (dpx: number, dpy: number) => sampleHeight(px + dpx, py + dpy, cellCol, cellRow, config)
					const nx = (h(1, 0) - h(-1, 0)) * config.noiseStrength
					const ny = (h(0, 1) - h(0, -1)) * config.noiseStrength
					const nz = 1.0
					const len = Math.sqrt(nx * nx + ny * ny + nz * nz)

					const atlasX = cellCol * CELL_SIZE + px
					const atlasY = cellRow * CELL_SIZE + py
					const i = (atlasY * atlasW + atlasX) * 4
					imageData.data[i + 0] = Math.round((nx / len * 0.5 + 0.5) * 255)
					imageData.data[i + 1] = Math.round((ny / len * 0.5 + 0.5) * 255)
					imageData.data[i + 2] = Math.round((nz / len * 0.5 + 0.5) * 255)
					imageData.data[i + 3] = 255
				}
			}
		}
	}

	ctx.putImageData(imageData, 0, 0)
	const atlas = new THREE.CanvasTexture(canvas)
	atlas.colorSpace = THREE.NoColorSpace

	// Each clone shares the atlas Source (one GPU upload). flipY=true means canvas row r
	// maps to UV V = (ATLAS_ROWS - r - 1) / ATLAS_ROWS, so offset.y is adjusted accordingly.
	const maps: THREE.CanvasTexture[] = []
	for (let i = 0; i < ATLAS_COLS * ATLAS_ROWS; i++) {
		const col = i % ATLAS_COLS
		const row = Math.floor(i / ATLAS_COLS)
		const map = atlas.clone() as THREE.CanvasTexture
		map.repeat.set(1 / ATLAS_COLS, 1 / ATLAS_ROWS)
		map.offset.set(col / ATLAS_COLS, (ATLAS_ROWS - row - 1) / ATLAS_ROWS)
		maps.push(map)
	}

	return { atlas, maps }
}
