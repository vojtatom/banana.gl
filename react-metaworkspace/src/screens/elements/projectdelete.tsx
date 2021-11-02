import { Dialog, Text } from 'evergreen-ui'
import iaxios from '../../axios';
import { apiurl } from '../../url';

interface IRenameDialogProps {
    isShown: boolean;
    setIsShown: (isShown: boolean) => void;
    onSubmit: () => void;
    name: string;
}


export function DeleteProjectDialog(props: IRenameDialogProps) {
    const deleteProject = () => {
        iaxios.delete(apiurl.DELETEPROJECT, {
            data: {
                name: props.name
            }
        }).then(() => {
            props.onSubmit();
            props.setIsShown(false);
        });
    };

    return (
        <Dialog
            isShown={props.isShown}
            intent="danger"
            title="Delete project"
            onConfirm={deleteProject}
            onCloseComplete={() => props.setIsShown(false)}
            confirmLabel="Delete">

            <Text>Are you sure you want to delete project {props.name}?</Text>
        </Dialog>
    );
}