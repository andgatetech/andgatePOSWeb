export type CrmTaskStatus = 'open' | 'done';

export interface CrmTask {
    id: string;
    customerId: number | string;
    customerName: string;
    phone?: string;
    type: 'call' | 'whatsapp' | 'sms' | 'visit' | 'payment' | 'reorder' | 'birthday' | 'other';
    title: string;
    dueDate: string;
    note?: string;
    status: CrmTaskStatus;
    createdAt: string;
}

const TASKS_KEY = 'andgatepos-crm-tasks';

export const normalizeBdPhone = (phone?: string | null) => {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('880')) return digits;
    if (digits.startsWith('0')) return `88${digits}`;
    return `880${digits}`;
};

export const buildWhatsAppUrl = (phone: string | undefined, message: string) => {
    const number = normalizeBdPhone(phone);
    return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : '';
};

export const getCrmTasks = (): CrmTask[] => {
    if (typeof window === 'undefined') return [];

    try {
        const parsed = JSON.parse(localStorage.getItem(TASKS_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const saveCrmTasks = (tasks: CrmTask[]) => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch {
        // Best-effort MVP storage. Backend persistence can replace this later.
    }
};

export const addCrmTask = (task: Omit<CrmTask, 'id' | 'createdAt' | 'status'>) => {
    const nextTask: CrmTask = {
        ...task,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        status: 'open',
    };
    const tasks = [nextTask, ...getCrmTasks()];
    saveCrmTasks(tasks);
    return nextTask;
};

export const updateCrmTaskStatus = (taskId: string, status: CrmTaskStatus) => {
    const tasks = getCrmTasks().map((task) => (task.id === taskId ? { ...task, status } : task));
    saveCrmTasks(tasks);
    return tasks;
};

export const whatsappTemplates = {
    dueReminder: (customerName: string, amount: string, storeName: string) =>
        `Assalamu alaikum ${customerName}, ${storeName} থেকে জানাচ্ছি আপনার বাকি আছে ${amount}। সুবিধামতো পেমেন্ট করে দিন। ধন্যবাদ।`,
    birthday: (customerName: string, storeName: string) =>
        `Happy Birthday ${customerName}! ${storeName} পরিবারের পক্ষ থেকে শুভেচ্ছা। আজকের জন্য আপনার বিশেষ অফার জানতে রিপ্লাই করুন।`,
    inactive: (customerName: string, storeName: string) =>
        `Assalamu alaikum ${customerName}, অনেকদিন আপনাকে ${storeName}-এ পাইনি। নতুন অফার ও পণ্য এসেছে, সময় করে দেখে যান।`,
    reorder: (customerName: string, storeName: string) =>
        `Assalamu alaikum ${customerName}, আপনার নিয়মিত পণ্য আবার লাগলে ${storeName}-এ অর্ডার করতে পারেন। আমরা সাহায্য করতে প্রস্তুত।`,
};
