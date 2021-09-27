import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import {ProjectRouter} from './project/ProjectRoute';


function App() {  
    return (
      <Router>
        <Switch>
          <Route exact path="/">
            <Redirect to="/project/list" />
          </Route>
          <Route path="/project">
            <ProjectRouter />
          </Route>
        </Switch>
    </Router>
    )
}

export default App;
