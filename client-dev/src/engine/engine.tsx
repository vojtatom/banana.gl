import { Project } from "./datamodel/project";
import { Renderer } from "./renderer/renderer";
import { Selector } from "./renderer/selector";
import { AreaSelection } from "./types";

export let host = window.location.host;

if (process.env.NODE_ENV !== 'production') {
    host = "localhost:5000"
}


export class EngineControls {
    renderer: Renderer;
    project: Project;
    keymap: {[key: string]: boolean};

    savescreen: boolean;


    showMetaCallback?: (meta: {[name: string]: any}) => void;
    closeMetaCallback?: () => void;
    updateCompasCallback?: (angle: number) => void;
    updateTimeCallback?: (time: number, start: number, end: number) => void;
    updateSelection?: (selection: AreaSelection) => void;

    clickTime: number;
    selectingRegion: boolean;
    selectingRegionDown: boolean;

    constructor(renderer: Renderer, project: Project) {
        this.renderer = renderer;
        this.project = project;
        this.keymap = {};
        this.clickTime = 0;
        this.selectingRegion = false;
        this.selectingRegionDown = false;
        this.savescreen = false;
    }

    select(oid: number) {
        this.renderer.select(oid);
    }

    selectCoord(x: number, y: number) {
        if (this.selectingRegion)
            return;

        const selected = this.renderer.click(x, y);

        if (!selected)
            return;

        /*iaxios.post(apiurl.GETMETA, {
            project: this.project.name,
            layer: selected.layer,
            oid: selected.oid
        }).then(res => {
            const data = res.data;
            data['oid'] = selected.oid;
            data['layer'] = selected.layer;

            if (this.showMetaCallback)
                this.showMetaCallback(res.data);
        });*/
    }

    mouseDown(x: number, y: number, time: number, button: number) {
        this.clickTime = time;
        if (this.selectingRegion)
        {
            this.renderer.selector.clear();
            this.renderer.selector.select(x, y);
            this.selectingRegionDown = true;
            this.renderer.changed = true;
        }
    }

    mouseOver(x: number, y: number) {
        if (this.selectingRegion && this.selectingRegionDown)
        {
            this.renderer.selector.select(x, y);
            if (this.updateSelection && this.renderer.selector.region)
                this.updateSelection(this.renderer.selector.region);
            this.renderer.changed = true;
        }
    }

    mouseUp(x: number, y: number, time: number, button: number) {
        const duration = time - this.clickTime;

        if (duration < 200)
        {
            if (button === 0)
                this.selectCoord(x, y);
            else if (button === 2 && this.closeMetaCallback)
                this.closeMetaCallback();
        }
            
        if (this.selectingRegion)
        {
            this.selectingRegionDown = false;
            if (this.updateSelection && this.renderer.selector.region)
                this.updateSelection(this.renderer.selector.region);
        }

        this.clickTime = time;
    }

    get hasTimeData() {
        return this.renderer.timeline.hasData;
    }

    keyDown(key: string) {
        console.log('key down', key);
        this.keymap[key] = true;
    }

    keyUp(key: string) {
        console.log('key up', key);
        this.keymap[key] = false;
    }

    snapshot() {
        if (!this.savescreen)
            return;

        this.savescreen = false;
        this.renderer.renderer.domElement.toBlob((blob) => {
            if (!blob)
                return;

            // Function to download data to a file
            let file = blob;
            if ((window.navigator as any).msSaveOrOpenBlob) // IE10+
                (window.navigator as any).msSaveOrOpenBlob(file, "metacity-render.png");

            else { // Others
                console.log(file);
                let a = document.createElement("a"),
                        url = URL.createObjectURL(file);
                a.href = url;
                a.download = "metacity-render.png";
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);  
                }, 0); 
            }
        });
    }

    takeScreenshot() {
        this.savescreen = true;
    }

    preRenderActions() {
        if (this.keymap['KeyU'])
        {
            this.renderer.updateHelper();
            this.keymap['KeyU'] = false;
        }
    
        if (this.updateTimeCallback){
            this.updateTimeCallback(this.renderer.timeline.time, this.renderer.timeline.start, this.renderer.timeline.end);
        }
    }
    
    postRenderActions() {
        this.snapshot();
    }

    swapCamera() {
        this.renderer.controls.swap();
        this.renderer.changed = true;
    }

    disableCamera() {
        this.renderer.controls.controls.enabled = false;
        this.renderer.controls.controls.update();
    }
    
    enableCamera() {
        this.renderer.controls.controls.enabled = true;
        this.renderer.controls.controls.update();
    }

    startSelectingRegion() {
        this.selectingRegion = true;
    }
    
    endSelectingRegion() {
        this.selectingRegion = false;
        this.renderer.selector.clear();
    }

    useOrthogonalProjection() {
        this.renderer.controls.useOrtho();
        this.renderer.changed = true;
    }

    resize(x: number, y: number) {
        this.renderer.resize(x, y);
    }

    zoomIn() {
        this.renderer.controls.zoomIn(10);
        this.renderer.changed = true;
    }

    zoomOut() {
        this.renderer.controls.zoomOut(10);
        this.renderer.changed = true;
    }

    setPointSize(size: number){
        this.renderer.setPointSize(size);
    }

    setLineWidth(size: number){
        this.renderer.setLineWidth(size);
    }

    updateVisibleRadius(target: THREE.Vector3) {
        this.project.updateVisibleRadius(target);
    }

    setVisibleRadius(radius: number) {
        this.project.setVisibleRadius(radius);
    }

    useCache(enable: boolean){
        this.project.useCache(enable);
    }

    applyStyle(style: string){
        this.project.applyStyle(style);
    }

    useShadows(enable: boolean){
        if (enable)
            this.renderer.enableShadows();
        else
            this.renderer.disableShadows();
    }

    setTime(time: number){
        this.renderer.timeline.time = time;
    }

    setPlay(play: boolean){
        this.renderer.timeline.play = play;
    }

    getPlay(){
        return this.renderer.timeline.play;
    }

    setSpeed(speed: number){
        this.renderer.timeline.speed = speed;
    }
    
    getSpeed(){
        return this.renderer.timeline.speed;
    }
}


export class MetacityEngine {
    project_name: string;
    canvas: HTMLCanvasElement;
    
    renderer: Renderer;
    selector: Selector;
    project!: Project;

    controls?: EngineControls;

    constructor(project_name: string, canvas: HTMLCanvasElement) {
        this.project_name = project_name;
        this.canvas = canvas;
        
        this.renderer = new Renderer(this.canvas,  () => {
            if (this.controls)
                this.controls.preRenderActions();
        }, () => {
            if (this.controls)
                this.controls.postRenderActions();
        });

        this.selector = new Selector(this.renderer);
    }

    init() {
        this.project = new Project(this.project_name, this.renderer);
        this.controls = new EngineControls(this.renderer, this.project);
        this.renderer.controls.controls.addEventListener('change', () => this.moved())
    }

    moved() {
        this.project.updateVisibleRadius(this.renderer.controls.target);        
        this.renderer.compas.update(this.controls?.updateCompasCallback);
        this.renderer.changed = true;
    }

    exit() {
        
    }
}