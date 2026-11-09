export type TemplateId =
  | 'portrait'
  | 'story'
  | 'link'
  | 'print'
  | 'classic'

export interface CardTemplate {
  id: TemplateId
  label: string
  /** Card width in CSS pixels. */
  width: number
  /** Card height in CSS pixels. */
  height: number
  /** Human-readable aspect ratio, e.g. "4:5". */
  aspect: string
  /** Default multiplier applied when exporting the PNG. */
  pixelRatio: number
  /** Whether the template can be selected and rendered today. */
  available: boolean
  description: string
}

export const TEMPLATES: Record<TemplateId, CardTemplate> = {
  portrait: {
    id: 'portrait',
    label: 'Portrait',
    width: 1080,
    height: 1350,
    aspect: '4:5',
    pixelRatio: 2,
    available: true,
    description: 'Feed-ready portrait',
  },
  story: {
    id: 'story',
    label: 'Story',
    width: 1080,
    height: 1920,
    aspect: '9:16',
    pixelRatio: 2,
    available: true,
    description: 'Full-screen story',
  },
  link: {
    id: 'link',
    label: 'Link',
    width: 1200,
    height: 630,
    aspect: '1.91:1',
    pixelRatio: 2,
    available: true,
    description: 'Social link preview',
  },
  print: {
    id: 'print',
    label: 'Print',
    width: 750,
    height: 1050,
    aspect: '5:7',
    pixelRatio: 4,
    available: true,
    description: 'High-resolution print',
  },
  classic: {
    id: 'classic',
    label: 'Classic',
    width: 1400,
    height: 1000,
    aspect: '7:5',
    pixelRatio: 2,
    available: true,
    description: 'The original landscape card',
  },
}

export const TEMPLATE_IDS: TemplateId[] = [
  'portrait',
  'story',
  'link',
  'print',
  'classic',
]

export function getTemplate(id: TemplateId): CardTemplate {
  return TEMPLATES[id]
}
