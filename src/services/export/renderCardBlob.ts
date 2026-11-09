import { toPng } from 'html-to-image'

import type { CardTemplate } from '../../lib/cardTemplates'

export async function renderCardBlob(
  node: HTMLElement,
  template: CardTemplate,
  backgroundColor: string,
): Promise<Blob> {
  await document.fonts.ready
  const dataUrl = await toPng(node, {
    width: template.width,
    height: template.height,
    pixelRatio: template.pixelRatio,
    cacheBust: true,
    backgroundColor,
  })
  const response = await fetch(dataUrl)
  return response.blob()
}
