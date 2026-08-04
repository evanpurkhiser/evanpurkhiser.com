import type {SVGProps} from 'react';

type MarkProps = Omit<SVGProps<SVGSVGElement>, 'height' | 'stroke' | 'width'> & {
  size?: number | string;
  stroke?: string;
};

export default function Mark({size = 22, stroke = 'currentColor', ...props}: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11 2V20" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <path d="M2 11H20" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <path
        d="M4.63287 17.3652L17.3608 4.63731"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M17.3608 17.3716L4.63286 4.64366"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
