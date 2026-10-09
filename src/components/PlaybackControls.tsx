import type { usePlayback } from '../motion/usePlayback'
export function PlaybackControls({
  playback,
}: {
  playback: ReturnType<typeof usePlayback>
}) {
  const disabled = playback.reduced || playback.globalPaused
  return (
    <div className="playback-controls">
      <button
        className="studio-button"
        onClick={playback.toggle}
        disabled={disabled}
      >
        {playback.playing && !playback.completed
          ? 'Pause animation'
          : 'Play animation'}
      </button>
      <button
        className="studio-button secondary"
        onClick={playback.replay}
        disabled={disabled}
      >
        Replay
      </button>
      <p role="status" className="playback-status">
        {playback.status}
      </p>
    </div>
  )
}
