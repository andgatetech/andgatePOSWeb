'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function WhatsAppButton() {
    const pathname = usePathname();
    const [isScrollingUp, setIsScrollingUp] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < lastScrollY) {
                setIsScrollingUp(true);
            } else {
                setIsScrollingUp(false);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

    const toggleChat = () => {
        setIsChatOpen(!isChatOpen);
    };

    const handleSendMessage = () => {
        if (message.trim()) {
            const phoneNumber = '++8801838680434'; // Replace with your phone number
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
            setMessage('');
            setIsChatOpen(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const quickMessages = ["Hello! I'd like to know more about your services.", 'Can you help me with a question?', "I'm interested in your products.", 'What are your business hours?'];

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Box */}
            {isChatOpen && (
                <div className="animate-in slide-in-from-bottom-2 mb-4 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl duration-300">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between bg-green-500 p-4 text-white">
                        <div className="flex items-center">
                            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold">Chat with us</h3>
                                <p className="text-xs opacity-90">We typically reply instantly</p>
                            </div>
                        </div>
                        <button onClick={toggleChat} className="text-white transition-colors hover:text-gray-200">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Chat Body */}
                    <div className="max-h-80 overflow-y-auto p-4">
                        {/* Welcome Message */}
                        <div className="mb-4">
                            <div className="rounded-lg bg-gray-100 p-3 text-sm">
                                <p className="text-gray-800">👋 Hello! How can we help you today?</p>
                            </div>
                        </div>

                        {/* Quick Messages */}
                        <div className="mb-4 space-y-2">
                            <p className="text-xs font-medium text-gray-600">Quick messages:</p>
                            {quickMessages.map((quickMsg, index) => (
                                <button
                                    key={index}
                                    onClick={() => setMessage(quickMsg)}
                                    className="block w-full rounded-md border border-gray-200 bg-gray-50 p-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100"
                                >
                                    {quickMsg}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Input */}
                    <div className="border-t border-gray-200 p-4">
                        <div className="flex space-x-2">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                                rows="1"
                                style={{ minHeight: '38px' }}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!message.trim()}
                                className="flex items-center justify-center rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22,2 15,22 11,13 2,9"></polygon>
                                </svg>
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Press Enter to send, Shift+Enter for new line</p>
                    </div>
                </div>
            )}

            {/* WhatsApp Button */}
            <div className={`transition-all duration-300 ${isScrollingUp ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-70'}`}>
                <button
                    onClick={toggleChat}
                    className="group relative flex items-center justify-center rounded-full bg-green-500 p-4 text-white shadow-lg transition-all duration-200 hover:bg-green-600 hover:shadow-xl"
                    aria-label="Open WhatsApp chat"
                >
                    {/* Notification Badge */}
                    {!isChatOpen && <div className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-red-500"></div>}

                    {/* WhatsApp Icon */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="transition-transform group-hover:scale-110">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.89 3.488" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
