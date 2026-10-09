import { useEffect, type ReactNode } from 'react'
import { MotionToggle } from './MotionToggle'
interface ExperimentLayoutProps {
  category?: string
  number: string
  title: string
  introduction: string
  children: ReactNode
  explanation: string
  technology: string
  accessibility: string
}
export function ExperimentLayout({
  category = 'Interactive 2D',
  number,
  title,
  introduction,
  children,
  explanation,
  technology,
  accessibility,
}: ExperimentLayoutProps) {
  useEffect(() => {
    document.title = title + ' — MOTIONLAB'
    return () => {
      document.title = 'MOTIONLAB — Ideas in motion'
    }
  }, [title])
  return (
    <>
      <a className="skip-link" href="#demo-main">
        Skip to demo
      </a>
      <div className="shell studio-shell">
        <header className="header">
          <a className="wordmark" href="/" aria-label="MOTIONLAB home">
            MOTIONLAB <span aria-hidden="true">✳</span>
          </a>
          <nav aria-label="Experiment navigation">
            <a href="/#experiments">All experiments</a>
          </nav>
          <MotionToggle />
        </header>
        <main id="demo-main" tabIndex={-1}>
          <div className="studio-heading">
            <a className="text-link" href="/#experiments">
              ← Return to gallery
            </a>
            <p className="studio-index">
              Experiment {number} / {category}
            </p>
            <h1>{title}</h1>
            <p className="studio-intro">{introduction}</p>
          </div>
          {children}
          <section className="studio-notes" aria-label="About this experiment">
            <div>
              <h2>Behind the motion</h2>
              <p>{explanation}</p>
            </div>
            <div>
              <h2>Made with</h2>
              <p>{technology}</p>
            </div>
            <div>
              <h2>Considered for everyone</h2>
              <p>{accessibility}</p>
            </div>
          </section>
        </main>
        <footer className="footer">
          <span className="wordmark">
            MOTIONLAB <span aria-hidden="true">✳</span>
          </span>
          <a className="text-link" href="/#experiments">
            Return to gallery ↗
          </a>
        </footer>
      </div>
    </>
  )
}
