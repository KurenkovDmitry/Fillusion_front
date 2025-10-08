/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
declare module '*.svg' {
    import { ReactComponent } from '*.svg';
    const content: ReactComponent;
    export default content;
}

declare module '*.svg?react' {
    import { ReactElement, SVGProps } from 'react';
    const content: (props: SVGProps<SVGElement>) => ReactElement;
    export default content;
}