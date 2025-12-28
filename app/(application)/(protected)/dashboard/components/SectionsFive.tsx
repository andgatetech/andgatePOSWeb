'use client';

import { useCurrentStore } from '@/hooks/useCurrentStore';
import { useGetDashboardSectionsFiveQuery } from '@/store/features/dashboard/dashboad';
import { Package, ShoppingBag, Tag } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

// Skeleton components for loading state
const SectionSkeleton = () => (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-40 rounded bg-gray-200"></div>
            <div className="h-8 w-32 rounded-lg bg-gray-200"></div>
        </div>
        <div className="mb-4 h-48 rounded-lg bg-gray-200"></div>
        <div className="space-y-2">
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-full rounded bg-gray-200"></div>
        </div>
    </div>
);

// Donut Chart Component
const DonutChart = ({ data, colors, isVisible = true }: { data: Array<{ label: string; value: number }>; colors: string[]; isVisible?: boolean }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const hasData = total > 0 && data.length > 0;
    let currentAngle = -90; // Start from top

    const segments = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        currentAngle = endAngle;

        // Calculate path for donut segment
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        const x1 = 50 + 40 * Math.cos(startRad);
        const y1 = 50 + 40 * Math.sin(startRad);
        const x2 = 50 + 40 * Math.cos(endRad);
        const y2 = 50 + 40 * Math.sin(endRad);
        const largeArc = angle > 180 ? 1 : 0;

        return {
            path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
            color: colors[index % colors.length],
            label: item.label,
            value: item.value,
            percentage: percentage.toFixed(1),
            isFullCircle: percentage >= 99.9, // Check if this segment is essentially 100%
        };
    });

    // Calculate circumference for animation
    const radius = 32.5;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="flex items-center gap-4">
            <svg viewBox="0 0 100 100" className="h-48 w-48">
                {hasData ? (
                    <>
                        {/* Outer circle */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                        {/* Donut segments */}
                        {segments.length === 1 && segments[0].isFullCircle ? (
                            // For a single 100% segment, use a circle instead of a path with animation
                            <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="none"
                                stroke={segments[0].color}
                                strokeWidth="15"
                                strokeDasharray={circumference}
                                strokeDashoffset={isVisible ? 0 : circumference}
                                transform="rotate(-90 50 50)"
                                style={{
                                    transition: 'stroke-dashoffset 1.2s ease-out',
                                    transitionDelay: '0.1s',
                                }}
                            />
                        ) : (
                            segments.map((segment, index) => (
                                <path
                                    key={index}
                                    d={segment.path}
                                    fill={segment.color}
                                    className="duration-600 transition-all hover:opacity-80"
                                    style={{
                                        opacity: isVisible ? 1 : 0,
                                        transform: isVisible ? 'scale(1)' : 'scale(0.8)',
                                        transitionDelay: `${index * 150}ms`,
                                    }}
                                />
                            ))
                        )}
                        {/* Inner white circle to create donut effect */}
                        <circle cx="50" cy="50" r="25" fill="white" />
                    </>
                ) : (
                    <>
                        {/* Empty state - gray ring with animation */}
                        <circle
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke="#d1d5db"
                            strokeWidth="15"
                            strokeDasharray={circumference}
                            strokeDashoffset={isVisible ? 0 : circumference}
                            transform="rotate(-90 50 50)"
                            style={{
                                transition: 'stroke-dashoffset 1.2s ease-out',
                                transitionDelay: '0.1s',
                            }}
                        />
                        {/* Inner white circle to create donut effect */}
                        <circle cx="50" cy="50" r="25" fill="white" />
                    </>
                )}
            </svg>
            <div className="flex-1 space-y-2">
                {hasData ? (
                    segments.map((segment, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between text-sm transition-all duration-500"
                            style={{
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                                transitionDelay: `${index * 100 + 300}ms`,
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: segment.color }}></div>
                                <span className="text-gray-700">{segment.label}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-gray-900">{segment.value}</span>
                                <span className="ml-1 text-xs text-gray-500">Sales</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-sm text-gray-400">
                        <p>No data available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function SectionsFive() {
    const { currentStoreId } = useCurrentStore();

    // Intersection Observer for scroll animations
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(true); // Start as true so data shows immediately

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Set isVisible based on whether section is in viewport
                // This makes animations replay every time you scroll to the section
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold: 0.1, // Trigger when 10% of the section is visible
                rootMargin: '50px', // Start animation 50px before the section enters viewport
            }
        );

        const currentSection = sectionRef.current;
        if (currentSection) {
            observer.observe(currentSection);
        }

        return () => {
            if (currentSection) {
                observer.unobserve(currentSection);
            }
        };
    }, []);

    // Separate filter states for each section (backend now supports independent filters)
    const [categoryFilter, setCategoryFilter] = useState('today');
    const [categoryStartDate, setCategoryStartDate] = useState('');
    const [categoryEndDate, setCategoryEndDate] = useState('');

    const [brandFilter, setBrandFilter] = useState('today');
    const [brandStartDate, setBrandStartDate] = useState('');
    const [brandEndDate, setBrandEndDate] = useState('');

    const [purchaseFilter, setPurchaseFilter] = useState('today');
    const [purchaseStartDate, setPurchaseStartDate] = useState('');
    const [purchaseEndDate, setPurchaseEndDate] = useState('');

    // Single API call with independent filters for each section
    const {
        data: sectionsData,
        isLoading,
        isError,
    } = useGetDashboardSectionsFiveQuery({
        store_id: currentStoreId,
        // Category filters
        category_filter: categoryFilter,
        category_start_date: categoryFilter === 'custom' ? categoryStartDate : undefined,
        category_end_date: categoryFilter === 'custom' ? categoryEndDate : undefined,
        category_limit: 6,
        // Brand filters
        brand_filter: brandFilter,
        brand_start_date: brandFilter === 'custom' ? brandStartDate : undefined,
        brand_end_date: brandFilter === 'custom' ? brandEndDate : undefined,
        brand_limit: 6,
        // Purchase/Product filters
        purchase_filter: purchaseFilter,
        purchase_start_date: purchaseFilter === 'custom' ? purchaseStartDate : undefined,
        purchase_end_date: purchaseFilter === 'custom' ? purchaseEndDate : undefined,
        purchase_limit: 3,
    });

    // All sections use the same data from the single API response
    const categoriesData = sectionsData;
    const brandsData = sectionsData;
    const productsData = sectionsData;

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                <SectionSkeleton />
                <SectionSkeleton />
                <SectionSkeleton />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center sm:p-6">
                <p className="text-sm text-red-600 sm:text-base">Failed to load dashboard sections. Please try again.</p>
            </div>
        );
    }

    const top_categories = categoriesData?.data?.top_categories || { data: [], count: 0 };
    const top_brands = brandsData?.data?.top_brands || { data: [], count: 0 };
    const top_purchased_products = productsData?.data?.top_purchased_products || { data: [], count: 0 };

    // Prepare chart data for categories
    const categoryChartData = top_categories.data.slice(0, 3).map((cat) => ({
        label: cat.category_name,
        value: cat.total_sold,
    }));

    // Prepare chart data for brands
    const brandChartData = top_brands.data.slice(0, 3).map((brand) => ({
        label: brand.brand_name,
        value: brand.total_sold,
    }));

    const categoryColors = ['#1e3a8a', '#ea580c', '#eab308']; // Navy, Orange, Yellow
    const brandColors = ['#1e3a8a', '#ea580c', '#eab308'];

    return (
        <div ref={sectionRef} className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            <style jsx global>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease-out forwards;
                }

                @keyframes drawCircle {
                    from {
                        stroke-dashoffset: var(--circumference, 204);
                    }
                    to {
                        stroke-dashoffset: 0;
                    }
                }
                .animate-draw-circle {
                    animation: drawCircle 1.2s ease-out forwards;
                }

                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in-scale {
                    animation: fadeInScale 0.6s ease-out forwards;
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.5s ease-out forwards;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
            `}</style>

            {/* Top Categories Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 transition-all duration-300 hover:shadow-lg sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <Tag className="h-5 w-5 text-orange-500" />
                        Top Categories
                    </h2>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="today">Today</option>
                        <option value="last_week">Weekly</option>
                        <option value="last_year">Yearly</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>

                {/* Custom Date Range Picker */}
                {categoryFilter === 'custom' && (
                    <div className="animate-fade-in-up mb-4 flex gap-2 rounded-lg bg-gray-50 p-3">
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Start Date</label>
                            <input
                                type="date"
                                value={categoryStartDate}
                                onChange={(e) => setCategoryStartDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">End Date</label>
                            <input
                                type="date"
                                value={categoryEndDate}
                                onChange={(e) => setCategoryEndDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                    </div>
                )}

                {categoryChartData.length > 0 ? (
                    <>
                        <DonutChart data={categoryChartData} colors={categoryColors} isVisible={isVisible} />
                        <div className="mt-4 border-t border-gray-200 pt-4">
                            <h3 className="mb-2 text-sm font-semibold text-gray-700">Category Statistics</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <div className="bg-navy-900 h-2 w-2 rounded-full"></div>
                                        Total Number Of Categories
                                    </span>
                                    <span className="font-bold text-gray-900">{top_categories.count}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                        Total Revenue
                                    </span>
                                    <span className="font-bold text-gray-900">৳{top_categories.data.reduce((sum, cat) => sum + cat.total_revenue, 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <DonutChart data={[]} colors={categoryColors} isVisible={isVisible} />
                        <div className="mt-4 border-t border-gray-200 pt-4">
                            <h3 className="mb-2 text-sm font-semibold text-gray-700">Category Statistics</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <div className="bg-navy-900 h-2 w-2 rounded-full"></div>
                                        Total Number Of Categories
                                    </span>
                                    <span className="font-bold text-gray-900">0</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                        Total Revenue
                                    </span>
                                    <span className="font-bold text-gray-900">৳0</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Top Brands Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 transition-all duration-300 hover:shadow-lg sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <ShoppingBag className="h-5 w-5 text-blue-500" />
                        Top Brands
                    </h2>
                    <select
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="today">Today</option>
                        <option value="last_week">Weekly</option>
                        <option value="last_year">Yearly</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>

                {/* Custom Date Range Picker */}
                {brandFilter === 'custom' && (
                    <div className="animate-fade-in-up mb-4 flex gap-2 rounded-lg bg-gray-50 p-3">
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Start Date</label>
                            <input
                                type="date"
                                value={brandStartDate}
                                onChange={(e) => setBrandStartDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">End Date</label>
                            <input
                                type="date"
                                value={brandEndDate}
                                onChange={(e) => setBrandEndDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}

                {brandChartData.length > 0 ? (
                    <>
                        <DonutChart data={brandChartData} colors={brandColors} isVisible={isVisible} />
                        <div className="mt-4 border-t border-gray-200 pt-4">
                            <h3 className="mb-2 text-sm font-semibold text-gray-700">Brand Statistics</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <div className="bg-navy-900 h-2 w-2 rounded-full"></div>
                                        Total Number Of Brands
                                    </span>
                                    <span className="font-bold text-gray-900">{top_brands.count}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                        Total Revenue
                                    </span>
                                    <span className="font-bold text-gray-900">৳{top_brands.data.reduce((sum, brand) => sum + brand.total_revenue, 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <DonutChart data={[]} colors={brandColors} isVisible={isVisible} />
                        <div className="mt-4 border-t border-gray-200 pt-4">
                            <h3 className="mb-2 text-sm font-semibold text-gray-700">Brand Statistics</h3>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <div className="bg-navy-900 h-2 w-2 rounded-full"></div>
                                        Total Number Of Brands
                                    </span>
                                    <span className="font-bold text-gray-900">0</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-gray-600">
                                        <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                        Total Revenue
                                    </span>
                                    <span className="font-bold text-gray-900">৳0</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Top Purchased Products Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 transition-all duration-300 hover:shadow-lg sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <Package className="h-5 w-5 text-green-500" />
                        Top Purchased Products
                    </h2>
                    <select
                        value={purchaseFilter}
                        onChange={(e) => setPurchaseFilter(e.target.value)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="today">Today</option>
                        <option value="last_week">Weekly</option>
                        <option value="last_year">Yearly</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>

                {/* Custom Date Range Picker */}
                {purchaseFilter === 'custom' && (
                    <div className="animate-fade-in-up mb-4 flex gap-2 rounded-lg bg-gray-50 p-3">
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Start Date</label>
                            <input
                                type="date"
                                value={purchaseStartDate}
                                onChange={(e) => setPurchaseStartDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-gray-600">End Date</label>
                            <input
                                type="date"
                                value={purchaseEndDate}
                                onChange={(e) => setPurchaseEndDate(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>
                )}

                {/* View All Button */}
                <button className="mb-3 w-full text-center text-sm font-medium text-green-600 transition-all duration-200 hover:scale-105 hover:text-green-700">View All</button>

                {/* Divider */}
                <div className="mb-3 border-t border-gray-200"></div>

                <div className="space-y-2">
                    {top_purchased_products.data.length > 0 ? (
                        top_purchased_products.data.map((product, index) => (
                            <div
                                key={product.product_id}
                                className="transition-all duration-500"
                                style={{
                                    opacity: isVisible ? 1 : 0,
                                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                                    transitionDelay: `${index * 100}ms`,
                                }}
                            >
                                {index > 0 && <div className="my-2 border-t border-gray-200"></div>}
                                <div className="group flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition-all duration-300 hover:scale-[1.02] hover:border-green-100 hover:bg-white hover:shadow-md">
                                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                                        {product.product_image ? (
                                            <Image
                                                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/storage${product.product_image}`}
                                                alt={product.product_name}
                                                fill
                                                className="object-contain p-1 transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <Package className="h-6 w-6 text-gray-400 transition-transform duration-500 group-hover:scale-110" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-green-600">{product.product_name}</p>
                                        <p className="text-xs text-gray-600">
                                            ৳{product.total_cost.toLocaleString()} • {product.total_purchased} Purchased
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span
                                            className={`inline-block rounded-md px-2 py-1 text-xs font-semibold shadow-sm transition-transform group-hover:scale-105 ${
                                                product.trend === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {product.trend === 'positive' ? '↑' : '↓'} {product.percentage_change}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center">
                            <Package className="mx-auto h-12 w-12 text-gray-300" />
                            <p className="mt-2 text-sm text-gray-500">No purchased products found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
