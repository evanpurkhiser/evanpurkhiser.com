const variants = [
  {id: '16', size: 16, stroke: 1.5, margin: 1},
  {id: '32', size: 32, stroke: 3, margin: 2},
  {id: '48', size: 48, stroke: 4, margin: 4},
];

export function generateImageMetadata() {
  return variants.map(({id, size}) => ({
    id,
    size: {width: size, height: size},
    contentType: 'image/svg+xml',
  }));
}

export default async function Icon({id}: {id: Promise<string>}) {
  const resolvedId = await id;
  const variant = variants.find(({id: variantId}) => variantId === resolvedId);

  if (!variant) {
    return new Response(null, {status: 404});
  }

  const {size, stroke, margin} = variant;
  const center = size / 2;
  const radius = center - margin - stroke / 2;
  const diagonal = radius / Math.SQRT2;
  const lines = [
    [center, center - radius, center, center + radius],
    [center - radius, center, center + radius, center],
    [center - diagonal, center + diagonal, center + diagonal, center - diagonal],
    [center + diagonal, center + diagonal, center - diagonal, center - diagonal],
  ];
  const paths = lines
    .map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1}L${x2} ${y2}"/>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" stroke="#ff6800" stroke-width="${stroke}" stroke-linecap="round">${paths}</svg>`;

  return new Response(svg, {headers: {'Content-Type': 'image/svg+xml'}});
}
