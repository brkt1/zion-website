import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);
    
    const errorMessage = error 
      ? error.statusText || error.message || 'Unknown error occurred'
      : 'An unexpected error occurred';
      
    return (
        <div className="min-h-screen bg-gradient-to-br from-black-primary to-black-secondary flex items-center justify-center p-4">
            <div className="max-w-md bg-black-secondary rounded-xl shadow-2xl p-8 text-center border border-gold-primary/20">
                <h1 className="text-3xl font-bold text-gold-primary mb-4">Oops!</h1>
                <p className="text-cream mb-4">Sorry, an unexpected error has occurred.</p>
                <p className="text-gray-light">
                    <i>{errorMessage}</i>
                </p>


                <button
                    onClick={() => window.location = '/'}
                    className="mt-6 bg-gold-primary text-black-primary px-6 py-2 rounded-lg hover:bg-gold-secondary transition duration-300"
                >
                    Return Home
                </button>
            </div>
        </div>
    );
}
