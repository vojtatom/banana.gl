import { Pane, Button, CubeIcon, AddToArtifactIcon, Tooltip, MergeColumnsIcon } from 'evergreen-ui'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { RecompileProjectDialog } from './projectrecompile'
import { url } from '../../url'


interface IProjectProps {
    name: string;
}

export function ProjectActions(props: IProjectProps) {
    const history = useHistory();
    const [recompileDialogShown, setRecompileDialogShown] = useState(false);

    const recompile = () => {
        history.push(url.JOBS);
    }

    return (
        <Pane>
            <RecompileProjectDialog 
                isShown={recompileDialogShown}
                setIsShown={ (isShown) => setRecompileDialogShown(isShown)}
                onSubmit={recompile}
                name={props.name}
            />
            <Button marginRight={12} marginBottom={12} height={48} iconBefore={AddToArtifactIcon} onClick={() => history.push(url.UPLOADLAYER + props.name)}>
                Add Layer
            </Button>
            <Tooltip content="Recompile after updating layers or styles to view the changes in the visualization">
            <Button marginRight={12} marginBottom={12} height={48} iconBefore={CubeIcon} onClick={() => setRecompileDialogShown(true)}>
                Recompile 3D
            </Button>
            </Tooltip>
            <Button marginRight={12} marginBottom={12} height={48} iconBefore={MergeColumnsIcon} onClick={() => {}} disabled>
                Map Layers
            </Button>
        </Pane>
    );
}

