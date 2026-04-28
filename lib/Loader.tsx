interface LoaderProps {
    message?: string;
    fullScreen?: boolean;
    className?: string;
}

const Loader = ({ message, fullScreen = true, className = '' }: LoaderProps) => {
    const spinner = (size: 'sm' | 'lg') => {
        const outer = size === 'lg' ? { svg: 'h-16 w-16', vb: '80 80', cx: 40, r: 35 } : { svg: 'h-10 w-10', vb: '50 50', cx: 25, r: 21 };
        const inner = size === 'lg' ? { inset: 'inset-3', svg: 'h-10 w-10', vb: '50 50', cx: 25, r: 20 } : { inset: 'inset-2', svg: 'h-6 w-6', vb: '30 30', cx: 15, r: 11 };
        const icon  = size === 'lg' ? 'h-8 w-8' : 'h-5 w-5';
        const zap   = size === 'lg' ? 'h-4 w-4' : 'h-2.5 w-2.5';

        return (
            <div className={`relative flex ${outer.svg} items-center justify-center`}>
                {/* Track */}
                <svg className={`absolute inset-0 ${outer.svg}`} viewBox={`0 0 ${outer.vb}`}>
                    <circle cx={outer.cx} cy={outer.cx} r={outer.r} fill="none" stroke="#046ca9" strokeWidth="1.5" strokeOpacity="0.15" />
                </svg>
                {/* Outer arc */}
                <svg
                    className={`absolute inset-0 ${outer.svg}`}
                    viewBox={`0 0 ${outer.vb}`}
                    style={{ animation: 'spin 1.8s linear infinite', transformOrigin: 'center' }}
                >
                    <circle cx={outer.cx} cy={outer.cx} r={outer.r} fill="none" stroke="#046ca9" strokeWidth="2.5"
                        strokeLinecap="round" strokeDasharray={`${Math.round(outer.r * 1.4)} ${Math.round(outer.r * 5.05)}`} />
                </svg>
                {/* Inner arc */}
                <svg
                    className={`absolute ${inner.inset} ${inner.svg}`}
                    viewBox={`0 0 ${inner.vb}`}
                    style={{ animation: 'spin 2.8s linear infinite reverse', transformOrigin: 'center' }}
                >
                    <circle cx={inner.cx} cy={inner.cx} r={inner.r} fill="none" stroke="#0586cb" strokeWidth="1.5"
                        strokeLinecap="round" strokeDasharray={`${Math.round(inner.r * 1.2)} ${Math.round(inner.r * 5.05)}`} strokeOpacity="0.7" />
                </svg>
                {/* Brand center */}
                <div className={`relative z-10 flex ${icon} items-center justify-center rounded-xl bg-gradient-to-br from-[#046ca9] to-[#034d79] shadow-lg shadow-[#046ca9]/30`}>
                    <svg className={`${zap} text-white`} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m13 2-10 12h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                </div>
            </div>
        );
    };

    if (fullScreen) {
        return (
            <div className={`flex min-h-screen flex-col items-center justify-center bg-white ${className}`}>
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'radial-gradient(circle, #046ca9 1px, transparent 1px)', backgroundSize: '28px 28px' }}
                />
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#046ca9] to-[#034d79]" />

                <div className="relative flex flex-col items-center gap-5">
                    {spinner('lg')}
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-base font-black tracking-tight text-gray-900">
                            Andgate<span className="text-[#046ca9]">POS</span>
                        </p>
                        {message && <p className="text-xs text-gray-400">{message}</p>}
                        <div className="flex items-center gap-1.5">
                            {[0, 0.2, 0.4].map((d, i) => (
                                <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#046ca9]"
                                    style={{ animation: `bounce-dot 1.2s ease-in-out ${d}s infinite` }} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden bg-[#046ca9]/10">
                    <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#046ca9] to-transparent"
                        style={{ animation: 'shimmer-bar 1.8s ease-in-out infinite' }} />
                </div>

                <style>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    @keyframes bounce-dot {
                        0%, 80%, 100% { transform: translateY(0); opacity: 1; }
                        40% { transform: translateY(-5px); opacity: 0.5; }
                    }
                    @keyframes shimmer-bar {
                        0%   { transform: translateX(-200%); }
                        100% { transform: translateX(500%); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center justify-center gap-3 p-6 ${className}`}>
            {spinner('sm')}
            {message && <p className="text-xs font-medium text-gray-400">{message}</p>}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Loader;
