import * as THREE from 'three'

/**
 * A standard PBR material that also reads a per-instance `aEmissive` vec3 attribute.
 * Stock MeshStandardMaterial only has ONE emissive colour for the whole mesh, but every
 * key needs its own glow (typing, RGB wave). onBeforeCompile patches that into the shader.
 * Values > 1 make the key "HDR bright" so the Bloom pass picks it up.
 */
export function createGlowMaterial(params: THREE.MeshStandardMaterialParameters) {
  const mat = new THREE.MeshStandardMaterial(params)
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec3 aEmissive;\nvarying vec3 vEmissive;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvEmissive = aEmissive;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vEmissive;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vEmissive;')
  }
  mat.customProgramCacheKey = () => 'kairo-glow'
  return mat
}

export function addEmissiveAttribute(geo: THREE.BufferGeometry, count: number) {
  const attr = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3)
  attr.setUsage(THREE.DynamicDrawUsage)
  geo.setAttribute('aEmissive', attr)
  return attr
}
