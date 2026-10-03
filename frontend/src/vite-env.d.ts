/// <reference types="vite/client" />

declare namespace React {
  namespace JSX {
    interface IntrinsicElements {
      'l-newtons-cradle': {
        size?: number | string;
        color?: string;
        speed?: number | string;
        className?: string;
      };
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'l-newtons-cradle': {
        size?: number | string;
        color?: string;
        speed?: number | string;
        className?: string;
      };
    }
  }
}
