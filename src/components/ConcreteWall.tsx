import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { generateWallNormalMap, WallConfig } from '../wallTexture'

interface Props {
	targetOpacity: number
	wallConfig: WallConfig
}

const WALL_WIDTH = 1452.5 // matches brick wall extent: 5×(BW+MORTAR) + (BW+MORTAR)/2 + BW, cols=6
const WALL_HEIGHT = 365 // matches brick wall extent: 4×ROW_STEP + BH, rows=5
const BOX_DEPTH = 205 // ~2 × BD (2 × 102.5mm)
const WALL_Z = -203.75 // front face at -101.25mm (50mm behind brick back face), back at -306.25mm
const ROUND_SEGMENTS = 4
const LERP = 0.05

function makeGeo(radius: number): THREE.BufferGeometry {
	const r = Math.min(radius, Math.min(WALL_WIDTH, WALL_HEIGHT, BOX_DEPTH) / 2 - 0.1)
	return new RoundedBoxGeometry(WALL_WIDTH, WALL_HEIGHT, BOX_DEPTH, ROUND_SEGMENTS, r)
}

export default function ConcreteWall({ targetOpacity, wallConfig }: Props) {
	const normalMap = useRef<THREE.CanvasTexture | null>(null)
	if (!normalMap.current) normalMap.current = generateWallNormalMap(wallConfig)

	const geoRef = useRef<THREE.BufferGeometry | null>(null)
	if (!geoRef.current) geoRef.current = makeGeo(wallConfig.radius)

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

	const skipFirstTextureRegen = useRef(true)
	useEffect(() => {
		if (skipFirstTextureRegen.current) {
			skipFirstTextureRegen.current = false
			return
		}
		const oldMap = normalMap.current!
		const newMap = generateWallNormalMap(wallConfig)
		normalMap.current = newMap
		matRef.current.normalMap = newMap
		matRef.current.needsUpdate = true
		oldMap.dispose()
	}, [wallConfig.noiseFreq, wallConfig.noiseStrength, wallConfig.octaves, wallConfig.pitOffset])

	const skipFirstGeoRegen = useRef(true)
	useEffect(() => {
		if (skipFirstGeoRegen.current) {
			skipFirstGeoRegen.current = false
			return
		}
		const oldGeo = geoRef.current!
		geoRef.current = makeGeo(wallConfig.radius)
		meshRef.current!.geometry = geoRef.current
		oldGeo.dispose()
	}, [wallConfig.radius])

	useEffect(() => {
		return () => {
			normalMap.current?.dispose()
			geoRef.current?.dispose()
		}
	}, [])

	const meshRef = useRef<THREE.Mesh | null>(null)

	useFrame(() => {
		matRef.current.opacity += (targetOpacity - matRef.current.opacity) * LERP
	})

	return (
		<mesh
			ref={meshRef}
			position={[0, 0, WALL_Z]}
			geometry={geoRef.current!}
			material={matRef.current}
		/>
	)
}
