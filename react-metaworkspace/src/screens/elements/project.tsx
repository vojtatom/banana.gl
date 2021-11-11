import { Heading, Pane } from 'evergreen-ui'
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
            <Pane>
                <Pane className="projectHeader main">
                    <Heading className="wide">Project {props.name}</Heading> 
                </Pane>
            </Pane>
            <ProjectActions name={props.name} showProject={props.showProject}/>
            <Layers name={props.name} />
            <Styles project={props.name}/>
        </Pane>
    );
}

