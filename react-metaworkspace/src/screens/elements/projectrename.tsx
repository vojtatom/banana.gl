import { Dialog, TextInput, Text, InlineAlert } from 'evergreen-ui'
import { useState, FormEvent, createRef, useEffect } from 'react'
import iaxios from '../../axios';
import { apiurl } from '../../url';


interface IRenameDialogProps {
    isShown: boolean;
    setIsShown: (isShown: boolean) => void;
    onSubmit: (newName: string) => void;
    name: string;
}


export function RenameProjectDialog(props: IRenameDialogProps) {
    const nameref = createRef<HTMLInputElement>();
    const [status, setStatus] = useState("");

    const renameProject = (e?: FormEvent) => {
        if (e)
            e.preventDefault();
        const name = nameref.current?.value;
        if (!name)
            return;
        iaxios.post(apiurl.RENAMEPROJECT, {
            old: props.name,
            new: name
        }).then(() => {
            if (nameref.current)
                nameref.current.value = "";
            props.setIsShown(false);
            props.onSubmit(name);
        }).catch((reject) => {
            setStatus(`Project ${name} already exists`);
        });
    };

    useEffect(() => {
        setStatus("");
    }, [props.isShown]);

    return (
        <Dialog
            isShown={props.isShown}
            title={`Rename project ${props.name}`}
            onConfirm={() => renameProject()}
            onCloseComplete={() => props.setIsShown(false)}
            confirmLabel="Rename">
            <form className="dialogForm" onSubmit={renameProject}>
                <TextInput
                    name="name"
                    placeholder="New project name"
                    ref={nameref}/>
            </form>
            { status.length > 0 ? <InlineAlert intent="danger" marginTop={16}>{status}</InlineAlert> : ""}
        </Dialog>
    );
}