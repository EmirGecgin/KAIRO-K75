/**
 * Procedural key sound (no audio files): a short burst of filtered noise for the "clack"
 * plus a quick low sine for the "thock". Created lazily on the first user gesture,
 * because browsers refuse to start an AudioContext before one.
 */
let ctx: AudioContext | null = null
let noise: AudioBuffer | null = null

export function playClick() {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    if (!noise) {
      noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate)
      const d = noise.getChannelData(0)
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 2
    }
    const t = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = noise
    src.playbackRate.value = 0.9 + Math.random() * 0.25
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 2400 + Math.random() * 600
    const g = ctx.createGain()
    g.gain.value = 0.35
    src.connect(bp).connect(g).connect(ctx.destination)
    src.start(t)

    const osc = ctx.createOscillator()
    const og = ctx.createGain()
    osc.frequency.setValueAtTime(190, t)
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.06)
    og.gain.setValueAtTime(0.28, t)
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
    osc.connect(og).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.09)
  } catch {
    /* audio is a nice-to-have: never break typing because of it */
  }
}
