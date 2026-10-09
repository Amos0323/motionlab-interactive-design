import { motion } from 'motion/react'
import { MotionProvider } from './motion/MotionProvider'
import { useMotionPreferences } from './motion/context'
import { motionTokens } from './motion/tokens'
import { Reveal } from './motion/Reveal'
import { MotionToggle } from './components/MotionToggle'
import { OrbitArtwork } from './components/OrbitArtwork'
import { ExperimentCard } from './components/ExperimentCard'
import { experiments } from './data/experiments'
import { ExperimentRouter } from './experiments/ExperimentRouter'
function HeroTitle() {
  const { enabled } = useMotionPreferences()
  return (
    <h1>
      <span className="sr-only">Ideas in motion.</span>
      <span aria-hidden="true">
        {['Ideas', 'in', 'motion.'].map((word, index) => (
          <span className="word-mask" key={word}>
            <motion.span
              className={index === 2 ? 'accent-word' : undefined}
              initial={enabled ? { y: '105%' } : false}
              animate={{ y: 0 }}
              transition={{
                duration: enabled ? motionTokens.duration.enter : 0,
                delay: enabled ? index * 0.12 : 0,
                ease: motionTokens.ease,
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </span>
    </h1>
  )
}
function LandingPage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="shell" id="top">
        <header className="header">
          <a href="#top" className="wordmark" aria-label="MOTIONLAB home">
            MOTIONLAB <span aria-hidden="true">✳</span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#experiments">Experiments</a>
            <a href="#approach">Approach</a>
          </nav>
          <MotionToggle />
        </header>
        <main id="main" tabIndex={-1}>
          <section className="hero" aria-label="Introduction">
            <div className="hero-copy">
              <HeroTitle />
              <p>
                An evolving playground for visual systems, expressive
                interfaces, and the details that make digital feel alive.
              </p>
              <a className="primary-link" href="#experiments">
                Explore the experiments <span aria-hidden="true">↘</span>
              </a>
            </div>
            <div className="hero-art">
              <OrbitArtwork />
            </div>
          </section>
          <div className="section-rule">
            <span>01 / Studies in movement</span>
            <span>Designed to be felt.</span>
          </div>
          <section
            id="experiments"
            className="experiments"
            aria-labelledby="experiments-title"
          >
            <Reveal className="section-heading">
              <h2 id="experiments-title">
                Small experiments.
                <br />
                Endless possibilities.
              </h2>
              <p>
                Five ways to make it move.
                <br />
                Open a studio. Explore the possibilities.
              </p>
            </Reveal>
            <div className="experiment-grid">
              {experiments.map((experiment) => (
                <ExperimentCard key={experiment.id} experiment={experiment} />
              ))}
            </div>
          </section>
          <section
            id="approach"
            className="approach"
            aria-labelledby="approach-title"
          >
            <Reveal>
              <h2 id="approach-title">
                Motion with
                <br />
                intention.
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <span className="principle-symbol" aria-hidden="true">
                ✳
              </span>
              <h3>Expressive by design</h3>
              <p>
                Motion as a medium for clearer ideas, richer emotion, and more
                human experiences.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <span className="principle-symbol" aria-hidden="true">
                ◎
              </span>
              <h3>Built for interaction</h3>
              <p>
                Exploratory, tactile, and responsive systems that invite
                participation.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <span className="principle-symbol" aria-hidden="true">
                ✺
              </span>
              <h3>Accessible by default</h3>
              <p>
                Considered motion, legible hierarchies, and experiences that
                work for more people.
              </p>
            </Reveal>
          </section>
        </main>
        <footer className="footer">
          <div>
            <a className="wordmark" href="#top">
              MOTIONLAB <span aria-hidden="true">✳</span>
            </a>
            <p>A work in progress, thoughtfully.</p>
          </div>
          <a className="text-link" href="#top">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </footer>
      </div>
    </>
  )
}
export function App() {
  const experiment = new URLSearchParams(window.location.search).get(
    'experiment',
  )
  return (
    <MotionProvider>
      {experiment ? <ExperimentRouter id={experiment} /> : <LandingPage />}
    </MotionProvider>
  )
}
