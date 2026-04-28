const Loading = () => {
    return (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white">
            {/* Dot grid background */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.035]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #046ca9 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            {/* Top brand accent */}
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#046ca9] to-[#034d79]" />

            {/* Rings + logo */}
            <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
                {/* Ambient glow */}
                <div
                    className="absolute inset-0 rounded-full bg-[#046ca9]/8"
                    style={{ animation: 'pulse-glow 2.4s ease-in-out infinite' }}
                />

                {/* Outer ring track */}
                <svg className="absolute inset-0 h-28 w-28" viewBox="0 0 112 112">
                    <circle cx="56" cy="56" r="50" fill="none" stroke="#046ca9" strokeWidth="1.5" strokeOpacity="0.12" />
                </svg>

                {/* Outer spinning arc */}
                <svg
                    className="absolute inset-0 h-28 w-28"
                    viewBox="0 0 112 112"
                    style={{ animation: 'spin 2s linear infinite', transformOrigin: 'center' }}
                >
                    <circle
                        cx="56" cy="56" r="50"
                        fill="none" stroke="#046ca9" strokeWidth="3.5"
                        strokeLinecap="round" strokeDasharray="82 232"
                    />
                </svg>

                {/* Inner ring track */}
                <svg className="absolute inset-4 h-20 w-20" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#035887" strokeWidth="1" strokeOpacity="0.12" />
                </svg>

                {/* Inner spinning arc (reverse) */}
                <svg
                    className="absolute inset-4 h-20 w-20"
                    viewBox="0 0 80 80"
                    style={{ animation: 'spin 3s linear infinite reverse', transformOrigin: 'center' }}
                >
                    <circle
                        cx="40" cy="40" r="34"
                        fill="none" stroke="#0586cb" strokeWidth="2.5"
                        strokeLinecap="round" strokeDasharray="46 168"
                        strokeOpacity="0.7"
                    />
                </svg>

                {/* Center brand icon */}
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#046ca9] to-[#034d79] shadow-xl shadow-[#046ca9]/30">
                    {/* Zap / lightning bolt — same icon used in navbar */}
                    <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m13 2-10 12h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                </div>
            </div>

            {/* Brand name */}
            <p className="mb-4 text-xl font-black tracking-tight text-gray-900">
                Andgate<span className="text-[#046ca9]">POS</span>
            </p>

            {/* Bouncing dots */}
            <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#046ca9]" style={{ animation: 'bounce-dot 1.2s ease-in-out 0s infinite' }} />
                <span className="h-2 w-2 rounded-full bg-[#035887]" style={{ animation: 'bounce-dot 1.2s ease-in-out 0.2s infinite' }} />
                <span className="h-2 w-2 rounded-full bg-[#046ca9]/40" style={{ animation: 'bounce-dot 1.2s ease-in-out 0.4s infinite' }} />
            </div>

            {/* Bottom shimmer bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden bg-[#046ca9]/10">
                <div
                    className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#046ca9] to-transparent"
                    style={{ animation: 'shimmer-bar 1.8s ease-in-out infinite' }}
                />
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50%       { opacity: 0.8; transform: scale(1.08); }
                }
                @keyframes bounce-dot {
                    0%, 80%, 100% { transform: translateY(0);    opacity: 1; }
                    40%           { transform: translateY(-6px); opacity: 0.6; }
                }
                @keyframes shimmer-bar {
                    0%   { transform: translateX(-200%); }
                    100% { transform: translateX(500%); }
                }
            `}</style>
        </div>
    );
};

export default Loading;
