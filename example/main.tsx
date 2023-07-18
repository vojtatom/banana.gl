import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ErrorPage } from './error';
import { DemoInit } from './demoBasic';
import './style.css';
import { DemoModels } from './demoModels';

const router = createBrowserRouter([
    {
        path: '/init',
        element: <DemoInit />,
        errorElement: <ErrorPage />,
    },
    {
        path: '/models',
        element: <DemoModels />,
        errorElement: <ErrorPage />,
    },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);
