import { ReactNode, useState, useEffect, useRef } from 'react'
import { Moment } from '../steps'
import styles from '../styles/textLayer.module.css'

interface Props {
  moments: Moment[]
  currentMoment: number
}

type AnimClass = 'enterFromRight' | 'enterFromLeft' | 'exitToLeft' | 'exitToRight' | null

interface Panel {
  stepText: string
  substepText: string | null
  substepKey: number
  animClass: AnimClass
  key: number
}

// Returns the index of the step moment that begins the current slide
function getSlideStart(momentIndex: number, moments: Moment[]): number {
  for (let i = momentIndex; i >= 0; i--) {
    if (!moments[i].isSubstep) return i
  }
  return 0
}

// Parses *text* into <em> elements
function renderText(text: string): ReactNode[] {
  return text.split(/\*([^*]+)\*/g).map((part, i) =>
    i % 2 === 1 ? <em key={i}>{part}</em> : part
  )
}

export default function TextLayer({ moments, currentMoment }: Props) {
  const panelKeyCounter = useRef(1)
  const substepKeyCounter = useRef(1)

  const [panels, setPanels] = useState<Panel[]>([
    { stepText: moments[0].text, substepText: null, substepKey: 0, animClass: null, key: 0 },
  ])

  const prevMoment = useRef(currentMoment)

  useEffect(() => {
    if (currentMoment === prevMoment.current) return

    const goingForward = currentMoment > prevMoment.current
    const prevSlideStart = getSlideStart(prevMoment.current, moments)
    const currSlideStart = getSlideStart(currentMoment, moments)

    if (currSlideStart !== prevSlideStart) {
      // Crossing a slide boundary — full slide transition
      const exitAnim: AnimClass = goingForward ? 'exitToLeft' : 'exitToRight'
      const enterAnim: AnimClass = goingForward ? 'enterFromRight' : 'enterFromLeft'
      const newSubstepText = moments[currentMoment].isSubstep ? moments[currentMoment].text : null

      setPanels((prev) => {
        const updated = prev.map((p) =>
          p.animClass?.startsWith('exit') ? p : { ...p, animClass: exitAnim }
        )
        return [...updated, {
          stepText: moments[currSlideStart].text,
          substepText: newSubstepText,
          substepKey: newSubstepText ? substepKeyCounter.current++ : 0,
          animClass: enterAnim,
          key: panelKeyCounter.current++,
        }]
      })
    } else {
      // Within the same slide — update substep text without sliding
      const newSubstepText = moments[currentMoment].isSubstep ? moments[currentMoment].text : null
      setPanels((prev) => prev.map((p) =>
        p.animClass?.startsWith('exit') ? p : {
          ...p,
          substepText: newSubstepText,
          substepKey: newSubstepText ? substepKeyCounter.current++ : p.substepKey,
        }
      ))
    }

    prevMoment.current = currentMoment
  }, [currentMoment, moments])

  const handleAnimationEnd = (key: number, animClass: AnimClass) => {
    if (animClass?.startsWith('exit')) {
      setPanels((prev) => prev.filter((p) => p.key !== key))
    }
  }

  return (
    <>
      {panels.map((panel) => (
        <div
          key={panel.key}
          className={`${styles.panel}${panel.animClass ? ` ${styles[panel.animClass]}` : ''}`}
          onAnimationEnd={() => handleAnimationEnd(panel.key, panel.animClass)}
        >
          <p className={styles.text}>{renderText(panel.stepText)}</p>
          {panel.substepText && (
            <p key={panel.substepKey} className={`${styles.text} ${styles.substepText}`}>
              {renderText(panel.substepText)}
            </p>
          )}
        </div>
      ))}
    </>
  )
}
