import { Pane, Heading, Button, TrashIcon, EditIcon, PresentationIcon, StyleIcon } from 'evergreen-ui'
import { RenameProjectDialog } from './projectrename'
import { DeleteProjectDialog } from './projectdelete'
import { useEffect, useState } from 'react'
import { Layers } from './layers'
import { useHistory } from 'react-router-dom'
import { ProjectActions } from './projectactions'
import { url } from '../../url'


interface IProjectProps {
    name: string;
    showProject: (name?: string) => void;
}

export function Project(props: IProjectProps) {
    const [renameDialogShown, setRenameDialogShown] = useState(false);
    const [deleteDialogShown, setDeleteDialogShown] = useState(false);
    const history = useHistory();

    useEffect(() => {
        return () => {
            setRenameDialogShown(false); // This worked for me
            setDeleteDialogShown(false); // This worked for me
        };
    }, []);

    return ( 
        <Pane className="project">
            <RenameProjectDialog 
                name={props.name}
                isShown={renameDialogShown}
                setIsShown={(isShown: boolean) => setRenameDialogShown(isShown)}
                onSubmit={props.showProject}
            />
            <DeleteProjectDialog 
                name={props.name}
                isShown={deleteDialogShown}
                setIsShown={(isShown: boolean) => setDeleteDialogShown(isShown)}
                onSubmit={() => props.showProject()}
            />
            <Pane className="projectHeader">
                <Heading className="wide">Project {props.name}</Heading> 
                <Button marginY={8} marginRight={12} iconBefore={PresentationIcon} onClick={() => { history.push(url.VIEW + props.name) }}>
                    View
                </Button>
                <Button marginY={8} marginRight={12} iconBefore={EditIcon} onClick={() => setRenameDialogShown(true)}>
                    Rename
                </Button>
                <Button marginY={8} marginRight={12} iconBefore={TrashIcon} onClick={() => setDeleteDialogShown(true)} intent="danger">
                    Delete...
                </Button>
            </Pane>
            <Layers projectName={props.name} />
            <Heading is="h3">Actions</Heading>
            <ProjectActions name={props.name}/>
            <Pane className="projectHeader">
                <Heading className="wide" is="h3">Styles</Heading> 
                <Button marginY={8} marginRight={12} iconBefore={StyleIcon} onClick={() => setDeleteDialogShown(true)}>
                    Add Style
                </Button>
            </Pane>
        </Pane>
    );
}

