import { Camera } from './camera';

export enum CameraView {
    Free,
    Top,
    Front,
    Right,
    Left,
    Back,
}

export class CameraLock {
    private mode_ = CameraView.Free;
    coords: [number, number] = [0, 0];
    constructor(private camera: Camera) {}

    restrictRotate(dx: number, dy: number) {
        switch (this.mode_) {
            case CameraView.Top:
                this.coords[0] = dx;
                this.coords[1] = 0;
                return;
            case CameraView.Front:
            case CameraView.Right:
            case CameraView.Left:
            case CameraView.Back:
                this.coords[0] = 0;
                this.coords[1] = 0;
                return;
            default:
                this.coords[0] = dx;
                this.coords[1] = dy;
        }
    }

    set mode(mode: CameraView) {
        this.mode_ = mode;
        switch (mode) {
            case CameraView.Top:
                this.camera.topView();
                return;
            case CameraView.Front:
                this.camera.frontView();
                return;
            case CameraView.Right:
                this.camera.rightView();
                return;
            case CameraView.Left:
                this.camera.leftView();
                return;
            case CameraView.Back:
                this.camera.backView();
                return;
            default:
                return;
        }
    }

    get mode() {
        return this.mode_;
    }
}
