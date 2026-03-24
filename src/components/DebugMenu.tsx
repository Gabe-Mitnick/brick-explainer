import { useEffect, useRef, useState } from 'react'
import { CameraConfig } from '../App'
import styles from '../styles/debugMenu.module.css'

interface Props {
  config: CameraConfig
  onChange: (config: CameraConfig) => void
}

interface SliderRowProps {
  label: string
  value: string | number
  min: number
  max: number
  step: number
  current: number
  onSlide: (value: number) => void
}

function SliderRow({ label, value, min, max, step, current, onSlide }: SliderRowProps) {
  return (
    <div className={styles.row}>
      <div className={styles.label}>
        <span>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onSlide(Number(e.target.value))}
        className={styles.slider}
      />
    </div>
  )
}

export default function DebugMenu({ config, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  return (
    <div className={styles.container} ref={containerRef}>
      <button className={styles.gearButton} onClick={() => setOpen((o) => !o)} title="Debug">
        ⚙
      </button>
      {open && (
        <div className={styles.menu}>
          <div className={styles.title}>Debug</div>
          <SliderRow
            label="FOV"
            value={config.fov === 0 ? 'Orthographic' : `${config.fov}°`}
            min={0} max={90} step={1} current={config.fov}
            onSlide={(fov) => onChange({ ...config, fov })}
          />
          <SliderRow
            label="Zoom"
            value={config.zoom}
            min={0.1} max={5} step={0.05} current={config.zoom}
            onSlide={(zoom) => onChange({ ...config, zoom })}
          />
        </div>
      )}
    </div>
  )
}
