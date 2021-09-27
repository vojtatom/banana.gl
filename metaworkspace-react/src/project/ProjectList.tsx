import { useEffect, useState } from 'react';
import './style.css';
import iaxios from '../axios';
import { Link } from "react-router-dom";
import { Page } from '../elements/Page';


interface IProject {
   'name': string;
}


export function ProjectList() {
  const [projects, setProjects] = useState<IProject[]>([])

  useEffect(() => {
    iaxios.get('/projects').then((response) => {
      console.log(response.data)
      setProjects(response.data)
    })
  })

  return (
    <Page>
        <h1>Projects</h1>
        <Link to='/project/add'>
          <button>Add New Project</button>
        </Link>
        {projects.map( (project) => {
          return (
            <Link to={`/project/detail/${project.name}`}>
            <div className='line' key={project.name}>
              {project.name}
            </div>
            </Link>
          )
        })}
    </Page>
  )
}