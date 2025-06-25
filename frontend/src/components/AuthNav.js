import React from 'react';
import {Navigate} from 'react-router-dom';

function AuthNav({isAuth, children}){
    if(!isAuth){
        return <Navigate to = "/login" replace />;
    }
    return children;
}

export default AuthNav;