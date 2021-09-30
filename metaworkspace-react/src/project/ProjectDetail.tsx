import { useParams } from "react-router";
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import iaxios from "../axios";


interface IDropzone {
  submit: (files: File[]) => void;
};

function Dropzone(props: IDropzone) {
  const {acceptedFiles, getRootProps, getInputProps} = useDropzone();
  
  const files = acceptedFiles.map(file => (
    <li key={file.name}>
      {file.name} - {file.size} bytes
    </li>
  ));

  const submit = () => {
    props.submit(acceptedFiles);
  }

  return (
    <section className="container">
      <div {...getRootProps({className: 'dropzone'})}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>{files}</ul>
      </aside>
      <button onClick={submit}>Upload File</button>
    </section>
  );
}

interface IPair {
  name: string;
  value: string | number;
};

function Pair(props: IPair) {
  
  return (
    <div className="pair">
      <div className="name">
        {props.name}
      </div>
      <div className="value">
        {props.value}
      </div>
    </div>
  )
}

interface IWidget {
  bordered?: boolean;
  row?: boolean;
  children?: React.ReactNode;
};

function Widget(props: IWidget) {
  
  return (
    <div className={`widget`}>
      {props.children}
    </div>
  )
}

interface IAddLayer {
  project: string
}

function AddLayer(props: IAddLayer) {
  
  const submit = (files: File[]) => {
    console.log(files);
    let formData = new FormData();
    formData.append("project", props.project)
    files.forEach(dataset => {
      formData.append("files", dataset)
    });

    iaxios.post('/project/layer/add', formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }).then((response) => {
      console.log(response)
    })
  }

  return (
    <Dropzone submit={submit}/>
  )

}

interface ILayer {
  name: string;
}

export function Project() {
    const { name } = useParams<{name: string}>();
    const [layers, setLayers] = useState<ILayer[]>([])

    useEffect(() => {
      iaxios.post('/project/layer/list', {name: name}).then((response) => {
        setLayers(response.data);
        console.log(response.data);
        return () => {
          setLayers([]); // This worked for me
        };
      })
    }, []);

    return (
        <div className="dash">
          <Widget>
            <div className="title">XYZ</div>
          </Widget>
          <Widget bordered row>
            <AddLayer project={name}/>
          </Widget>
          <Widget>
            <div className="subtitle">Layers</div>
          </Widget>

          {layers.map( (layer) => {
          return (
            <div className='line' key={layer.name}>
              {layer.name}
            </div>
          )
        })}
        </div>
    )
}