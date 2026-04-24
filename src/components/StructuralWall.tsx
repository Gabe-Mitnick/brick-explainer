import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { generateWallNormalMap } from '../wallTexture'

interface Props {
	targetOpacity: number
}

const WALL_WIDTH = 1452.5 // matches brick wall extent: 5×(BW+MORTAR) + (BW+MORTAR)/2 + BW, cols=6
const WALL_HEIGHT = 365 // matches brick wall extent: 4×ROW_STEP + BH, rows=5
const BOX_DEPTH = 205 // ~2 × BD (2 × 102.5mm)
const WALL_Z = -203.75 // front face at -101.25mm (50mm behind brick back face), back at -306.25mm
const LERP = 0.05

// Texture tiles every ~150mm. Repeat counts derived from wall dimensions.
const REPEAT_X = Math.round(WALL_WIDTH / 150)  // ≈ 10
const REPEAT_Y = Math.round(WALL_HEIGHT / 150)  // ≈ 2

export default function StructuralWall({ targetOpacity }: Props) {
	const normalMap = useRef<THREE.CanvasTexture | null>(null)
	if (!normalMap.current) {
		normalMap.current = generateWallNormalMap()
		normalMap.current.repeat.set(REPEAT_X, REPEAT_Y)
	}

	const matRef = useRef(
		new THREE.MeshStandardMaterial({
			color: '#888',
			roughness: 0.95,
			metalness: 0.0,
			transparent: true,
			opacity: 0,
			depthWrite: false,
			normalMap: normalMap.current,
			normalScale: new THREE.Vector2(1, 1),
		}),
	)
	const geoRef = useRef(new THREE.BoxGeometry(WALL_WIDTH, WALL_HEIGHT, BOX_DEPTH))

	useFrame(() => {
		matRef.current.opacity += (targetOpacity - matRef.current.opacity) * LERP
	})

	return <mesh position={[0, 0, WALL_Z]} geometry={geoRef.current} material={matRef.current} />
}
