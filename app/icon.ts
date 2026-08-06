import {createFramedMarkSvg} from './components/Mark';

const variants = [
  {id: '16', size: 16, radius: 4, padding: 1, strokeWidth: 1},
  {id: '32', size: 32, radius: 6, padding: 4, strokeWidth: 2},
  {id: '48', size: 48, radius: 8, padding: 6, strokeWidth: 3},
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

  const svg = createFramedMarkSvg({...variant, stroke: '#000'});

  return new Response(svg, {headers: {'Content-Type': 'image/svg+xml'}});
}
