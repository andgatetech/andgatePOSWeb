// 'use client';
// import { useGetPurchaseDraftByIdQuery } from '@/store/features/PurchaseOrder/PurchaseOrderApi';
// import { setItemsRedux, setNotesRedux, setPurchaseTypeRedux, setSupplierDetailsRedux } from '@/store/features/PurchaseOrder/PurchaseOrderSlice';
// import { ArrowLeft } from 'lucide-react';
// import Link from 'next/link';
// import { useParams, useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import PurchaseOrderLeftSide from '../../create/PurchaseOrderLeftSide';
// import PurchaseOrderRightSide from '../../create/PurchaseOrderRightSide';

// const EditPurchaseDraftPage = () => {
//     const params = useParams();
//     const router = useRouter();
//     const dispatch = useDispatch();
//     const draftId = params.id as string;

//     const [isMobileView, setIsMobileView] = useState(false);
//     const [showMobileCart, setShowMobileCart] = useState(false);

//     // Fetch draft data
//     const { data: draftResponse, isLoading, error } = useGetPurchaseDraftByIdQuery(draftId);

//     // Mobile view detection
//     useEffect(() => {
//         const checkMobileView = () => {
//             setIsMobileView(window.innerWidth < 1024);
//         };

//         checkMobileView();
//         window.addEventListener('resize', checkMobileView);

//         return () => window.removeEventListener('resize', checkMobileView);
//     }, []);

//     useEffect(() => {
//         if (draftResponse?.data) {
//             const draft = draftResponse.data;

//             // Load purchase type
//             dispatch(setPurchaseTypeRedux(draft.purchase_type || 'supplier'));

//             // Load supplier details
//             if (draft.supplier) {
//                 dispatch(
//                     setSupplierDetailsRedux({
//                         id: draft.supplier.id,
//                         name: draft.supplier.name,
//                         email: draft.supplier.email,
//                         phone: draft.supplier.phone,
//                         contact_person: draft.supplier.contact_person || '',
//                     })
//                 );
//             }

//             // Load notes
//             if (draft.notes) {
//                 dispatch(setNotesRedux(draft.notes));
//             }

//             // Load items into Redux
//             if (draft.items && draft.items.length > 0) {
//                 const items = draft.items.map((item: any) => ({
//                     id: item.id,
//                     productId: item.product_id || undefined,
//                     itemType: item.type === 'existing' ? 'existing' : 'new',
//                     title: item.product_name,
//                     description: item.product_description || '',
//                     unit: item.unit || 'piece',
//                     quantity: item.quantity_ordered,
//                     purchasePrice: item.purchase_price || 0,
//                     amount: (item.quantity_ordered || 0) * (item.purchase_price || 0),
//                     status: 'ordered',
//                 }));

//                 dispatch(setItemsRedux(items));
//             }
//         }
//     }, [draftResponse, dispatch]);

//     if (isLoading) {
//         return (
//             <div className="flex h-screen items-center justify-center">
//                 <div className="text-center">
//                     <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
//                     <p className="text-gray-600">Loading draft...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (error || !draftResponse?.data) {
//         return (
//             <div className="flex h-screen items-center justify-center">
//                 <div className="text-center">
//                     <p className="mb-4 text-lg text-red-600">Failed to load draft</p>
//                     <Link href="/purchases/list" className="btn btn-primary">
//                         <ArrowLeft className="mr-2 h-4 w-4" />
//                         Back to List
//                     </Link>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div>
//             {/* Header */}
//             <div className="mb-6 flex items-center justify-between">
//                 <div>
//                     <h1 className="text-2xl font-bold">Edit Purchase Draft</h1>
//                     <p className="mt-1 text-sm text-gray-600">
//                         Draft Reference: <span className="font-semibold">{draftResponse.data.draft_reference}</span>
//                     </p>
//                 </div>
//                 <Link href="/purchases/list" className="btn btn-outline-secondary">
//                     <ArrowLeft className="mr-2 h-4 w-4" />
//                     Back to List
//                 </Link>
//             </div>

//             {/* Two Column Layout */}
//             <div className="relative flex overflow-hidden">
//                 {/* Left Side - Product Selection */}
//                 <PurchaseOrderLeftSide 
//                     isMobileView={isMobileView}
//                     showMobileCart={showMobileCart}
//                     setShowMobileCart={setShowMobileCart}
//                 />

//                 {/* Right Side - Draft Details & Items */}
//                 <PurchaseOrderRightSide 
//                     draftId={Number(draftId)} 
//                     isEditMode={true}
//                     isMobileView={isMobileView}
//                     showMobileCart={showMobileCart}
//                 />
//             </div>
//         </div>
//     );
// };

// export default EditPurchaseDraftPage;
