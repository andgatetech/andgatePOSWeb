'use client';  
  
import IconX from '@/components/icon/icon-x';  
import IconSave from '@/components/icon/icon-save';  
import IconEye from '@/components/icon/icon-eye';  
import { useGetAllProductsQuery } from '@/store/Product/productApi';  
import Link from 'next/link';  
import React, { useEffect, useState } from 'react';  
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import BillToForm from './components-apps-invoice-right-billing';
import { useDispatch } from 'react-redux';
import { setItemsRedux } from '@/store/features/Order/OrderSlice';
 
const ComponentsAppsInvoiceAdd = () => {  
    // Fetch all products from API  
    const dispatch = useDispatch();
  const { data: productsData, isLoading } = useGetAllProductsQuery();  
  const products = productsData?.data || [];  
  
  // Items in invoice  
  const [items, setItems] = useState<any[]>([  
    {  
      id: 1,  
      productId: undefined,  
      title: '',  
      description: '',  
      rate: 0,  
      quantity: 0,  
      amount: 0,  
    },  
  ]);  
  
  // Track search input for each item  
  const [searchTerm, setSearchTerm] = useState<Record<number, string>>({});  
  // Show dropdown list per item for product search  
  const [showDropdown, setShowDropdown] = useState<Record<number, boolean>>({});  
  
  // Add new empty item row  
  const addItem = () => {  
    const maxId = items.length ? Math.max(...items.map((i) => i.id)) : 0;  
    setItems([  
      ...items,  
      {  
        id: maxId + 1,  
        productId: undefined,  
        title: '',  
        description: '',  
        rate: 0,  
        quantity: 0,  
        amount: 0,  
      },  
    ]);  
  };  
  
  // Remove item row  
  const removeItem = (item: any) => {  
    setItems(items.filter((d: any) => d.id !== item.id));  
    // Clean up dropdown and search for removed id  
    setShowDropdown((prev) => {  
      const newState = { ...prev };  
      delete newState[item.id];  
      return newState;  
    });  
    setSearchTerm((prev) => {  
      const newState = { ...prev };  
      delete newState[item.id];  
      return newState;  
    });  
    };
    const showMessage = (msg = '', type = 'success') => {
            const toast: any = Swal.mixin({
                toast: true,
                position: 'top',
                showConfirmButton: false,
                timer: 3000,
                customClass: { container: 'toast' },
            });
            toast.fire({
                icon: type,
                title: msg,
                padding: '10px 20px',
            });
        };

    // Handle input change for quantity or price  
    
  const changeQuantityPrice = (type: string, value: string, id: number) => {
      const list = [...items];
      const item = list.find((d) => d.id === id);
      if (!item) return;

      if (type === 'quantity') {
          const qty = Number(value);
          if (qty < 0) return; // prevent negative quantity
          if (qty > item.PlaceholderQuantity) {
               showMessage(`Maximum available quantity is ${item.PlaceholderQuantity}`, 'error');
              return; // prevent quantity exceeding available stock
          }
          item.quantity = qty;
      }

      if (type === 'price') {
          const price = Number(value);
          if (price < 0) return; // prevent negative price
          item.rate = price;
      }

      // Update amount = quantity * rate
      item.amount = item.quantity * item.rate;

      setItems(list);
  };

  // Handle product name search input change  
  const onSearchChange = (id: number, value: string) => {  
    setSearchTerm((prev) => ({ ...prev, [id]: value }));  
    setShowDropdown((prev) => ({ ...prev, [id]: true }));  
  
    // Clear selected product if user types something new  
    const list = [...items];  
    const item = list.find((d) => d.id === id);  
    if (!item) return;  
    item.productId = undefined;  
    item.description = '';  
    item.rate = 0;  
      item.amount = 0;  
      item.quantity = 0;  
    setItems(list);  
  };  
  
  // When user selects a product from dropdown  
  const onSelectProduct = (id: number, product: any) => {  
    const list = [...items];  
    const item = list.find((d) => d.id === id);  
    if (!item) return;  
  
    item.productId = product.id;  
    item.title = product.product_name;  
    item.description = product.description || '';  
    item.rate = Number(product.price) || 0;  
    item.quantity = 1;
    item.PlaceholderQuantity = product.quantity || 0; 
      item.amount = item.rate * item.quantity; 
    
  
    setItems(list);  
    setSearchTerm((prev) => ({ ...prev, [id]: product.product_name }));  
    setShowDropdown((prev) => ({ ...prev, [id]: false }));  
  };  
  
  // Generate invoice number on mount  
  const [invoiceNumber, setInvoiceNumber] = useState('');  
  useEffect(() => {  
    const now = Date.now(); // milliseconds since 1970  
    const randomPart = Math.floor(100 + Math.random() * 900); // 3 random digits  
    setInvoiceNumber(`#${now}-${randomPart}`);  
  }, []);  
  
  

  
  const subtotal = items.reduce((acc, item) => acc + item.amount, 0);  
  

   
    
const initialInvoiceData = {
    items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.rate,

        PerProductSubtotal: item.amount,
    })),
};

