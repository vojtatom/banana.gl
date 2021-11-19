import { Renderer } from "./renderer/renderer";
import { Selector } from "./renderer/selector";
import { Project } from "./datamodel/project";
import iaxios from "../axios";
import { apiurl } from "../url";


export class EngineControls {
    renderer: Renderer;
    project: Project;
    keymap: {[key: string]: boolean};
    showMetaCallback?: (meta: {[name: string]: any}) => void;

    constructor(renderer: Renderer, project: Project) {
        this.renderer = renderer;
        this.project = project;
        this.keymap = {};
    }

    select(oid: number) {
        this.renderer.select(oid);
    }

    doubleclick(x: number, y: number) {
        const selected = this.renderer.click(x, y);

        console.log('doubleclick', selected);
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
        this.renderer.changed = true;
    }

    exit() {
        
    }
}