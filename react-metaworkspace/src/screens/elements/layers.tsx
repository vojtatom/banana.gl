import { Pane, Table, TrashIcon, EditIcon, IconButton, EmptyState, LayersIcon, Heading, Button, AddToArtifactIcon, Icon } from 'evergreen-ui'
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import iaxios from '../../axios'
import { url, apiurl } from '../../url'
import { EvergreenReactRouterLink } from './header'
import { TextDialog, InputDialog } from './dialog'
import { authUser } from '../login'


interface ILayersProps {
    name: string;
}

interface ILayer {
    name: string;
    size: number;
    type: string;
}

export function Layers(props: ILayersProps) {
    const [layers, setLayers] = useState<ILayer[]>([]);
    const history = useHistory();

    const loadLayers = () => {
        iaxios.post(apiurl.LISTLAYER, { name: props.name }).then((response) => {
            setLayers(response.data);
        });
    }

    useEffect(() => {
        authUser(history, () => {
            loadLayers();
        })

        return () => {
            setLayers([]);
        };
    }, [props.name]);

    return (
        <Pane className="section">
            <Pane className="projectHeader">
                <Heading className="wide" is="h3"> Layers</Heading>
            </Pane>

            <Table>
                <Table.Head className="row">
                    <Table.TextHeaderCell className="wide">Layer</Table.TextHeaderCell>
                    <Table.TextHeaderCell className="wide">Number of Objects</Table.TextHeaderCell>
                    <Table.TextHeaderCell className="wide">Type</Table.TextHeaderCell>
                    <Table.TextHeaderCell className="narrow">rename</Table.TextHeaderCell>
                    <Table.TextHeaderCell className="narrow">delete</Table.TextHeaderCell>
                </Table.Head>
                <Table.Body>
                    {layers.length > 0 ? layers.map((layer) => (
                        <Table.Row key={layer.name} paddingY={12} height="auto" className="row">
                            <Table.TextCell className="wide">{layer.name}</Table.TextCell>
                            <Table.TextCell className="wide">{layer.size}</Table.TextCell>
                            <Table.TextCell className="wide">{layer.type}</Table.TextCell>
                            <Table.TextCell className="narrow">
                                <InputDialog
                                    submitUrl={apiurl.RENAMELAYER}
                                    title={`Rename layer ${layer.name}`}
                                    label={`Choose a new name for layer ${layer.name}`}
                                    confirmLabel="Rename"
                                    method="post"
                                    submitBody={(name) => { return { project: props.name, new: name, old: layer.name } }}
                                    onSubmit={loadLayers}
                                    onError={(reject, name) => { return "Project already exists" }}
                                >
                                    <IconButton icon={EditIcon} appearance="minimal" />
                                </InputDialog>
                            </Table.TextCell>
                            <Table.TextCell className="narrow">
                                <TextDialog
                                    submitUrl={apiurl.DELETELAYER}
                                    title={`Delete layer ${layer.name}`}
                                    label={`Do you really want to delete layer ${layer.name}?`}
                                    confirmLabel="Delete"
                                    method="delete"
                                    submitBody={() => { return { data: { project: props.name, name: layer.name } } }}
                                    onSubmit={loadLayers}
                                    onError={(reject) => { return "Layer could not be deleted" }}
                                >
                                    <IconButton icon={TrashIcon} intent="danger" appearance="minimal" />
                                </TextDialog>
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
                                <EmptyState.LinkButton is={EvergreenReactRouterLink} to={url.UPLOADLAYER + props.name}>
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

