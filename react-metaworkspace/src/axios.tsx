import axios from "axios";

let config = {};

if (process.env.NODE_ENV !== 'production') {
  config = {
    baseURL: "http://localhost:5000" // leave unset if you are using the production server
  };
}

const iaxios = axios.create(config);

(function() { 
  let authToken = localStorage.getItem("JWT");
  if (authToken === null) {
      // This means that there ISN'T JWT and no user is logged in.
      iaxios.defaults.headers.common.Authorization = null;
  } else {
      // This means that there IS a JWT so someone must be logged in.
      iaxios.defaults.headers.common.Authorization = `Bearer ${authToken}`;
  }
})();




export default iaxios;