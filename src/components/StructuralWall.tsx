import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
	targetOpacity: number
}

const WALL_WIDTH = 1800
const WALL_HEIGHT = 600
const BOX_DEPTH = 307.5 // 3 × BD (102.5mm)
const WALL_Z = -255 // box center; front face at ~-101mm, ~50mm behind brick back face
const LERP = 0.05

export default function StructuralWall({ targetOpacity }: Props) {
	const matRef = useRef(
		new THREE.MeshStandardMaterial({
			color: '#888',
			roughness: 0.9,
			metalness: 0.0,
			transparent: true,
			opacity: 0,
			depthWrite: false,
		}),
	)
	const geoRef = useRef(new THREE.BoxGeometry(WALL_WIDTH, WALL_HEIGHT, BOX_DEPTH))

	useFrame(() => {
		matRef.current.opacity += (targetOpacity - matRef.current.opacity) * LERP
	})

	return <mesh position={[0, 0, WALL_Z]} geometry={geoRef.current} material={matRef.current} />
}
