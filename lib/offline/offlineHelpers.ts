const DEVICE_ID_KEY = 'andgate_pos_device_id';
const LOCAL_INVOICE_COUNTER_KEY = 'andgate_pos_local_invoice_counter';

export function getDeviceId(): string {
    if (typeof window === 'undefined') return 'ssr';
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
        id = `DEV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
}

export function generateLocalInvoiceNumber(): string {
    const today = new Date();
    const dateKey = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const counterKey = `${LOCAL_INVOICE_COUNTER_KEY}_${dateKey}`;

    let counter = parseInt(localStorage.getItem(counterKey) ?? '0', 10) + 1;
    localStorage.setItem(counterKey, String(counter));

    return `OFF-${dateKey}-${String(counter).padStart(4, '0')}`;
}
