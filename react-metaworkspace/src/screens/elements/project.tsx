import { Pane } from 'evergreen-ui'
import { ProjectControls } from './project/projectcontrols'
import { ProjectActions } from './project/projectactions'
import { Layers } from './layers'
import { Styles } from './styles'


interface IProjectProps {
    name: string;
    showProject: (name?: string) => void;
}

export function Project(props: IProjectProps) {

    return ( 
        <Pane className="project">
            <ProjectControls name={props.name}/>
            <ProjectActions name={props.name} showProject={props.showProject}/>
            <Layers name={props.name} />
            <Styles project={props.name}/>
        </Pane>
    );
}

