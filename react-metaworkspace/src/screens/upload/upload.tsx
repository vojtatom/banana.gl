import { Button, Heading, Icon, LayersIcon, Pane, Spinner, Text, TextInput } from 'evergreen-ui';
import { createRef, FormEvent, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useHistory, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import iaxios from '../../axios';
import { apiurl, url } from '../../url';
import { Header } from '../elements/header';


interface IDropzone {
    submit: (layer_name: string, files: File[]) => void;
};

function Dropzone(props: IDropzone) {
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
    const name = createRef<HTMLInputElement>();

    const files = acceptedFiles.map(file => (
        <li key={file.name}>
            <span className="fileName">{file.name}</span><span className="fileSize">{file.size} bytes</span>
        </li>
    ));

    const submit = (event: FormEvent) => {
        event.preventDefault();
        props.submit(name.current!.value, acceptedFiles);
    }

    return (
        <Pane className="dropzoneContainer">
            <form onSubmit={submit} id="layerUploadForm">
                <TextInput placeholder="layer name" ref={name} className="layerName" />
                <div {...getRootProps({ className: "dropzone" })}>
                    <input {...getInputProps()} />
                    <p>Click or drag 'n' drop layer files here</p>
                    <ul className="filelist">{files}</ul>
                </div>
            </form>
            <Button appearance="primary" type="submit" form="layerUploadForm">
                Upload
            </Button>
        </Pane>
    );
}



export function UploadLayer() {
    const { project_name } = useParams<{ project_name: string }>();
    const history = useHistory();

    const [progress, setProgress] = useState<number>(0);
    const [uploading, setUploading] = useState<boolean>(false);

    const submit = (layer_name: string, files: File[]) => {
        if (uploading)
            return;

        if (layer_name === undefined || layer_name.length === 0)
        {
            toast('No name specified');
            return;
        }

        if (files === undefined || files.length === 0)
        {
            toast('No files provided');
            return;
        }

        setUploading(true);

        let formData = new FormData();
        formData.append("project", project_name);
        formData.append("layer", layer_name);
        files.forEach(dataset => {
            formData.append("files", dataset)
        });

        iaxios.post(apiurl.ADDLAYER, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            onUploadProgress: progressEvent => setProgress(progressEvent.loaded / progressEvent.total * 100)
        }).then((response) => {
            history.push(url.PROJECTS);
        })
    }


    return (
        <Pane>
            <Header projects />
            <Pane className="upload">
                { uploading ?
                    <Spinner/>
                    :
                    <Icon icon={LayersIcon} size={30} color="#C1C4D6" background="#EDEFF5" className="uploadIcon" padding={20} borderRadius={40} />
                }
                <Heading className="uploadTitle">Uploading Layer to Project {project_name}</Heading>
                { uploading ?
                    <Pane className="progress">
                        <Text className="label">{progress.toFixed(0)}%</Text>
                    </Pane> 
                    :
                    <Dropzone submit={submit} />
                }
            </Pane>

        </Pane>
    );
}