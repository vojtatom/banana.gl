import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ErrorPage } from './error';
import { DemoBasic } from './demoBasic';
import './style.css';

const router = createBrowserRouter([
    {
        path: '/',
        element: <DemoBasic />,
        errorElement: <ErrorPage />,
    },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