useEffect(() => {
    dispatch(setItemsRedux(initialInvoiceData.items));
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [items]);

  
  return (
      <div className="flex flex-col gap-2.5 xl:flex-row">
          <div className="panel flex-1 px-0 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
              <div className="flex flex-wrap justify-between px-4">
                  <div className="mb-6 w-full lg:w-1/2">
                      <div className="flex shrink-0 items-center text-black dark:text-white">
                          <img src="/assets/images/logo.svg" alt="img" className="w-14" />
                      </div>
                      <div className="mt-6 space-y-1 text-gray-500 dark:text-gray-400">
                          <div>Dhaka ,Bangladesh</div>
                          <div>andgate@gmail.com</div>
                          <div>+8801610108851</div>
                      </div>
                  </div>
                  <div className="w-full lg:w-1/2 lg:max-w-fit">
                      <div className="flex items-center">
                          <label htmlFor="number" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                              Invoice Number
                          </label>
                          <input id="number" type="text" name="inv-num" className="form-input w-2/3 lg:w-[250px]" value={invoiceNumber} readOnly />
                      </div>
                  </div>
              </div>
              <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />

              <div className="mt-8">
                  <div className="table-responsive">
                      <table>
                          <thead>
                              <tr>
                                  <th>Item</th>
                                  <th className="w-1">Quantity</th>
                                  <th className="w-1">Price</th>
                                  <th>Total</th>
                                  <th className="w-1"></th>
                              </tr>
                          </thead>
                          <tbody>
                              {items.length <= 0 && (
                                  <tr>
                                      <td colSpan={5} className="!text-center font-semibold">
                                          No Item Available
                                      </td>
                                  </tr>
                              )}
                              {items.map((item: any) => (
                                  <tr className="align-top" key={item.id}>
                                      <td className="relative">
                                          <input
                                              type="text"
                                              className="form-input min-w-[200px]"
                                              placeholder="Enter Item Name"
                                              value={searchTerm[item.id] ?? item.title}
                                              onChange={(e) => onSearchChange(item.id, e.target.value)}
                                              onFocus={() => setShowDropdown((prev) => ({ ...prev, [item.id]: true }))}
                                          />
                                          {/* Dropdown list */}
                                          {showDropdown[item.id] && searchTerm[item.id] && (
                                              <ul className="absolute z-10 max-h-44 w-full overflow-auto rounded border bg-white p-1 shadow dark:bg-[#172638]">
                                                  {products
                                                      .filter((product) => product.product_name.toLowerCase().includes(searchTerm[item.id].toLowerCase()))
                                                      .slice(0, 10)
                                                      .map((product) => (
                                                          <li
                                                              key={product.id}
                                                              className="cursor-pointer rounded p-2 hover:bg-gray-100 dark:hover:bg-[#0e1629]"
                                                              onClick={() => onSelectProduct(item.id, product)}
                                                          >
                                                              {product.product_name}
                                                          </li>
                                                      ))}

                                                  {products.filter((product) => product.product_name.toLowerCase().includes(searchTerm[item.id].toLowerCase())).length === 0 && (
                                                      <li className="p-2 text-gray-400">No matching products</li>
                                                  )}
                                              </ul>
                                          )}
                                          <textarea className="form-textarea mt-4" placeholder="Enter Description" value={item.description} readOnly></textarea>
                                      </td>

                                      <td>
                                          <input
                                              type="number"
                                              className="form-input w-32"
                                              placeholder="Quantity"
                                              min={0}
                                              value={item.quantity}
                                              onChange={(e) => changeQuantityPrice('quantity', e.target.value, item.id)}
                                          />
                                          <div className="text-xs text-gray-400">Available: {item.PlaceholderQuantity}</div>
                                      </td>

                                      <td>
                                          <input
                                              type="number"
                                              className="form-input w-32"
                                              placeholder="Price"
                                              min={0}
                                              value={item.rate}
                                              onChange={(e) => changeQuantityPrice('price', e.target.value, item.id)}
                                          />
                                      </td>
                                      <td>${(item.quantity * item.rate).toFixed(2)}</td>
                                      <td>
                                          <button type="button" onClick={() => removeItem(item)}>
                                              <IconX className="h-5 w-5" />
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
                  <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
                      <div className="mb-6 sm:mb-0">
                          <button type="button" className="btn btn-primary" onClick={() => addItem()}>
                              Add Item
                          </button>
                      </div>
                      <div className="sm:w-2/5">
                          <div className="flex items-center justify-between">
                              <div>Subtotal</div>
                              <div>${subtotal.toFixed(2)}</div>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="mt-8 px-4">
                  <label htmlFor="notes">Notes</label>
                  <textarea id="notes" name="notes" className="form-textarea min-h-[130px]" placeholder="Notes...."></textarea>
              </div>
          </div>

          {/* Right side form, unchanged */}
          <div>
              <BillToForm  />
          </div>
      </div>
  );  
};  
  
export default ComponentsAppsInvoiceAdd;  