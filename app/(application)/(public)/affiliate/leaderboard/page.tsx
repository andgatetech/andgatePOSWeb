'use client';

import { useGetAffiliateLeaderboardQuery } from '@/store/features/affiliate/affiliateApi';
import { Trophy, Loader2 } from 'lucide-react';

const MEDALS = ['🥇', '🥈', '🥉'];
const TIER_COLORS: Record<string, string> = {
    Bronze:   'bg-amber-700/10 text-amber-700',
    Silver:   'bg-slate-400/10 text-slate-500',
    Gold:     'bg-amber-400/10 text-amber-600',
    Platinum: 'bg-primary/10 text-primary',
};

export default function AffiliateLeaderboardPage() {
    const { data, isLoading } = useGetAffiliateLeaderboardQuery();
    const leaders: any[] = data?.data ?? [];

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="mx-auto max-w-2xl">
                <div className="text-center mb-8">
                    <Trophy className="mx-auto mb-3 h-10 w-10 text-yellow-400" />
                    <h1 className="text-3xl font-bold">সেরা পার্টনার</h1>
                    <p className="text-slate-500 mt-1">সক্রিয় রেফারেলের ভিত্তিতে র‍্যাংকিং</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : leaders.length === 0 ? (
                    <div className="text-center text-slate-400 py-12">
                        <p>এখনো কোনো পার্টনার নেই।</p>
                        <a href="/affiliate" className="mt-4 inline-block text-primary font-semibold hover:underline">প্রথম পার্টনার হন →</a>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Top 3 podium */}
                        {leaders.slice(0, 3).length === 3 && (
                            <div className="flex items-end justify-center gap-3 mb-6">
                                {[leaders[1], leaders[0], leaders[2]].map((m, i) => {
                                    const heights = ['h-28', 'h-36', 'h-24'];
                                    const realRanks = [2, 1, 3];
                                    return (
                                        <div key={m.name} className={`flex flex-col items-center ${heights[i]} justify-end`}>
                                            <div className="text-2xl mb-1">{MEDALS[realRanks[i] - 1]}</div>
                                            <div className="w-20 rounded-t-xl bg-white border border-slate-200 shadow-md p-2 text-center">
                                                <div className="font-bold text-sm truncate">{m.name}</div>
                                                <div className="text-xs text-slate-500">{m.active_customers} কাস্টমার</div>
                                                <div className="text-xs font-bold text-success">৳{Number(m.total_earned).toFixed(0)}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Full list */}
                        {leaders.map((m, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm hover:shadow-md transition">
                                <span className="text-xl w-8 text-center shrink-0">
                                    {i < 3 ? MEDALS[i] : <span className="text-slate-400 font-bold text-sm">{i + 1}</span>}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold truncate">{m.name}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TIER_COLORS[m.tier] ?? 'bg-slate-100 text-slate-500'}`}>
                                            {m.tier}
                                        </span>
                                        <span className="text-xs text-slate-500">{m.active_customers} সক্রিয় কাস্টমার</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="font-bold text-success">৳{Number(m.total_earned).toLocaleString()}</div>
                                    <div className="text-xs text-slate-400">মোট আয়</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-8 text-center">
                    <a href="/affiliate" className="rounded-xl bg-primary text-white font-bold px-8 py-3 hover:opacity-90 transition inline-block">
                        আজই যোগ দিন →
                    </a>
                </div>
            </div>
        </div>
    );
}
