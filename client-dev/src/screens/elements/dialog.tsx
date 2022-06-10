import { Paragraph, Dialog, TextInputField, InlineAlert, Tooltip } from 'evergreen-ui'
import { useState, FormEvent, createRef, useEffect, cloneElement } from 'react'
import iaxios from '../../axios';

interface IInputDialogProps {
    submitUrl: string;
    title: string;
    confirmLabel: string;
    label: string;
    description?: string;
    placeholder?: string;
    method: "post" | "delete";

    submitBody: (input: string) => Object;
    onSubmit: (input: string) => void;
    onError: (reject: any, value: string) => string;

    children: React.ReactElement;

}


export function InputDialog(props: IInputDialogProps) {
    const nameref = createRef<HTMLInputElement>();
    const [isShown, setShown] = useState(false);
    const [invalid, setInvalid] = useState(false);
    const [error, setError] = useState("");

    const submit = (e?: FormEvent) => {
        if (e)
            e.preventDefault();

        const value = nameref.current?.value;
        if (!value)
            return;
        const body = props.submitBody(value);

        iaxios[props.method](props.submitUrl, body).then(() => {
            if (nameref.current)
                nameref.current.value = "";
            setShown(false);
            props.onSubmit(value);
        }).catch((reject) => {
            const error = props.onError(reject, value);
            setInvalid(true);
            setError(error);
        });
    };

    useEffect(() => {
        setError("");
        setInvalid(false);
    }, [isShown]);

    return (
        <>
        <Dialog
            isShown={isShown}
            title={props.title}
            onConfirm={() => submit()}
            onCloseComplete={() => setShown(false)}
            confirmLabel={props.confirmLabel}>
            <form className="dialogForm" onSubmit={submit}>
                { invalid ? 
                    <TextInputField name="name" 
                        label={props.label} 
                        description={props.description} 
                        placeholder={props.placeholder} 
                        ref={nameref} 
                        isInvalid={invalid} 
                        validationMessage={error}
                    />
                    :
                    <TextInputField name="name" 
                        label={props.label} 
                        description={props.description} 
                        placeholder={props.placeholder} 
                        ref={nameref} 
                    />
                }
            </form>
        </Dialog>
        { cloneElement(props.children, { onClick: () => setShown(true) }) }
    </>
    );
}


interface ITextDialogProps {
    submitUrl: string;
    title: string;
    confirmLabel: string;
    label: string;
    method: "post" | "delete";
    tooltip?: string;
    intent?: "success" | "warning" | "danger" | "none";

    submitBody: () => Object;
    onSubmit: () => void;
    onError: (reject: any) => string;

    children: React.ReactElement;
}


export function TextDialog(props: ITextDialogProps) {
    const [isShown, setShown] = useState(false);
    const [invalid, setInvalid] = useState(false);
    const [error, setError] = useState("");

    const submit = () => {
        try {
            const body = props.submitBody();
            iaxios[props.method](props.submitUrl, body).then(() => {
                setShown(false);
                props.onSubmit();
            }).catch((reject) => {
                const error = props.onError(reject);
                setInvalid(true);
                setError(error);
            });
        } catch(error: any) {
            setInvalid(true);
            setError(error); 
        }

    };

    useEffect(() => {
        setError("");
        setInvalid(false);
    }, [isShown]);

    return (
        <>
        <Dialog
            isShown={isShown}
            intent={props.intent ? props.intent :  "none"}
            title={props.title}
            onConfirm={submit}
            onCloseComplete={() => setShown(false)}
            confirmLabel={props.confirmLabel}>
            <Paragraph>{props.label}</Paragraph>
            { invalid ? <InlineAlert intent="danger" marginTop={16}>{error}</InlineAlert> : ""}
        </Dialog>
        {props.tooltip? 
            <Tooltip content={props.tooltip}>
                { cloneElement(props.children, { onClick: () => { setShown(true); } }) }
            </Tooltip> :
            cloneElement(props.children, { onClick: () => { setShown(true); } })
    
        }   
        </>
    );
}


