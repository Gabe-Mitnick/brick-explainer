import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
	targetOpacity: number
}

const BD = 102.5
const BW = 215 // mm — brick stretcher length
const BRICK_FRONT_Z = -BD / 2 // -51.25mm — face of brick that faces the air gap
const CONCRETE_FRONT_Z = -101.25 // front face of ConcreteWall (center -203.75 + half-depth 102.5)
const TIE_START_Z = BRICK_FRONT_Z + 0.25 * BW // +2.5mm — anchor point inside brick
const TIE_END_Z = CONCRETE_FRONT_Z // -101.25mm
const TIE_LENGTH = Math.abs(TIE_END_Z - TIE_START_Z) // ~103.75mm
const TIE_Z_CENTER = (TIE_START_Z + TIE_END_Z) / 2 // ~-49.375mm

const RIBBON_WIDTH = 30  // mm — ribbon width along X
const RIBBON_THICK = 2   // mm — ribbon thickness along Y
const WAVE_AMP = 3.5     // mm — sine wave amplitude (peak-to-neutral)
const WAVE_LEN = 22.5    // mm — wavelength
const SEGS_PER_WAVE = 12
const LERP = 0.05

// Mortar joint Y centres for a 5-row wall (row centres: -150, -75, 0, 75, 150).
// Joint between rows r and r+1: rowCentre + BH/2 + MORTAR/2 = rowCentre + 37.5
// Outer joints: -150+37.5=-112.5 and 75+37.5=112.5
const X_POSITIONS = [-450, 0, 450]
const Y_POSITIONS = [-112.5, 112.5]

const TIES = X_POSITIONS.flatMap((x, xi) => Y_POSITIONS.map((y, yi) => ({ x, y, key: xi * Y_POSITIONS.length + yi })))

// Wavy ribbon geometry: 20mm wide (X), 2mm thick (Y), centered at z=0 spanning ±TIE_LENGTH/2.
// Profile (YZ side view) follows a sine wave: y = WAVE_AMP * sin(2π·z / WAVE_LEN).
function makeRibbonGeo(): THREE.BufferGeometry {
	const numSegs = Math.max(4, Math.ceil((TIE_LENGTH / WAVE_LEN) * SEGS_PER_WAVE))
	const numSlices = numSegs + 1
	const hw = RIBBON_WIDTH / 2
	const ht = RIBBON_THICK / 2

	// 4 verts per slice: left-top (0), right-top (1), left-bottom (2), right-bottom (3)
	const positions = new Float32Array(numSlices * 4 * 3)

	for (let i = 0; i < numSlices; i++) {
		const z = -TIE_LENGTH / 2 + (i / numSegs) * TIE_LENGTH
		const yc = WAVE_AMP * Math.sin((2 * Math.PI * z) / WAVE_LEN)
		const b = i * 12
		positions[b + 0] = -hw; positions[b + 1]  = yc + ht; positions[b + 2]  = z
		positions[b + 3] =  hw; positions[b + 4]  = yc + ht; positions[b + 5]  = z
		positions[b + 6] = -hw; positions[b + 7]  = yc - ht; positions[b + 8]  = z
		positions[b + 9] =  hw; positions[b + 10] = yc - ht; positions[b + 11] = z
	}

	const indices: number[] = []
	for (let i = 0; i < numSegs; i++) {
		const b = i * 4, n = b + 4
		// top face (+Y)
		indices.push(b, n, b + 1, n, n + 1, b + 1)
		// bottom face (−Y, reversed winding)
		indices.push(b + 2, b + 3, n + 2, n + 2, b + 3, n + 3)
		// left edge (−X)
		indices.push(b, b + 2, n, n, b + 2, n + 2)
		// right edge (+X)
		indices.push(b + 1, n + 1, b + 3, n + 1, n + 3, b + 3)
	}

	const geo = new THREE.BufferGeometry()
	geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
	geo.setIndex(indices)
	geo.computeVertexNormals()
	return geo
}

export default function MetalTies({ targetOpacity }: Props) {
	const geoRef = useRef(makeRibbonGeo())
	const matRef = useRef(
		new THREE.MeshStandardMaterial({
			color: '#d0d0d8',
			roughness: 0.25,
			metalness: 0.5,
			transparent: true,
			opacity: 0,
			depthWrite: false,
		}),
	)
	const lerpedOpacity = useRef(0)
	const meshRefs = useRef<(THREE.Mesh | null)[]>([])

	useFrame(() => {
		lerpedOpacity.current += (targetOpacity - lerpedOpacity.current) * LERP
		matRef.current.opacity = lerpedOpacity.current
		const show = lerpedOpacity.current > 0.01
		for (const mesh of meshRefs.current) {
			if (mesh) mesh.visible = show
		}
	})

	return (
		<>
			{TIES.map(({ x, y, key }) => (
				<mesh
					key={key}
					ref={(el) => {
						meshRefs.current[key] = el
					}}
					position={[x, y, TIE_Z_CENTER]}
					renderOrder={1} // layer 1: after wall (0), before bricks (row+2)
					geometry={geoRef.current}
					material={matRef.current}
				/>
			))}
		</>
	)
}
