import { Dialog, Text } from 'evergreen-ui'
import iaxios from '../../axios';
import { apiurl } from '../../url';

interface IRecompileDialogProps {
    isShown: boolean;
    setIsShown: (isShown: boolean) => void;
    onSubmit: () => void;
    name: string;
}


export function RecompileProjectDialog(props: IRecompileDialogProps) {

    const buildProject = () => {
        iaxios.post(apiurl.BUILDPROJECT, {
            name: props.name
        }).then((response) => {
            props.setIsShown(false);
            props.onSubmit();
        })
    };

    return (
        <Dialog
            isShown={props.isShown}
            intent="danger"
            title="Recompile project"
            onConfirm={buildProject}
            onCloseComplete={() => props.setIsShown(false)}
            confirmLabel="Recompile">
            <Text>Are you sure you want to recompile project {props.name}?</Text>
        </Dialog>
    );
}