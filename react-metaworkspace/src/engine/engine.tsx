import { Vector2 } from "three";
import iaxios from "../axios";
import { Layer, Overlay } from "./datamodel/layer";
import { Renderer } from "./renderer/renderer";
import { Selector } from "./renderer/selector";
import { Project } from "./datamodel/project";


export class MetacityEngine {
    project_name: string;
    canvas: HTMLCanvasElement;
    
    renderer: Renderer;
    selector: Selector;
    project!: Project;

    keymap: {[key: string]: boolean};

    constructor(project_name: string, canvas: HTMLCanvasElement) {
        this.project_name = project_name;
        this.canvas = canvas;
        this.renderer = new Renderer(this.canvas,  () => this.actions());
        this.selector = new Selector(this.renderer);
        this.keymap = {}
    }

    init() {
        this.project = new Project(this.project_name, this.renderer);
        this.renderer.controls.controls.addEventListener('change', () => this.moved())
    }

    moved() {
        this.project.update_visible_tiles(this.renderer.controls.target);        
        this.renderer.changed = true;
    }

    doubleclick(x: number, y: number) {
        const position = this.renderer.click(x, y);
        if (position) {
            if (this.keymap['KeyS']) {
                const selection = this.selector.select(position.x, position.y);
                console.log(selection);
            } else {
                this.selector.clear();
            }
        } else {
            this.selector.clear();
        }
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
        if (this.keymap['KeyA'])
        {
            this.renderer.controls.swap();
            this.keymap['KeyA'] = false;
        }

        if (this.keymap['KeyU'])
        {
            this.renderer.updateHelper();
            this.keymap['KeyU'] = false;
        }
    }

    exit() {
        
    }
}