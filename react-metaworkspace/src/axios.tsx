import axios from "axios";

const iaxios = axios.create({
  //baseURL: "http://127.0.0.1:5000"
});

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