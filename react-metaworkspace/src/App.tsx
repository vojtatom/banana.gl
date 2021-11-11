import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom"
import './style.css'
import 'react-toastify/dist/ReactToastify.css';
import { url } from './url'
import { Home } from './screens/home'
import { Projects } from './screens/projects'
import { Login } from './screens/login'
import { UploadLayer } from './screens/upload'
import { Jobs } from './screens/jobs'
import { Mapping } from './screens/mapping'
import { View } from './screens/view'
import { ToastContainer, toast } from 'react-toastify';
import { StyleEditor } from './screens/style';

export function App() {
  return (
    <Router>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        //draggable
        //pauseOnHover
      />
      <Switch>
        <Route exact path={["/"]}>
          <Redirect to="/app" />
        </Route>
        <Route path={url.LOGIN}>
          <Login />
        </Route>
        <Route path={url.MAPPINGTEMPLATE}>
          <Mapping />
        </Route>
        <Route path={url.UPLOADLAYERTEMPLATE}>
          <UploadLayer />
        </Route>
        <Route path={url.PROJECTSTEMPLATE}>
          <Projects />
        </Route>
        <Route path={url.STYLETEMPLATE}>
          <StyleEditor />
        </Route>
        <Route path={url.JOBS}>
          <Jobs />
        </Route>
        <Route path={url.VIEWTEMPLATE}>
          <View />
        </Route>
        <Route path={url.HOME}>
          <Home />
        </Route>
      </Switch>
    </Router>
  )
}