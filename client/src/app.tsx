import {
  BrowserRouter as Router, Redirect, Route, Switch
} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Export } from './screens/exports/export';
import { Home } from './screens/home/home';
import { LoginGate } from './screens/login/gate';
import { Mapping } from './screens/mapping/mapping';
import { Projects } from './screens/projects/projects';
import { StyleEditor } from './screens/style/style';
import { UploadLayer } from './screens/upload/upload';
import { View } from './screens/view/view';
import './style.css';
import { url } from './url';

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
        <Route path={url.EXPORTTEMPLATE}>
          <Export />
        </Route>
        <Route path={url.MAPPINGTEMPLATE}>
          <LoginGate>
            <Mapping />
          </LoginGate>
        </Route>
        <Route path={url.UPLOADLAYERTEMPLATE}>
          <LoginGate>
            <UploadLayer />
          </LoginGate>
        </Route>
        <Route path={url.PROJECTSTEMPLATE}>
          <LoginGate>
            <Projects />
          </LoginGate>
        </Route>
        <Route path={url.STYLETEMPLATE}>
          <LoginGate>
            <StyleEditor />
          </LoginGate>
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