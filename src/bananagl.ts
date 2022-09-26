import { GraphicsProps, GraphicContext } from './context/context';
import { LayerProps, Layer } from './layer/layer';
import { Style } from './style/style';
import { Labels } from './context/text';
import { MetadataRecord } from './layer/metadata';


export interface BananaProps extends GraphicsProps {
    onClick?: (id: number, metadata: MetadataRecord) => string;
    onHover?: (id: number, metadata: MetadataRecord) => string;
}


export class BananaGL {
    ctx: GraphicContext;
    layers: Layer[] = [];

    constructor(props: BananaProps) {
        this.ctx = new GraphicContext(props);
        const canvas = props.canvas;
        let mouseLastDownTime = 0;
        const labels = new Labels(this.ctx);

        canvas.onpointerdown = (e) => {
            mouseLastDownTime = Date.now();
        };

        canvas.onpointerup = (e) => {
            const now = Date.now();
            const duration = now - mouseLastDownTime;

            if (duration < 200) {
                const x = e.clientX;
                const y = e.clientY;
                const id = this.ctx.picker.pick(x, y);
                const data = this.getMetadata(id);
                if (data && data.bbox && props.onClick) {
                    labels.labelForBBox(data.bbox, props.onClick(id, data), id);
                }
            }

            this.ctx.navigation.update();
        };

        canvas.onpointermove = (e) => {
            const x = e.clientX;
            const y = e.clientY;
            const id = this.ctx.picker.pick(x, y);
            const data = this.getMetadata(id);
            if (data && data.bbox && props.onHover) {
                labels.hoverLabelForBBox(data.bbox, props.onHover(id, data), id);
            } else {
                labels.hideHover();
            }
        }


        let updateCall: any;
        canvas.addEventListener('wheel', (e) => {
            clearTimeout(updateCall);
            updateCall = setTimeout(() => {
                this.ctx.navigation.update();
                //TODO ideally calculate near and far to fit
            }, 100);
        });

        window.onresize = () => {
            this.ctx.updateSize();
        };
    }

    loadLayer(props: LayerProps) {
        let layer = new Layer(props, this.ctx);
        this.layers.push(layer);
        layer.load();
        return layer;
    };

    get style() {
        return new Style();
    }

    private getMetadata(id: number) {
        for (let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if (layer.metadata[id])
                return layer.metadata[id];
        }
        return undefined;
    }

    get timeframe() {
        return this.ctx.timeframe;
    }

    set time(time: number) {
        this.ctx.time = time;
    }

    set speed(speed: number) {
        this.ctx.speed = speed;
    }
}
