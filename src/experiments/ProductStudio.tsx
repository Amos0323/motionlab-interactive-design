import { lazy, Suspense, useCallback, useState } from 'react'
import { ExperimentLayout } from '../components/ExperimentLayout'
import { useMotionPreferences } from '../motion/context'
import { colourways } from '../three/settings'
import { ProductFallback } from '../three/ProductFallback'
import { ViewerBoundary } from '../three/ViewerBoundary'
import { useViewerVisibility } from '../three/useViewerVisibility'
import '../styles/product.css'
const ProductScene = lazy(() => import('../three/ProductScene'))
export default function ProductStudio() {
  const [colour, setColour] = useState<(typeof colourways)[number]>(
    colourways[1],
  )
  const [auto, setAuto] = useState(false)
  const [exploded, setExploded] = useState(false)
  const [roughness, setRoughness] = useState(0.35)
  const [light, setLight] = useState(1)
  const [azimuth, setAzimuth] = useState(0.65)
  const [elevation, setElevation] = useState(0.2)
  const [distance, setDistance] = useState(6.7)
  const [reset, setReset] = useState(0)
  const [staticView, setStaticView] = useState(false)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState(
    'Choose a finish. Explore the construction.',
  )
  const { enabled, reduced } = useMotionPreferences()
  const { ref, active } = useViewerVisibility()
  const onFailure = useCallback(() => {
    setFailed(true)
    setMessage(
      '3D is unavailable. The static product illustration is available.',
    )
  }, [])
  const onReady = useCallback(() => setReady(true), [])
  const fallback = (
    <>
      <ProductFallback colour={colour} exploded={exploded} />
      <p className="viewer-notice">
        Static product illustration. All product details remain available.
      </p>
    </>
  )
  const settings = {
    colour,
    exploded,
    roughness,
    light,
    auto,
    enabled,
    active,
    azimuth,
    elevation,
    distance,
    reset,
  }
  const unavailable = staticView || failed
  function resetCamera() {
    setAzimuth(0.65)
    setElevation(0.2)
    setDistance(6.7)
    setAuto(false)
    setReset((v) => v + 1)
    setMessage('Camera reset to the three-quarter view.')
  }
  return (
    <ExperimentLayout
      number="05"
      category="Interactive 3D"
      title="Sound. In a new dimension."
      introduction="Meet AURA. An original headphone concept, shaped in code. Explore its finish, find your angle, and pull the construction apart."
      explanation="An original procedural model: curved headband, independent ear cups, cushions, connecting arms and metallic trim. Exploded view separates seven groups and returns each to its exact assembled transform. This is a visual concept, not a manufactured product."
      technology="Three.js · React Three Fiber · Drei OrbitControls · Physically based materials · Dynamic shadows. Geometry and materials are editable code; no downloaded model, HDR image or product render is used."
      accessibility="Every setting has an HTML control. Camera buttons offer a keyboard alternative to dragging. Device reduced motion and global pause remove continuous rotation and transitions. A selectable SVG illustration and product description remain available without WebGL."
    >
      <div className="product-workbench">
        <section className="product-display" aria-label="Product viewer">
          <div className="product-topline">
            <span>AURA / 001</span>
            <span>FORM × FREQUENCY</span>
          </div>
          <div
            className="product-stage"
            ref={ref}
            aria-label="Headphone visualisation"
            aria-describedby="viewer-instructions"
          >
            {unavailable ? (
              fallback
            ) : (
              <ViewerBoundary fallback={fallback} onFailure={onFailure}>
                <Suspense
                  fallback={
                    <>
                      <ProductFallback colour={colour} exploded={exploded} />
                      <p className="viewer-notice" role="status">
                        Loading the 3D studio…
                      </p>
                    </>
                  }
                >
                  <ProductScene
                    settings={settings}
                    onFailure={onFailure}
                    onReady={onReady}
                  />
                </Suspense>
              </ViewerBoundary>
            )}
            <span className="stage-word" aria-hidden="true">
              AURA
            </span>
          </div>
          <div className="viewer-caption">
            <span>
              {colour.name} / {exploded ? 'Exploded construction' : 'Assembled'}
            </span>
            <span>
              {unavailable
                ? '2D illustration'
                : ready
                  ? 'Real-time 3D'
                  : 'Preparing 3D'}
            </span>
          </div>
          <p id="viewer-instructions" className="control-note">
            Drag to orbit with a mouse, or swipe horizontally with touch. Use
            the camera buttons to rotate and zoom with a keyboard. Vertical
            swipes and the mouse wheel scroll the page.
          </p>
          <div
            className="camera-buttons"
            role="group"
            aria-label="Camera controls"
          >
            <button
              className="choice"
              disabled={unavailable}
              onClick={() => {
                setAzimuth((v) => v - 0.35)
                setAuto(false)
              }}
            >
              Rotate left
            </button>
            <button
              className="choice"
              disabled={unavailable}
              onClick={() => {
                setAzimuth((v) => v + 0.35)
                setAuto(false)
              }}
            >
              Rotate right
            </button>
            <button
              className="choice"
              disabled={unavailable}
              onClick={() => setElevation((v) => Math.min(0.9, v + 0.2))}
            >
              View above
            </button>
            <button
              className="choice"
              disabled={unavailable || distance <= 4.8}
              onClick={() => setDistance((v) => Math.max(4.8, v - 0.5))}
            >
              Zoom in
            </button>
            <button
              className="choice"
              disabled={unavailable || distance >= 8}
              onClick={() => setDistance((v) => Math.min(8, v + 0.5))}
            >
              Zoom out
            </button>
            <button
              className="choice"
              disabled={unavailable}
              onClick={resetCamera}
            >
              Reset camera
            </button>
          </div>
          <button
            className="text-link static-toggle"
            aria-pressed={staticView}
            onClick={() => {
              setStaticView((v) => !v)
              setReady(false)
            }}
          >
            Static illustration
          </button>
        </section>
        <aside
          className="control-panel product-controls"
          aria-label="Product settings"
        >
          <p className="studio-index">WIRELESS / OVER-EAR CONCEPT</p>
          <h2>
            Designed to
            <br />
            be explored.
          </h2>
          <p className="control-note">
            Soft cushions. A continuous arc. Precision metallic details. A study
            in the balance between comfort and structure.
          </p>
          <fieldset>
            <legend>Colourway — {colour.name}</legend>
            <div className="choice-grid">
              {colourways.map((item) => (
                <button
                  key={item.name}
                  className="choice swatch-choice"
                  aria-pressed={colour.name === item.name}
                  onClick={() => {
                    setColour(item)
                    setMessage(`${item.name} colourway selected.`)
                  }}
                >
                  <span style={{ background: item.shell }} aria-hidden="true" />
                  {item.name}
                </button>
              ))}
            </div>
          </fieldset>
          <label htmlFor="finish">
            Material finish — {roughness < 0.5 ? 'Satin' : 'Matte'}
            <input
              id="finish"
              type="range"
              min="0.15"
              max="0.9"
              step="0.05"
              value={roughness}
              disabled={unavailable}
              onChange={(event) => setRoughness(Number(event.target.value))}
            />
          </label>
          <label htmlFor="light">
            Studio lighting
            <input
              id="light"
              type="range"
              min="0.4"
              max="1.8"
              step="0.1"
              value={light}
              disabled={unavailable}
              onChange={(event) => setLight(Number(event.target.value))}
            />
          </label>
          <button
            className="studio-button secondary"
            aria-pressed={auto}
            disabled={!enabled || unavailable}
            onClick={() => setAuto((v) => !v)}
          >
            Automatic rotation
          </button>
          <button
            className="studio-button"
            aria-pressed={exploded}
            onClick={() => {
              setExploded((v) => !v)
              setMessage(
                exploded
                  ? 'Headphones assembled.'
                  : 'Exploded view: headband, arms, cups and cushions separated.',
              )
            }}
          >
            Exploded view
          </button>
          <p className="control-note">
            {reduced
              ? 'Reduced motion: immediate changes, no automatic rotation.'
              : !enabled
                ? 'Motion paused: immediate changes, no automatic rotation.'
                : 'Motion is optional. Automatic rotation starts only when selected.'}
          </p>
          <p className="product-status" role="status">
            {message}
          </p>
          <details className="product-details">
            <summary>Construction details</summary>
            <dl>
              <dt>Headband</dt>
              <dd>Curved shell with an inner padded arc.</dd>
              <dt>Ear cups</dt>
              <dd>Elliptical shells, metallic rings and recessed accents.</dd>
              <dt>Cushions</dt>
              <dd>Soft toroidal pads with a dark inner surface.</dd>
              <dt>Assembly</dt>
              <dd>Independent arms join the band to both cups.</dd>
            </dl>
          </details>
        </aside>
      </div>
    </ExperimentLayout>
  )
}
