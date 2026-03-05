import { Star } from 'lucide-react'
import Image from 'next/image'

type AvisCardProps = {
    name: string;
    avatar?: string;
    comment: string;
    rating: number;
}

export default function AvisCard({ name, avatar, comment, rating }: AvisCardProps) {
    return (
        <div className="min-w-[280px] bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-brand-purple-soft dark:bg-brand-purple/20 flex items-center justify-center overflow-hidden">
                    {avatar ? (
                        <span className="text-xl">🧑‍🎓</span>
                    ) : (
                        <span className="text-xl">{name.charAt(0)}</span>
                    )}
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{name}</h4>
                    <div className="flex items-center gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-3 h-3 ${i < rating ? 'fill-brand-purple text-brand-purple' : 'text-slate-300 dark:text-zinc-700'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-zinc-400 italic leading-snug">
                "{comment}"
            </p>
        </div>
    )
}
