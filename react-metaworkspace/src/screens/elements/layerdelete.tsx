import { Dialog, Text } from 'evergreen-ui'
import iaxios from '../../axios';
import { apiurl } from '../../url';

interface IDeleteDialogProps {
    isShown: boolean;
    setIsShown: (isShown: boolean) => void;
    onSubmit: () => void;
    project: string;
    name: string;
}

export function DeleteLayerDialog(props: IDeleteDialogProps) {
    const deleteLayer = () => {
        iaxios.delete(apiurl.DELETELAYER, {
            data: {
                project: props.project,
                name: props.name,
            }
        }).then(() => {
            props.setIsShown(false);
            props.onSubmit();
        })
    };

    return (
        <Dialog
            isShown={props.isShown}
            title={`Delete layer ${props.name}`}
            onConfirm={deleteLayer}
            onCloseComplete={() => props.setIsShown(false)}
            intent="danger"
            confirmLabel="Delete">
            <Text>Are you sure you want to delete layer {props.name}?</Text>
        </Dialog>
    );
}