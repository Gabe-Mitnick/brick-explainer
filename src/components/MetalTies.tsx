import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  targetOpacity: number
}

const BD = 102.5
const BRICK_BACK_Z = -BD / 2          // -51.25mm — back face of single-wythe brick
const WALL_Z = -280                    // matches StructuralWall.tsx front face area
const TIE_LENGTH = Math.abs(WALL_Z - BRICK_BACK_Z)   // 228.75mm
const TIE_Z_CENTER = (BRICK_BACK_Z + WALL_Z) / 2     // -165.625mm
const TIE_RADIUS = 4
const LERP = 0.05

const X_POSITIONS = [-450, 0, 450]
const Y_POSITIONS = [-80, 80]

const TIES = X_POSITIONS.flatMap((x, xi) =>
  Y_POSITIONS.map((y, yi) => ({ x, y, key: xi * Y_POSITIONS.length + yi }))
)

export default function MetalTies({ targetOpacity }: Props) {
  const geoRef = useRef(new THREE.CylinderGeometry(TIE_RADIUS, TIE_RADIUS, TIE_LENGTH, 8))
  const matRef = useRef(
    new THREE.MeshStandardMaterial({
      color: '#a0a0c0',
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    })
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
          ref={(el) => { meshRefs.current[key] = el }}
          position={[x, y, TIE_Z_CENTER]}
          rotation={[Math.PI / 2, 0, 0]}
          renderOrder={1}  // layer 1: after wall (0), before bricks (row+2)
          geometry={geoRef.current}
          material={matRef.current}
        />
      ))}
    </>
  )
}
