

class Action {
    name: string;
    counter: number;
    manager: StatusManager;

    constructor(name: string, manager: StatusManager) {
        this.name = name;
        this.counter = 0;
        this.manager = manager;
    }

    start() {
        this.counter++;
        this.manager.update();
    }
    
    stop() { 
        this.counter--;
        this.manager.update();
    }

    toString() {
        return `${this.name}: ${this.counter} remaining`;
    }

    get isRunning() {  
        return this.counter > 0;
    }
}

interface IActionList {
    [key: string]: Action;
    loadingGeometry: Action;
    parsingGeometry: Action;
    loadingStyles: Action;
    applyingStyles: Action;
}

export class StatusManager {
    actions: IActionList;

    constructor() {
        this.actions = {
            loadingGeometry: new Action("Loading Geometry", this),
            parsingGeometry: new Action("Parsing Geometry", this),
            loadingStyles: new Action("Loading Styles", this),
            applyingStyles: new Action("Applying Styles", this)
        };
    }

    update() {
        const bar = document.getElementById("viewStatusBar");
        if (!bar)
            return;

        for (let action in this.actions) {
            if ((this.actions[action] as Action).isRunning) {
                const status = this.actions[action].toString();
                bar.innerHTML = status;
                return;
            }
        }
        
        bar.innerHTML = 'Ready.';
    }
}