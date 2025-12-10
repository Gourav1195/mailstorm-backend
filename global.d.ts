// global.d.ts
import type * as React from 'react';

declare global {
  namespace JSX {
    interface Element extends React.ReactElement {}
    interface ElementClass extends React.Component<any> {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
