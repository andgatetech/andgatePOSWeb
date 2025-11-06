import { Camera, X } from 'lucide-react';
import React from 'react';

interface CameraScannerProps {
    isOpen: boolean;
    onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="mb-4 overflow-hidden rounded-lg border-2 border-blue-500 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b bg-blue-500 px-4 py-3">
                <div className="flex items-center gap-2 text-white">
                    <Camera className="h-5 w-5" />
                    <span className="font-semibold">Camera Scanner Active</span>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white"></span>
                </div>
                <button onClick={onClose} className="rounded-full p-1.5 text-white hover:bg-blue-600">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="relative bg-gray-900">
                {/* Html5-qrcode scanner will be rendered here */}
                <div id="qr-reader" style={{ border: 'none' }}></div>
            </div>

            <div className="bg-gray-50 px-4 py-3 text-sm text-gray-700">
                <p className="text-center font-medium">Point camera at barcode or QR code</p>
                <p className="mt-1 text-center text-xs text-gray-500">Scanner will automatically detect and add product to cart</p>

                <div className="mt-3 border-t border-gray-200 pt-3">
                    <p className="mb-2 text-xs font-semibold text-gray-600">📷 Camera not showing?</p>
                    <ul className="space-y-1 text-xs text-gray-600">
                        <li>• Allow camera permission when prompted</li>
                        <li>• Check browser settings (🔒 icon in address bar)</li>
                        <li>• Close other apps using camera</li>
                        <li>• Refresh page after allowing permission</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CameraScanner;
