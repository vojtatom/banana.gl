import React from 'react';
import { Page, Card } from '@geist-ui/react'
import axios from 'axios';
import ProjectBar from './ProjectBar';

interface IPropsApp {
}

interface IStateApp {
  projects: string[]
}

class App extends React.Component<IPropsApp, IStateApp> {
  constructor(props: IPropsApp) {
    super(props);
    this.state = {
      projects: []
    };
  }

  componentDidMount() {
    axios.get('http://127.0.0.1:5000/projects').then((response) => {
      console.log(response.data)
      this.setState({
        projects: response.data
      })
    })
  }
  
  render() {
    return (
      <Page>
          <h1>Projects</h1>
          <ProjectBar />
          {this.state.projects.map((project: string) => {
            return(<Card shadow>
              <h2>project</h2>
            </Card>)
          })}
      </Page>
    )
  }
}

export default App;
