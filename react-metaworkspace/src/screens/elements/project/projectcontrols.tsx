import { Pane, Heading } from 'evergreen-ui'



interface IProjectProps {
    name: string;
}

export function ProjectControls(props: IProjectProps) {
    return ( 
        <Pane>
            <Pane className="projectHeader main">
                <Heading className="wide">Project {props.name}</Heading> 
            </Pane>
        </Pane>
    );
}

