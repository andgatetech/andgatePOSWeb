interface LoadingOverlayProps {
    isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
    if (!isLoading) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black bg-opacity-50">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-t-transparent sm:h-16 sm:w-16"></div>
            <span className="animate-pulse text-base font-semibold text-white sm:text-lg">Processing Purchase Order...</span>
        </div>
    );
};

export default LoadingOverlay;
