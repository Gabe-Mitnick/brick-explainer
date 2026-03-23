import { useState, useCallback, useEffect } from 'react'
import Scene from './components/Scene'
import TextLayer from './components/TextLayer'
import Controls from './components/Controls'
import DebugMenu from './components/DebugMenu'
import { steps } from './steps'
import styles from './styles/app.module.css'

export interface CameraConfig {
  fov: number   // 0 = orthographic, >0 = perspective (degrees)
  zoom: number  // orthographic zoom level
}

const DEFAULT_CAMERA: CameraConfig = { fov: 0, zoom: 50 }

export default function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [cameraConfig, setCameraConfig] = useState<CameraConfig>(DEFAULT_CAMERA)

  const goNext = useCallback(() => setCurrentStep((s) => Math.min(s + 1, steps.length - 1)), [])
  const goPrev = useCallback(() => setCurrentStep((s) => Math.max(s - 1, 0)), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev])

  return (
    <div className={styles.container}>
      <div className={styles.canvasLayer}>
        <Scene targetConfig={steps[currentStep].scene} cameraConfig={cameraConfig} />
      </div>
      <div className={styles.textLayer}>
        <TextLayer steps={steps} currentStep={currentStep} />
      </div>
      <div className={styles.controlsLayer}>
        <Controls
          currentStep={currentStep}
          totalSteps={steps.length}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>
      {import.meta.env.DEV && (
        <DebugMenu config={cameraConfig} onChange={setCameraConfig} />
      )}
    </div>
  )
}
