import { Button, Heading, Pane, Paragraph } from 'evergreen-ui';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import iaxios from '../../axios';
import { apiurl } from '../../url';
import { formatBytes } from '../elements/formater';


export function ExportOBJ(props: { start: [number, number], end: [number, number], project: string, exportID: string }) {
    const { start, end, project, exportID } = props;
    const [downloading, setDownloading] = useState(false);
    const [size, setSize] = useState("0 Bytes");
    let history = useHistory();
    
    const download = () => {
        setDownloading(true);
        iaxios.get(`${apiurl.EXPORTDATA}${exportID}/export.obj`, {
            onDownloadProgress: (progressEvent) => {
                setSize(formatBytes(progressEvent.loaded));
            }
        }).then(res => {
            const blob = new Blob([res.data], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${exportID}.obj`);
            document.body.appendChild(link);
            link.click();
        });
    };

    const deleteExport = () => {
        iaxios.delete(`${apiurl.EXPORT}${exportID}`).then(res => {
            toast.success("Export deleted");
            history.push(`/`);
        }).catch(err => {
            toast.error("Error deleting export");
        });
    };

    const format = (num: number) => {
        return num.toFixed(2);
    };

    return (
        <Pane className="fullScreen">
            <Pane className="export-description">
                <Heading marginBottom={16}>Export {exportID}</Heading>
                <Paragraph marginBottom={16}>Your OBJ export is ready, please download it.</Paragraph>
                <Paragraph marginBottom={16} size={300}>You can also share this download with others, this page is publicly available. Once you've downloaded it, please consider deleting it from the server and helping us to save disk space. The export might also get deleted after a while automatically.</Paragraph>
                <Pane className="field">
                    <Heading size={100}>Project</Heading>
                    <Pane className="values">
                        {project}
                    </Pane>
                </Pane>
                <Pane className="field">
                    <Heading size={100}>Start coordinate</Heading>
                    <Pane className="values">
                        {format(start[0])} {format(start[1])}
                    </Pane>
                </Pane>
                <Pane className="field">
                    <Heading size={100}>End coordinate</Heading>
                    <Pane className="values">
                        {format(end[0])} {format(end[1])}
                    </Pane>
                </Pane>
                <Button appearance="primary" intent="success" onClick={download} marginTop={20} marginRight={10}>
                    {downloading ? `Downloading ${size}` : 'Download'}
                </Button>
                <Button appearance="primary" intent="danger" onClick={deleteExport} marginTop={20}>
                    Delete
                </Button>
                </Pane>
        </Pane>
    )
}

