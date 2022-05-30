import { Button, CrossIcon, EmptyState, Pane, Spinner } from 'evergreen-ui';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import iaxios from '../../axios';
import { apiurl } from '../../url';
import { ExportLego } from './lego';
import { ExportOBJ } from './obj';


enum ExportStatus {
    PROCESSING,
    SUCCESS,
    NOTFOUND
}

export function Export() {
    const { export_name } = useParams<{ export_name: string | undefined }>();
    const [data, setData] = useState<any>(undefined);
    const [status, setStatus] = useState<ExportStatus>(ExportStatus.PROCESSING);

    const refresh = useCallback(() => {
        iaxios.get(`${apiurl.EXPORT}${export_name}`).then(res => {
            if (res.status === 204) {
                setStatus(ExportStatus.PROCESSING);
                toast.info('Not yet, processing...', { autoClose: 3000 });
            } else if (res.status === 200) {
                setData(res.data);
                setStatus(ExportStatus.SUCCESS);
            }
        }).catch(err => {
            if (err.response.status === 404) {
                setStatus(ExportStatus.NOTFOUND);
            }
        });
    }, [export_name]);

    useEffect(() => {
        refresh();
    }, [refresh]);


    return (
        <>
            {status === ExportStatus.PROCESSING &&
                <Pane className="fullScreen">
                    <Pane className="export-wait">
                        <EmptyState
                            background="light"
                            title={`Export ${export_name} is still processing`}
                            orientation="horizontal"
                            icon={<Spinner />}// <ExportIcon color="#C1C4D6" />}
                            iconBgColor="#EDEFF5"
                            description="Refresh the site once in a while, outputs will appear on this page when they are succesfully processed"
                            anchorCta={
                                <EmptyState.LinkButton is={Button} onClick={refresh}>
                                    Click me to refresh!
                                </EmptyState.LinkButton>
                            }
                        />
                    </Pane>
                </Pane>}
            {status === ExportStatus.NOTFOUND &&
                <Pane className="fullScreen">
                    <Pane className="export-wait">
                        <EmptyState
                            background="light"
                            title={`Export ${export_name} was not found`}
                            orientation="vertical"
                            icon={<CrossIcon color="#C1C4D6" />}
                            iconBgColor="#EDEFF5"
                            description="Outputs have been deleted or are no longer available"
                        />
                    </Pane>
                </Pane>}
            {status === ExportStatus.SUCCESS &&
                ((data.type === 'obj' && (<ExportOBJ {...data} exportID={export_name} />)) ||
                (data.type === 'lego' && (<ExportLego {...data} exportID={export_name} />)))
            }
        </>
    );
}
