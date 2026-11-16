export const sections = [
  { id: 'hero', no: '01', title: 'Hero' },
  { id: 'exploded', no: '02', title: 'Exploded View' },
  { id: 'type', no: '03', title: 'Type on it' },
  { id: 'switches', no: '04', title: 'Switches' },
  { id: 'rgb', no: '05', title: 'Light it up' },
  { id: 'specs', no: '06', title: 'Specs' },
  { id: 'colorways', no: '07', title: 'Colorways' },
  { id: 'cta', no: '08', title: 'Pre-order' },
] as const

export const PRODUCT = {
  name: 'KAIRO K75',
  tagline: 'Every keystroke, engineered.',
  price: '$189',
  note: 'KAIRO is a fictional brand. Concept project by Emir Geçgin.',
}

/** Exploded-view labels, in reading order (top layer first). */
export const LAYER_COPY = [
  { name: 'Keycaps', text: 'Double-shot PBT, cherry profile. Sculpted for a soft landing.' },
  { name: 'Switches', text: 'Factory-lubed, 5-pin, hot-swappable. Pull one, pop another.' },
  { name: 'Plate', text: '1.2 mm aluminium, flex-cut for a softer bottom-out.' },
  { name: 'Gaskets', text: 'Foam strips float the plate for a muted, bouncy feel.' },
  { name: 'PCB', text: '2.4 GHz, Bluetooth 5.1 and USB-C. South-facing per-key RGB.' },
  { name: 'Case', text: 'CNC-milled aluminium with a 6° typing angle. 1.1 kg of calm.' },
] as const

export const SWITCHES = [
  { id: 'linear', name: 'Linear', tag: 'Smooth from top to bottom. Nothing in the way.', force: '45 gf', travel: '4.0 mm', actuation: '2.0 mm', sound: 'Deep, muted thock' },
  { id: 'tactile', name: 'Tactile', tag: 'A soft bump tells you the key registered.', force: '55 gf', travel: '4.0 mm', actuation: '2.0 mm', sound: 'Rounded, quiet clack' },
  { id: 'clicky', name: 'Clicky', tag: 'A crisp click on every press. Loud and proud.', force: '60 gf', travel: '3.6 mm', actuation: '1.9 mm', sound: 'Sharp, bright click' },
] as const

export const COLORWAYS = [
  { id: 'obsidian', name: 'Obsidian', text: 'Blacked-out aluminium, charcoal caps.', case: '#1d1d21', cap: '#2a2a30' },
  { id: 'arctic', name: 'Arctic', text: 'Frosted white case, ivory caps.', case: '#e4e1d8', cap: '#efece4' },
  { id: 'ember', name: 'Ember', text: 'Ivory board, hot coral modifiers.', case: '#e4e1d8', cap: '#ff4d6d' },
] as const
