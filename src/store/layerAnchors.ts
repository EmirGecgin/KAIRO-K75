/**
 * Screen-space anchor of every keyboard layer, written by the 3D scene every frame
 * and read by the HTML labels in the Exploded section.
 * A plain mutable module (not Zustand): this changes 60x/sec and must not trigger React renders.
 * Index = reading order (0 keycaps … 5 case).
 */
export interface LayerAnchor { x: number; y: number; open: number }
export const layerAnchors: LayerAnchor[] = Array.from({ length: 6 }, () => ({ x: 0, y: 0, open: 0 }))
