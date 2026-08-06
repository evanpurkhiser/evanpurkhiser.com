import type {SVGProps} from 'react';

export const MARK_VIEWBOX_SIZE = 16;
const DEFAULT_MARK_CURVE = 0.625;

export function createMarkPath(curve = DEFAULT_MARK_CURVE) {
  const boundedCurve = Math.min(1, Math.max(0, curve));
  const center = MARK_VIEWBOX_SIZE / 2;
  const near = center * boundedCurve;
  const far = MARK_VIEWBOX_SIZE - near;

  return [
    `M${center} 0`,
    `C${center} ${near} ${near} ${center} 0 ${center}`,
    `C${near} ${center} ${center} ${far} ${center} ${MARK_VIEWBOX_SIZE}`,
    `C${center} ${far} ${far} ${center} ${MARK_VIEWBOX_SIZE} ${center}`,
    `C${far} ${center} ${center} ${near} ${center} 0`,
    'Z',
  ].join(' ');
}

type MarkPathProps = Omit<SVGProps<SVGPathElement>, 'd'> & {
  curve?: number;
};

export function MarkPath({
  curve = DEFAULT_MARK_CURVE,
  fill = 'none',
  ...props
}: MarkPathProps) {
  return <path d={createMarkPath(curve)} fill={fill} {...props} />;
}

type MarkProps = Omit<SVGProps<SVGSVGElement>, 'fill' | 'height' | 'stroke' | 'width'> & {
  size?: number | string;
  curve?: number;
  fill?: string;
  stroke?: string;
};

export default function Mark({
  size = 22,
  curve = DEFAULT_MARK_CURVE,
  fill = 'none',
  stroke = 'currentColor',
  strokeWidth = 1,
  ...props
}: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${MARK_VIEWBOX_SIZE} ${MARK_VIEWBOX_SIZE}`}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <MarkPath curve={curve} fill={fill} />
    </svg>
  );
}

type FramedMarkOptions = {
  size: number;
  padding?: number;
  radius?: number;
  background?: string;
  curve?: number;
  stroke?: string;
  strokeWidth?: number;
};

type FramedMarkProps = Omit<
  SVGProps<SVGSVGElement>,
  'height' | 'stroke' | 'strokeWidth' | 'width'
> &
  FramedMarkOptions;

function getFramedMarkLayout(size: number, padding: number, strokeWidth: number) {
  const offset = padding + strokeWidth / 2;
  const scale = (size - offset * 2) / MARK_VIEWBOX_SIZE;

  return {offset, scale};
}

export function FramedMark({
  size,
  padding = 0,
  radius = 0,
  background = 'white',
  curve = DEFAULT_MARK_CURVE,
  stroke = 'currentColor',
  strokeWidth = 1,
  ...props
}: FramedMarkProps) {
  const {offset, scale} = getFramedMarkLayout(size, padding, strokeWidth);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width={size} height={size} rx={radius} fill={background} />
      <MarkPath
        curve={curve}
        transform={`translate(${offset} ${offset}) scale(${scale})`}
        vectorEffect="non-scaling-stroke"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

export function createFramedMarkSvg({
  size,
  padding = 0,
  radius = 0,
  background = 'white',
  curve = DEFAULT_MARK_CURVE,
  stroke = 'currentColor',
  strokeWidth = 1,
}: FramedMarkOptions) {
  const {offset, scale} = getFramedMarkLayout(size, padding, strokeWidth);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none"><rect width="${size}" height="${size}" rx="${radius}" fill="${background}"/><path d="${createMarkPath(curve)}" transform="translate(${offset} ${offset}) scale(${scale})" vector-effect="non-scaling-stroke" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"/></svg>`;
}
