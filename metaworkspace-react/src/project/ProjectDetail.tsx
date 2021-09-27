import { useParams } from "react-router"
import { Page } from "../elements/Page";
import { CgRename } from 'react-icons/cg';
import { FiDelete } from 'react-icons/fi';
import { BiAddToQueue } from 'react-icons/bi';


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
    <div className={`widget ${props.bordered ? 'bordered' : ''} ${props.row ? 'row' : ''}`}>
      {props.children}
    </div>
  )
}


export function Project() {
    const { name } = useParams<{name: string}>();

    return (
        <div className="dash">
          <Widget>
            <div className="title">XYZ</div>
          </Widget>
          <Widget bordered row>
            <div className="action"><CgRename />rename project</div>
            <div className="action"><BiAddToQueue />add layer</div>
            <div className="action"><FiDelete />delete project</div>
          </Widget>
          <Widget>
            <div className="subtitle">Layers</div>
          </Widget>
          <Widget bordered>
            <div className="subsubtitle">Terrain</div>
            <Pair name='Original file' value='test.json'/>
            <div className="controler">
              <div className="action"><CgRename />rename layer</div>
              <div className="action"><FiDelete />delete layer</div>
            </div>
          </Widget>
        </div>
    )
}