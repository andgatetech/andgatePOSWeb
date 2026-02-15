const Loading = () => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-[#0a0e1a] dark:via-[#0d1225] dark:to-[#0f1630]">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />

            <div className="relative flex flex-col items-center gap-8">
                {/* Animated Logo / Icon */}
                <div className="relative">
                    {/* Outer glow ring */}
                    <div className="absolute -inset-4 animate-[spin_8s_linear_infinite] rounded-full opacity-20">
                        <div className="h-full w-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 blur-xl" />
                    </div>

                    {/* Spinning ring */}
                    <div className="relative h-20 w-20">
                        {/* Track */}
                        <svg className="absolute inset-0 h-20 w-20" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
                        </svg>

                        {/* Animated arc */}
                        <svg className="absolute inset-0 h-20 w-20 animate-[spin_1.2s_cubic-bezier(0.5,0,0.5,1)_infinite]" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="34" fill="none" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="80 134" className="stroke-blue-600 dark:stroke-blue-400" />
                        </svg>

                        {/* Second animated arc (counter direction) */}
                        <svg className="absolute inset-0 h-20 w-20 animate-[spin_2s_cubic-bezier(0.5,0,0.5,1)_infinite_reverse]" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="26" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="50 114" className="stroke-indigo-500/60 dark:stroke-indigo-400/50" />
                        </svg>

                        {/* Center icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Text and progress */}
                <div className="flex flex-col items-center gap-3">
                    <h2 className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-lg font-semibold tracking-wide text-transparent dark:from-gray-100 dark:via-gray-200 dark:to-gray-100">
                        Loading
                    </h2>

                    {/* Animated dots bar */}
                    <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 animate-[bounce_1.4s_ease-in-out_0s_infinite] rounded-full bg-blue-600 dark:bg-blue-400" />
                        <span className="h-1.5 w-1.5 animate-[bounce_1.4s_ease-in-out_0.2s_infinite] rounded-full bg-indigo-500 dark:bg-indigo-400" />
                        <span className="h-1.5 w-1.5 animate-[bounce_1.4s_ease-in-out_0.4s_infinite] rounded-full bg-purple-500 dark:bg-purple-400" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loading;
