'use client';
import { Mail, MessageCircle, Phone } from 'lucide-react';

const SUPPORT_PHONE = '+880 1819-646514';
const SUPPORT_PHONE_RAW = '8801819646514'; // for tel: and wa.me
const SUPPORT_EMAIL = 'support@andgatetech.net';

interface ContactSupportCardProps {
    accentColor?: string; // tailwind color name e.g. 'red', 'orange', 'yellow', 'blue'
    whatsappMessage?: string; // pre-filled message text sent via WhatsApp
}

export default function ContactSupportCard({ accentColor = 'blue', whatsappMessage }: ContactSupportCardProps) {
    const colorMap: Record<string, { bg: string; border: string; icon: string; call: string; callHover: string; wa: string; waHover: string }> = {
        red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', call: 'bg-red-600', callHover: 'hover:bg-red-700', wa: 'bg-green-600', waHover: 'hover:bg-green-700' },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            icon: 'text-orange-500',
            call: 'bg-orange-600',
            callHover: 'hover:bg-orange-700',
            wa: 'bg-green-600',
            waHover: 'hover:bg-green-700',
        },
        yellow: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            icon: 'text-yellow-600',
            call: 'bg-yellow-500',
            callHover: 'hover:bg-yellow-600',
            wa: 'bg-green-600',
            waHover: 'hover:bg-green-700',
        },
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', call: 'bg-blue-600', callHover: 'hover:bg-blue-700', wa: 'bg-green-600', waHover: 'hover:bg-green-700' },
    };

    const c = colorMap[accentColor] ?? colorMap['blue'];

    return (
        <div className={`mt-5 rounded-xl border-2 ${c.border} ${c.bg} p-4 lg:p-5`}>
            {/* Header */}
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">Need Help? Contact Support</p>

            {/* Big visible phone number */}
            <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm`}>
                    <Phone className={`h-5 w-5 ${c.icon}`} />
                </div>
                <a href={`tel:+${SUPPORT_PHONE_RAW}`} className="text-2xl font-black tracking-tight text-gray-900 hover:underline lg:text-3xl">
                    {SUPPORT_PHONE}
                </a>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
                {/* Call */}
                <a
                    href={`tel:+${SUPPORT_PHONE_RAW}`}
                    className={`inline-flex items-center gap-2 rounded-lg ${c.call} ${c.callHover} px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all`}
                >
                    <Phone className="h-4 w-4" />
                    Call Now
                </a>

                {/* WhatsApp / Message */}
                <a
                    href={`https://wa.me/${SUPPORT_PHONE_RAW}${whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 rounded-lg ${c.wa} ${c.waHover} px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all`}
                >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Message
                </a>

                {/* Email */}
                <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                >
                    <Mail className="h-4 w-4" />
                    {SUPPORT_EMAIL}
                </a>
            </div>
        </div>
    );
}
