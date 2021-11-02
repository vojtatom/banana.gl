import { Dialog, TextInput, Text, InlineAlert } from 'evergreen-ui'
import { useState, FormEvent, createRef, useEffect } from 'react'
import iaxios from '../../axios';
import { apiurl } from '../../url';

interface IRenameDialogProps {
    isShown: boolean;
    setIsShown: (isShown: boolean) => void;
    onSubmit: (newName: string) => void;
    project: string;
    name: string;
}

export function RenameLayerDialog(props: IRenameDialogProps) {
    const nameref = createRef<HTMLInputElement>();
    const [status, setStatus] = useState("");

    const renameLayer = (e?: FormEvent) => {
        if (e)
            e.preventDefault();
        const name = nameref.current?.value;
        if (!name)
            return;
        iaxios.post(apiurl.RENAMELAYER, {
            project: props.project,
            old: props.name,
            new: name
        }).then(() => {
            if (nameref.current)
                nameref.current.value = "";
            props.setIsShown(false);
            props.onSubmit(name);
        }).catch(() => {
            setStatus(`Layer ${name} already exists`);
        });
    };

    useEffect(() => {
        setStatus("");
    }, [props.isShown]);

    return (
        <Dialog
            isShown={props.isShown}
            title={`Rename layer ${props.name}`}
            onConfirm={() => renameLayer()}
            onCloseComplete={() => props.setIsShown(false)}
            confirmLabel="Rename">
            <form className="dialogForm">
                <TextInput
                    name="name"
                    placeholder="New layer name"
                    ref={nameref} />
            </form>
            <p>{status}</p>
            { status.length > 0 ? <InlineAlert intent="danger" marginTop={16}>{status}</InlineAlert> : ""}
        </Dialog>
    );
}