'use client';

import type { RootState } from '@/store';
import { addItemRedux } from '@/store/features/Order/OrderSlice';
import { useGetAllProductsQuery } from '@/store/Product/productApi';
import { Eye, Package, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import BillToForm from './components-apps-invoice-right-billing';

import ImageShowModal from '@/app/(defaults)/components/Image Modal/ImageModal2';
import Image from 'next/image';

const ComponentsAppsInvoiceAdd = () => {
    const [open, setOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const dispatch = useDispatch();
    const itemsPerPage = 12;

    const { data: productsData, isLoading } = useGetAllProductsQuery({ available: 'yes' });
    const products = productsData?.data || [];
    const reduxItems = useSelector((state: RootState) => state.invoice.items);

    const beepRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        beepRef.current = new Audio('/assets/sound/store-scanner-beep-90395.mp3');
    }, []);

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 2000,
            customClass: { container: 'toast' },
        });
        toast.fire({ icon: type, title: msg, padding: '8px 16px' });
    };

    const addToCart = (product: any) => {
        if (product.available === 'no' || product.quantity <= 0) {
            showMessage('Product is not available', 'error');
            return;
        }

        // Check stock limit
        const currentQuantityInCart = reduxItems.filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);

        if (currentQuantityInCart >= product.quantity) {
            showMessage('Cannot add more, stock limit reached!', 'error');
            return;
        }

        if (beepRef.current) {
            beepRef.current.currentTime = 0;
            beepRef.current.play().catch(() => {});
        }

        const uniqueId = Date.now() + Math.floor(Math.random() * 1000);
        dispatch(
            addItemRedux({
                id: uniqueId,
                productId: product.id,
                title: product.product_name,
                description: product.description,
                rate: parseFloat(product.price),
                quantity: 1,
                amount: parseFloat(product.price),
                PlaceholderQuantity: product.quantity,
                tax_rate: parseFloat(product.tax_rate || '0'),
                tax_included: product.tax_included === 1,
                unit: product.unit || 'piece',
            })
        );

        showMessage('Item added successfully!');
        setSearchTerm('');
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);

        // 🔑 Auto-add when SKU format detected
        if (value.toLowerCase().startsWith('sku-') && value.length > 10) {
            const foundProduct = products.find((p) => p.sku.toLowerCase() === value.toLowerCase());
            if (foundProduct) {
                addToCart(foundProduct);
                setSearchTerm(''); // clear after adding
            }
        }
    };

    const handleImageShow = (product: any) => {
        setSelectedProduct(product);
        setOpen(true);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const filteredProducts = products.filter(
        (p) =>
            p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex flex-col gap-6 xl:flex-row">
            {/* Products Section */}
            <div className="flex-1">
                <div className="panel px-6 py-6">
                    <div className="mb-6">
                        <h1 className="mb-1 text-2xl font-bold text-gray-900">Select Products</h1>
                        <p className="text-sm text-gray-600">Click or scan a product to add it to your order</p>
                    </div>

                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, SKU, or scan barcode..."
                            className="form-input w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary"
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {currentProducts.map((product) => {
                            const isUnavailable = product.available === 'no' || product.quantity <= 0;

                            return (
                                <div
                                    key={product.id}
                                    className={`relative cursor-pointer rounded-lg border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
                                        isUnavailable ? 'opacity-60' : 'hover:scale-[1.02]'
                                    }`}
                                    onClick={() => !isUnavailable && addToCart(product)}
                                >
                                    {/* Product Image */}
                                    <div className="relative h-44 overflow-hidden rounded-t-lg bg-gray-100">
                                        {product.images && product.images.length > 0 ? (
                                            <Image src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${product.images[0].image_path}`} alt={product.product_name} fill className="object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-400">
                                                <Package className="mb-2 h-12 w-12" />
                                                <span className="text-sm font-medium">No Image Available</span>
                                            </div>
                                        )}

                                        {/* Open modal */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleImageShow(product);
                                            }}
                                            className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900">{product.product_name}</h3>

                                        {/* SKU */}
                                        {product.sku && <div className="mb-1 text-xs text-gray-400">SKU: {product.sku}</div>}

                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-base font-bold text-primary">৳{parseFloat(product.price).toFixed(2)}</span>
                                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">Stock: {product.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-center space-x-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full xl:w-96">
                <BillToForm />
            </div>

            {/* Modal for all images & description */}
            <ImageShowModal isOpen={open} onClose={() => setOpen(false)} product={selectedProduct} />
        </div>
    );
};

export default ComponentsAppsInvoiceAdd;
