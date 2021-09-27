import React from 'react';
import './style.css';
import {
  Switch,
  Route,
  useRouteMatch
} from "react-router-dom";
import { ProjectList } from './ProjectList';
import { ProjectAdd } from './ProjectAdd';
import { Project } from './ProjectDetail';


export function ProjectRouter() {
  let { path, url } = useRouteMatch();
    return (
      <Switch>
        <Route path={`${path}/list`}>
          <ProjectList />
        </Route>
        <Route path={`${path}/add`}>
          <ProjectAdd />
        </Route>
        <Route path={`${path}/detail/:name`}>
          <Project />
        </Route>
      </Switch>
    )
}
