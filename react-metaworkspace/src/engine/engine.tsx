import { Renderer } from "./renderer/renderer";
import { Selector } from "./renderer/selector";
import { Project } from "./datamodel/project";
import { MainTimeline } from "./datamodel/maintimeline";
import iaxios from "../axios";
import { apiurl } from "../url";


export class EngineControls {
    renderer: Renderer;
    project: Project;
    keymap: {[key: string]: boolean};


    showMetaCallback?: (meta: {[name: string]: any}) => void;
    closeMetaCallback?: () => void;
    updateCompasCallback?: (angle: number) => void;
    clickTime: number;

    constructor(renderer: Renderer, project: Project) {
        this.renderer = renderer;
        this.project = project;
        this.keymap = {};
        this.clickTime = 0;
    }

    select(oid: number) {
        this.renderer.select(oid);
    }

    selectCoord(x: number, y: number) {
        const selected = this.renderer.click(x, y);

        if (!selected)
            return;

        iaxios.post(apiurl.GETMETA, {
            project: this.project.name,
            layer: selected.layer,
            oid: selected.oid
        }).then(res => {
            console.log(res.data);
            const data = res.data;
            data['oid'] = selected.oid;
            data['layer'] = selected.layer;

            if (this.showMetaCallback)
                this.showMetaCallback(res.data);
        });
    }

    mouseDown(x: number, y: number, time: number, button: number) {
        this.clickTime = time;
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

        

        this.clickTime = time;
    }

    keyDown(key: string) {
        console.log('key down', key);
        this.keymap[key] = true;
    }

    keyUp(key: string) {
        console.log('key up', key);
        this.keymap[key] = false;
    }

    actions() {
        if (this.keymap['KeyU'])
        {
            this.renderer.updateHelper();
            this.keymap['KeyU'] = false;
        }
    }

    swapCamera() {
        this.renderer.controls.swap();
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
        console.log(size);
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
                this.controls.actions();
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