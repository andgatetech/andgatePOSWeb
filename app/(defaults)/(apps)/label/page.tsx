'use client';

import { Barcode, GripVertical, Package } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import CodeGeneratorPanel from './__components/CodeGeneratorPanel';
import ProductSearchPanel from './__components/ProductSearchPanel';

export interface SelectedProduct {
    id: number;
    product_name: string;
    sku: string;
    product_code: string;
    category?: string;
    brand?: string;
    price: number;
    quantity: number;
    image?: string;
}

export type CodeType = 'qrcode' | 'barcode';

const BarcodeGeneratorPage = () => {
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [activeTab, setActiveTab] = useState<CodeType>('barcode');

    // Layout states
    const [leftWidth, setLeftWidth] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [showRightPanel, setShowRightPanel] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Detect screen size
    useEffect(() => {
        const checkMobile = () => setIsMobileView(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Divider drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
        const constrained = Math.max(25, Math.min(75, newWidth));
        setLeftWidth(constrained);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
        };
    }, [isDragging]);

    // Selection logic
    const handleProductSelect = (product: any) => {
        const exists = selectedProducts.find((p) => p.product_code === product.product_code);
        if (exists) {
            setSelectedProducts(selectedProducts.filter((p) => p.product_code !== product.product_code));
        } else {
            setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
        }
    };

    const handleProductRemove = (code: string) => {
        setSelectedProducts((prev) => prev.filter((p) => p.product_code !== code));
    };

    const handleQuantityChange = (code: string, qty: number) => {
        setSelectedProducts((prev) => prev.map((p) => (p.product_code === code ? { ...p, quantity: qty } : p)));
    };

    const handleClearAll = () => {
        if (window.confirm('Clear all selected products?')) setSelectedProducts([]);
    };

    return (
        <>
            {/* 📱 Mobile toggle */}
            {isMobileView && (
                <button
                    onClick={() => setShowRightPanel(!showRightPanel)}
                    className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg lg:hidden"
                >
                    {showRightPanel ? <Package className="h-6 w-6" /> : <Barcode className="h-6 w-6" />}
                    {selectedProducts.length > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{selectedProducts.length}</span>
                    )}
                </button>
            )}

            <div ref={containerRef} className="relative flex h-screen overflow-hidden">
                {/* Left Panel - Product Selection */}
                <div className={`flex flex-col overflow-hidden transition-all ${isMobileView ? (showRightPanel ? 'hidden' : 'w-full') : ''}`} style={!isMobileView ? { width: `${leftWidth}%` } : {}}>
                    <ProductSearchPanel selectedProducts={selectedProducts} onProductSelect={handleProductSelect} activeTab={activeTab} />
                </div>

                {/* Divider */}
                {!isMobileView && (
                    <div className="flex w-2 cursor-col-resize items-center justify-center bg-gray-100 hover:bg-gray-200" onMouseDown={handleMouseDown}>
                        <GripVertical className="h-5 w-5 text-gray-400" />
                    </div>
                )}

                {/* Right Panel - Code Generator */}
                <div
                    className={`flex flex-col overflow-hidden transition-all ${isMobileView ? (showRightPanel ? 'w-full' : 'hidden') : ''}`}
                    style={!isMobileView ? { width: `${100 - leftWidth}%` } : {}}
                >
                    <CodeGeneratorPanel
                        selectedProducts={selectedProducts}
                        onProductRemove={handleProductRemove}
                        onQuantityChange={handleQuantityChange}
                        onClearAll={handleClearAll}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                </div>
            </div>
        </>
    );
};

export default BarcodeGeneratorPage;
