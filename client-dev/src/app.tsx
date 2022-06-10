import {
  BrowserRouter as Router, Redirect, Route, Switch
} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Home } from './screens/home/home';
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
      />
      <Switch>
        <Route exact path={["/"]}>
          <Redirect to="/app" />
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