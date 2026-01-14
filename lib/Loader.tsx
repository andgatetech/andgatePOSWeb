interface LoaderProps {
    message?: string;
    fullScreen?: boolean;
    className?: string;
}

const Loader = ({ message = 'Loading...', fullScreen = true, className = '' }: LoaderProps) => {
    if (fullScreen) {
        return (
            <div className={`flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                    <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center p-4 ${className}`}>
            <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                <p className="mt-3 text-sm font-medium text-gray-700">{message}</p>
            </div>
        </div>
    );
};

export default Loader;
