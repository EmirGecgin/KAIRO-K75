/**
 * Decides how much work the WebGL scene may do. Computed once.
 *  low  – software rasteriser (SwiftShader / llvmpipe, e.g. headless Chrome, broken drivers) or a very weak device:
 *         no post-processing, 1x pixel ratio. It would otherwise block the main thread for seconds.
 *  mid  – phones / small screens: post-processing without MSAA and chromatic aberration, dpr ≤ 1.5.
 *  high – everything else.
 */
export type Tier = 'low' | 'mid' | 'high'

let cached: Tier | undefined

function softwareRenderer(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    if (!gl) return true
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return /swiftshader|llvmpipe|software|basic render/i.test(name)
  } catch {
    return true
  }
}

export function gpuTier(): Tier {
  if (cached) return cached
  const nav = navigator as Navigator & { deviceMemory?: number }
  const weak = (nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2
  const mobile = window.matchMedia('(max-width: 767px)').matches
  cached = weak || softwareRenderer() ? 'low' : mobile ? 'mid' : 'high'
  return cached
}
