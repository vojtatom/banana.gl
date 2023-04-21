import React from 'react';

import { Camera } from '@bananagl/camera/camera';
import { Scene } from '@bananagl/scene/scene';

export interface ViewProps {
    scene: Scene;
    width: number;
    height: number;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    sizeMode?: 'absolute' | 'relative';
    positionMode?: 'absolute' | 'relative';
}

/*** This is a dummy component that is only used to pass props to the Canvas component
 * and is not rendered in the DOM. Any change to its props after rendering Canvas
 * will not be reflected, so do not use variables that change after rendering Canvas.
 * */
export function View(props: ViewProps) {
    return null;
}
