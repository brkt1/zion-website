import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
            <div className="max-w-md bg-gray-800 rounded-xl shadow-2xl p-8 text-center border border-amber-500/20">
                <h1 className="text-3xl font-bold text-amber-400 mb-4">Oops!</h1>
                <p className="text-gray-300 mb-4">Sorry, an unexpected error has occurred.</p>
                <p className="text-gray-500">
                    <i>{error.statusText || error.message}</i>
                </p>
                <button
                    onClick={() => window.location = '/'}
                    className="mt-6 bg-amber-500 text-gray-900 px-6 py-2 rounded-lg hover:bg-amber-600 transition duration-300"
                >
                    Return Home
                </button>
            </div>
        </div>
    );
}
