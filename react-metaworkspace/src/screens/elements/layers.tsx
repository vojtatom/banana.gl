import { Pane, Table, TrashIcon, EditIcon, IconButton, EmptyState, LayersIcon } from 'evergreen-ui'
import { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { RenameLayerDialog } from './layerrename'
import { DeleteLayerDialog } from './layerdelete'
import iaxios from '../../axios'
import { url, apiurl } from '../../url'
import { EvergreenReactRouterLink } from './header'


interface ILayersProps {
    projectName: string;
}

interface ILayer {
    name: string;
    size: number;
}

export function Layers(props: ILayersProps) {
    const [layers, setLayers] = useState<ILayer[]>([]);
    const [editedLayer, setEditedLayer] = useState<string | undefined>(undefined);
    const [renameDialogShown, setRenameDialogShown] = useState(false);
    const [deleteDialogShown, setDeleteDialogShown] = useState(false);


    const loadLayers = () => {
        iaxios.post(apiurl.LISTLAYER, { name: props.projectName }).then((response) => {
            console.log("layers", response.data);
            setLayers(response.data);
        });
    }

    useEffect(() => {
        loadLayers();
        return () => {
            setLayers([]);
        };
    }, [props.projectName]);

    return (
        <Pane>
            {renameDialogShown ?
                <RenameLayerDialog
                    name={editedLayer!}
                    isShown={renameDialogShown}
                    setIsShown={(isShown) => setRenameDialogShown(isShown)}
                    onSubmit={loadLayers}
                    project={props.projectName}
                /> : ""}
            {deleteDialogShown ?
                <DeleteLayerDialog
                    name={editedLayer!}
                    isShown={deleteDialogShown}
                    setIsShown={(isShown) => setDeleteDialogShown(isShown)}
                    onSubmit={loadLayers}
                    project={props.projectName}
                /> : ""}
            <Table>
                <Table.Head className="row">
                    <Table.TextHeaderCell className="wide">Layer</Table.TextHeaderCell>
                    <Table.TextHeaderCell className="wide">Number of Objects</Table.TextHeaderCell>
                    <Table.TextHeaderCell className="narrow">rename</Table.TextHeaderCell>
                    <Table.TextHeaderCell className="narrow">delete</Table.TextHeaderCell>
                </Table.Head>
                <Table.Body>
                    {layers.length > 0 ? layers.map((layer) => (
                        <Table.Row key={layer.name} paddingY={12} height="auto" className="row">
                            <Table.TextCell className="wide">{layer.name}</Table.TextCell>
                            <Table.TextCell className="wide">{layer.size}</Table.TextCell>
                            <Table.TextCell className="narrow">
                                <IconButton icon={EditIcon} onClick={() => { setEditedLayer(layer.name); setRenameDialogShown(true); }} />
                            </Table.TextCell>
                            <Table.TextCell className="narrow">
                                <IconButton icon={TrashIcon} intent="danger" onClick={() => { setEditedLayer(layer.name); setDeleteDialogShown(true); }} />
                            </Table.TextCell>
                        </Table.Row>
                    )) :
                        <EmptyState
                            background="light"
                            title="No Layers in this Project"
                            orientation="horizontal"
                            icon={<LayersIcon color="#C1C4D6" />}
                            iconBgColor="#EDEFF5"
                            description="Layers apper after successfull processing of the input files."
                            anchorCta={
                                <EmptyState.LinkButton is={EvergreenReactRouterLink} to={url.UPLOADLAYER + props.projectName}>
                                    Add first layer
                                </EmptyState.LinkButton>
                            }
                        />
                    }
                </Table.Body>
            </Table>
        </Pane>
    );
}

