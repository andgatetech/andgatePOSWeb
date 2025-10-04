declare module 'react-barcode-reader' {
    import { Component } from 'react';

    export interface BarcodeReaderProps {
        onScan: (data: string) => void;
        onError?: (err: any) => void;
        minLength?: number;
        avgTimeByChar?: number;
        timeBeforeScanTest?: number;
        scanButtonKeyCode?: number;
        scanButtonLongPressThreshold?: number;
        stopPropagation?: boolean;
        preventDefault?: boolean;
    }

    export default class BarcodeReader extends Component<BarcodeReaderProps> {}
}
