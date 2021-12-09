import { Pane, Spinner } from 'evergreen-ui';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import iaxios from '../../axios';
import { apiurl } from '../../url';
import { Login } from './login';


export function authUser(history: any, callbackAuth: CallableFunction, callbackNoAuth: CallableFunction) {
    iaxios.get(apiurl.AUTHUSER).then((response) => {
        callbackAuth();
    }).catch(() => {
        callbackNoAuth();
    });
}

enum LoginState {
    LOGGED_IN,
    LOGGED_OUT,
    AUTHENTICATING
}


export function LoginGate(props: { children: any }) {
    const { children } = props;
    const [isLoggedIn, setIsLoggedIn] = useState(LoginState.AUTHENTICATING);
    const history = useHistory();

    useEffect(() => {
        authUser(history, () => {
            setIsLoggedIn(LoginState.LOGGED_IN);
        }, () => {
            setIsLoggedIn(LoginState.LOGGED_OUT);
        });
    }, [history]);

    return (
        <>
            {isLoggedIn === LoginState.LOGGED_IN && children}
            {isLoggedIn === LoginState.LOGGED_OUT && <Login onLogin={() => setIsLoggedIn(LoginState.LOGGED_IN) }/>}
            {isLoggedIn === LoginState.AUTHENTICATING && <Pane className="fullScreen"><Spinner/></Pane>}
        </>
    );
}




