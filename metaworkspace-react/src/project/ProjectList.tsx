import { useEffect, useState } from 'react';
import './style.css';
import iaxios from '../axios';
import { Link } from "react-router-dom";
import { Page } from '../elements/Page';


interface IProject {
   name: string;
}


export function ProjectList() {
  const [projects, setProjects] = useState<IProject[]>([])

  useEffect(() => {
    iaxios.get('/projects').then((response) => {
      setProjects(response.data);
      console.log(response.data);
      return () => {
        setProjects([]); // This worked for me
      };
    })
  }, []);

  return (
    <Page>
        <h1>Projects</h1>
        <Link to='/project/add'>
          <button>Add New Project</button>
        </Link>
        {projects.map( (project) => {
          return (
            <Link key={project.name} 
                  to={`/project/detail/${project.name}`}>
            <div className='line'>
              {project.name}
            </div>
            </Link>
          )
        })}
    </Page>
  )
}