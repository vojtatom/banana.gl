import React from 'react';
import { Link, useRouteError } from 'react-router-dom';

export function ErrorPage() {
    const error = useRouteError() as any;
    console.error(error);

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-4xl font-bold mb-8">Ooops!</h1>
            <p className="text-xl font-semibold mb-2">Sorry, an unexpected error has occurred.</p>
            <Link to="/">
                <div className="text-xl font-semibold mb-8 underline">Go back to the main page</div>
            </Link>
            <div className="text-xl font-semibold mb-2">
                Please contact the system administrator with the following message:
            </div>
            <p className="font-semibold font-mono">{error.statusText || error.message}</p>
            <p className="font-mono text-xs whitespace-pre mt-4 p-4 rounded">{error.stack}</p>
        </div>
    );
}
