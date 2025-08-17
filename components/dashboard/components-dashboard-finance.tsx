// pages/dashboard.js
'use client'
import React, { useState, useEffect } from 'react';
import Head from 'next/head';

const SupplierDashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 1247,
        pendingOrders: 23,
        completedOrders: 1180,
        totalRevenue: 284750,
        monthlyGrowth: 12.5,
        avgOrderValue: 228.4,
    });

    const [recentOrders, setRecentOrders] = useState([
        { id: 'ORD-2024-001', customer: 'TechCorp Inc.', amount: 1250, status: 'pending', date: '2024-08-13' },
        { id: 'ORD-2024-002', customer: 'BuildRight Ltd.', amount: 890, status: 'completed', date: '2024-08-12' },
        { id: 'ORD-2024-003', customer: 'Manufacturing Co.', amount: 2340, status: 'processing', date: '2024-08-12' },
        { id: 'ORD-2024-004', customer: 'Global Solutions', amount: 567, status: 'completed', date: '2024-08-11' },
        { id: 'ORD-2024-005', customer: 'Industry Partners', amount: 1456, status: 'pending', date: '2024-08-11' },
    ]);

    const [topProducts, setTopProducts] = useState([
        { name: 'Industrial Valve A', sales: 245, revenue: 24500 },
        { name: 'Steel Pipe 2inch', sales: 189, revenue: 18900 },
        { name: 'Heavy Duty Motor', sales: 156, revenue: 31200 },
        { name: 'Safety Equipment Kit', sales: 134, revenue: 13400 },
        { name: 'Control Panel Unit', sales: 98, revenue: 19600 },
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return '#10B981';
            case 'pending':
                return '#F59E0B';
            case 'processing':
                return '#3B82F6';
            default:
                return '#6B7280';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'completed':
                return '#ECFDF5';
            case 'pending':
                return '#FFFBEB';
            case 'processing':
                return '#EFF6FF';
            default:
                return '#F9FAFB';
        }
    };

    return (
        <>
            <Head>
                <title>Supplier Dashboard</title>
                <meta name="description" content="Professional supplier management dashboard" />
            </Head>

            <div
                style={{
                    minHeight: '100vh',
                    backgroundColor: '#F8FAFC',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                }}
            >
                {/* Header */}
                <header
                    style={{
                        backgroundColor: 'white',
                        borderBottom: '1px solid #E2E8F0',
                        padding: '1rem 2rem',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                    }}
                >
                    <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>Supplier Dashboard</h1>
                            <p style={{ color: '#64748B', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>Welcome back! Here's what's happening with your business today.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div
                                style={{
                                    backgroundColor: '#F1F5F9',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: '#475569',
                                }}
                            >
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                    {/* Stats Cards */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '1.5rem',
                            marginBottom: '2rem',
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: 'white',
                                padding: '1.5rem',
                                borderRadius: '0.75rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '1px solid #E2E8F0',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>Total Orders</p>
                                    <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1E293B', margin: '0.5rem 0 0 0' }}>{stats.totalOrders.toLocaleString()}</p>
                                </div>
                                <div
                                    style={{
                                        backgroundColor: '#EFF6FF',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                    }}
                                >
                                    📦
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: 'white',
                                padding: '1.5rem',
                                borderRadius: '0.75rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '1px solid #E2E8F0',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>Pending Orders</p>
                                    <p style={{ fontSize: '2rem', fontWeight: '700', color: '#F59E0B', margin: '0.5rem 0 0 0' }}>{stats.pendingOrders}</p>
                                </div>
                                <div
                                    style={{
                                        backgroundColor: '#FFFBEB',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                    }}
                                >
                                    ⏳
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: 'white',
                                padding: '1.5rem',
                                borderRadius: '0.75rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '1px solid #E2E8F0',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>Total Revenue</p>
                                    <p style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981', margin: '0.5rem 0 0 0' }}>${stats.totalRevenue.toLocaleString()}</p>
                                </div>
                                <div
                                    style={{
                                        backgroundColor: '#ECFDF5',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                    }}
                                >
                                    💰
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                backgroundColor: 'white',
                                padding: '1.5rem',
                                borderRadius: '0.75rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '1px solid #E2E8F0',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <p style={{ color: '#64748B', fontSize: '0.875rem', margin: 0 }}>Monthly Growth</p>
                                    <p style={{ fontSize: '2rem', fontWeight: '700', color: '#3B82F6', margin: '0.5rem 0 0 0' }}>+{stats.monthlyGrowth}%</p>
                                </div>
                                <div
                                    style={{
                                        backgroundColor: '#EFF6FF',
                                        padding: '0.75rem',
                                        borderRadius: '0.5rem',
                                    }}
                                >
                                    📈
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        {/* Recent Orders */}
                        <div
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '0.75rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '1px solid #E2E8F0',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>Recent Orders</h3>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#F8FAFC' }}>
                                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#64748B' }}>Order ID</th>
                                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#64748B' }}>Customer</th>
                                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#64748B' }}>Amount</th>
                                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#64748B' }}>Status</th>
                                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '500', color: '#64748B' }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order, index) => (
                                            <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#1E293B' }}>{order.id}</td>
                                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#475569' }}>{order.customer}</td>
                                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#1E293B' }}>${order.amount.toLocaleString()}</td>
                                                <td style={{ padding: '1rem 1.5rem' }}>
                                                    <span
                                                        style={{
                                                            backgroundColor: getStatusBg(order.status),
                                                            color: getStatusColor(order.status),
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '9999px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '500',
                                                            textTransform: 'capitalize',
                                                        }}
                                                    >
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#64748B' }}>{new Date(order.date).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Top Products */}
                        <div
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '0.75rem',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                border: '1px solid #E2E8F0',
                            }}
                        >
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', margin: 0 }}>Top Products</h3>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                {topProducts.map((product, index) => (
                                    <div
                                        key={product.name}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            paddingBottom: index === topProducts.length - 1 ? 0 : '1rem',
                                            marginBottom: index === topProducts.length - 1 ? 0 : '1rem',
                                            borderBottom: index === topProducts.length - 1 ? 'none' : '1px solid #F1F5F9',
                                        }}
                                    >
                                        <div>
                                            <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1E293B', margin: 0 }}>{product.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.25rem 0 0 0' }}>{product.sales} sales</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10B981', margin: 0 }}>${product.revenue.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div
                        style={{
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            border: '1px solid #E2E8F0',
                            padding: '1.5rem',
                        }}
                    >
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E293B', margin: '0 0 1.5rem 0' }}>Performance Overview</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div
                                    style={{
                                        backgroundColor: '#EFF6FF',
                                        borderRadius: '50%',
                                        width: '60px',
                                        height: '60px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem auto',
                                        fontSize: '1.5rem',
                                    }}
                                >
                                    🎯
                                </div>
                                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem 0' }}>94.7%</p>
                                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>Order Fulfillment Rate</p>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div
                                    style={{
                                        backgroundColor: '#ECFDF5',
                                        borderRadius: '50%',
                                        width: '60px',
                                        height: '60px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem auto',
                                        fontSize: '1.5rem',
                                    }}
                                >
                                    ⭐
                                </div>
                                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem 0' }}>4.8/5.0</p>
                                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>Customer Rating</p>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div
                                    style={{
                                        backgroundColor: '#FFFBEB',
                                        borderRadius: '50%',
                                        width: '60px',
                                        height: '60px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem auto',
                                        fontSize: '1.5rem',
                                    }}
                                >
                                    🚚
                                </div>
                                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem 0' }}>2.3 days</p>
                                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>Avg Delivery Time</p>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div
                                    style={{
                                        backgroundColor: '#FDF2F8',
                                        borderRadius: '50%',
                                        width: '60px',
                                        height: '60px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 1rem auto',
                                        fontSize: '1.5rem',
                                    }}
                                >
                                    💼
                                </div>
                                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem 0' }}>${stats.avgOrderValue}</p>
                                <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>Avg Order Value</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default SupplierDashboard;
