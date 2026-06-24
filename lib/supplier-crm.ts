export type SupplierTaskStatus = 'open' | 'done';

export interface SupplierTask {
    id: string;
    supplierId: number | string;
    supplierName: string;
    phone?: string;
    type: 'call' | 'whatsapp' | 'payment' | 'purchase' | 'visit' | 'other';
    title: string;
    dueDate: string;
    note?: string;
    status: SupplierTaskStatus;
    createdAt: string;
}

const TASKS_KEY = 'andgatepos-supplier-tasks';

export const normalizeBdPhone = (phone?: string | null) => {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('880')) return digits;
    if (digits.startsWith('0')) return `88${digits}`;
    return `880${digits}`;
};

export const buildSupplierWhatsAppUrl = (phone: string | undefined, message: string) => {
    const number = normalizeBdPhone(phone);
    return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : '';
};

export const getSupplierTasks = (): SupplierTask[] => {
    if (typeof window === 'undefined') return [];

    try {
        const parsed = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const saveSupplierTasks = (tasks: SupplierTask[]) => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch {
        // Browser-local MVP storage. Backend task persistence can replace this later.
    }
};

export const addSupplierTask = (task: Omit<SupplierTask, 'id' | 'createdAt' | 'status'>) => {
    const nextTask: SupplierTask = {
        ...task,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        status: 'open',
    };
    const tasks = [nextTask, ...getSupplierTasks()];
    saveSupplierTasks(tasks);
    return nextTask;
};

export const updateSupplierTaskStatus = (taskId: string, status: SupplierTaskStatus) => {
    const tasks = getSupplierTasks().map((task) => (task.id === taskId ? { ...task, status } : task));
    saveSupplierTasks(tasks);
    return tasks;
};

export const supplierWhatsappTemplates = {
    paymentUpdate: (supplierName: string, amount: string, storeName: string) =>
        `Assalamu alaikum ${supplierName}, ${storeName} থেকে জানাচ্ছি আপনার পেমেন্ট/বাকি আপডেট: ${amount}। ধন্যবাদ।`,
    purchaseFollowup: (supplierName: string, storeName: string) =>
        `Assalamu alaikum ${supplierName}, ${storeName} থেকে নতুন পণ্য/ডেলিভারি বিষয়ে কথা বলতে চাই। সময় হলে জানাবেন।`,
    general: (supplierName: string, storeName: string) =>
        `Assalamu alaikum ${supplierName}, ${storeName} থেকে যোগাযোগ করছি। অনুগ্রহ করে সুবিধামতো রিপ্লাই করবেন।`,
};
