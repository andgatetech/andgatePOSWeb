declare module 'react-qr-barcode-scanner' {
    import { Component } from 'react';

    export interface BarcodeScannerComponentProps {
        width?: string | number;
        height?: string | number;
        facingMode?: 'environment' | 'user';
        torch?: boolean;
        delay?: number;
        videoConstraints?: MediaTrackConstraints;
        onUpdate?: (err: any, result?: any) => void;
        onError?: (error: any) => void;
        stopStream?: boolean;
    }

    export class BarcodeScannerComponent extends Component<BarcodeScannerComponentProps> {}

    // Also support default export
    export default BarcodeScannerComponent;
}
