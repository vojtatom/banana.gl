import { Dialog, TextInput, Text, InlineAlert } from 'evergreen-ui'
import { useState, FormEvent, createRef, useEffect } from 'react'
import iaxios from '../../axios';
import { apiurl } from '../../url';


enum NameState {
    empty,
    exists,
    valid
}

interface IAddDialogProps {
    isShown: boolean;
    setIsShown: (isShown: boolean) => void;
    onSubmit: () => void;
}


export function AddProjectDialog(props: IAddDialogProps) {
    const nameref = createRef<HTMLInputElement>();
    const [status, setStatus] = useState("");

    const createProject = (e?: FormEvent) => {
        if (e)
            e.preventDefault();

        const name = nameref.current?.value;
        if (!name)
            return;

        iaxios.post(apiurl.ADDPROJECT, { name: name }).then((response) => {
            console.log(response.data);
            if (nameref.current)
                nameref.current.value = "";
            props.setIsShown(false);
            props.onSubmit();
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
            title="Create new project"
            onConfirm={() => createProject()}
            onCloseComplete={() => props.setIsShown(false)}
            confirmLabel="Create">
            <form className="dialogForm" onSubmit={createProject}>
                <TextInput
                    name="name"
                    placeholder="Project Name"
                    ref={nameref} />
            </form>
            { status.length > 0 ? <InlineAlert intent="danger" marginTop={16}>{status}</InlineAlert> : ""}
        </Dialog>
    );
}