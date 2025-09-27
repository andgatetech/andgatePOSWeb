import { Metadata } from 'next';
import { generateMetadata } from './seo';

/**
 * Enhanced page metadata with advanced SEO features
 */

// Enhanced dashboard metadata
export const dashboardMetadata: Metadata = {
  ...generateMetadata({
    title: 'Business Dashboard - Real-time Analytics & Performance Monitoring',
    description: 'Monitor your business performance with real-time analytics, sales reports, inventory tracking, and comprehensive business insights. Make data-driven decisions with AndgatePOS dashboard.',
    keywords: 'business dashboard, sales analytics, performance monitoring, real-time reports, business insights, pos analytics, sales tracking',
    path: '/(defaults)/dashboard'
  }),
  other: {
    'business-type': 'Point of Sale Software',
    'target-audience': 'Business Owners, Retail Managers',
    'primary-feature': 'Real-time Analytics'
  }
};

// Enhanced POS metadata
export const posMetadata: Metadata = {
  ...generateMetadata({
    title: 'POS Terminal - Fast & Secure Point of Sale System',
    description: 'Process sales transactions quickly and securely with our advanced POS terminal. Features barcode scanning, receipt printing, payment processing, and inventory updates in real-time.',
    keywords: 'pos terminal, point of sale, barcode scanner, receipt printing, payment processing, inventory management, retail pos',
    path: '/(defaults)/apps/pos'
  }),
  other: {
    'business-type': 'Point of Sale Terminal',
    'target-audience': 'Cashiers, Store Staff, Business Owners',
    'primary-feature': 'Transaction Processing'
  }
};

// Enhanced products metadata
export const productsMetadata: Metadata = {
  ...generateMetadata({
    title: 'Product Management - Inventory Control & Catalog Management',
    description: 'Manage your complete product catalog with advanced inventory control, stock tracking, pricing management, and multi-store product synchronization. Streamline your inventory operations.',
    keywords: 'product management, inventory control, stock tracking, catalog management, pricing, barcode management, multi-store inventory',
    path: '/(defaults)/apps/products'
  }),
  other: {
    'business-type': 'Inventory Management System',
    'target-audience': 'Inventory Managers, Business Owners',
    'primary-feature': 'Product Catalog Management'
  }
};

// Enhanced orders metadata
export const ordersMetadata: Metadata = {
  ...generateMetadata({
    title: 'Order Management - Sales Tracking & Customer Order History',
    description: 'Track and manage all customer orders with comprehensive order history, status updates, customer information, and detailed sales analytics. Optimize your order fulfillment process.',
    keywords: 'order management, sales tracking, customer orders, order history, sales analytics, order fulfillment, customer management',
    path: '/(defaults)/apps/orders'
  }),
  other: {
    'business-type': 'Order Management System',
    'target-audience': 'Sales Staff, Customer Service, Managers',
    'primary-feature': 'Order Tracking'
  }
};

// Enhanced invoice metadata
export const invoiceMetadata: Metadata = {
  ...generateMetadata({
    title: 'Invoice Management - Professional Billing & Receipt Generation',
    description: 'Create professional invoices and receipts with automated billing, tax calculations, payment tracking, and customer billing history. Streamline your billing process.',
    keywords: 'invoice management, billing system, receipt generation, automated billing, tax calculations, payment tracking, professional invoices',
    path: '/(defaults)/apps/invoice'
  }),
  other: {
    'business-type': 'Billing & Invoice System',
    'target-audience': 'Accountants, Business Owners, Billing Staff',
    'primary-feature': 'Invoice Generation'
  }
};

// Contact page metadata
export const contactMetadata: Metadata = {
  title: 'Contact AndgatePOS - Get Support & Sales Information',
  description: 'Contact AndgatePOS for technical support, sales inquiries, product demos, and customer service. Our expert team is ready to help your business succeed with our POS solution.',
  keywords: 'contact andgate pos, customer support, technical help, sales inquiry, product demo, pos support, customer service',
  openGraph: {
    title: 'Contact AndgatePOS Support Team',
    description: 'Get expert support for your POS system. Contact our team for technical assistance and sales information.',
    type: 'website',
    url: 'https://andgatepos.com/contact',
  },
  twitter: {
    card: 'summary',
    title: 'Contact AndgatePOS Support',
    description: 'Get professional POS system support and sales assistance.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
    }
  }
};