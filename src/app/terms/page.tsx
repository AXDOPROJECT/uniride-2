'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptTerms } from '@/app/actions/user';
import { signout } from '@/app/actions/auth';
import { ShieldCheck, LogOut, CheckCircle, AlertTriangle, FileText } from 'lucide-react';

export default function TermsPage() {
    const [accepted, setAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleAccept = async () => {
        if (!accepted) return;
        setIsSubmitting(true);
        try {
            await acceptTerms();
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue lors de l'acceptation.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-6 sm:p-12">
            <div className="max-w-2xl w-full premium-card p-8 bg-slate-50 dark:bg-zinc-900 border-none shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-brand-lime/10 mb-2">
                        <ShieldCheck className="w-8 h-8 text-brand-lime" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                        Conditions d'utilisation – UNIRIDE
                    </h1>
                </div>

                {/* Content */}
                <div className="space-y-6 text-slate-700 dark:text-zinc-400 font-medium leading-relaxed max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    <div className="space-y-4 bg-white dark:bg-black/40 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800">
                        <p className="font-bold text-slate-900 dark:text-white">
                            UNIRIDE est une plateforme de mise en relation entre conducteurs et passagers. UNIRIDE n’est pas une société de transport.
                        </p>

                        <div className="flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-brand-lime shrink-0" />
                            <p>Chaque utilisateur est responsable de son comportement. Le conducteur est responsable de son véhicule, de son permis et de son assurance.</p>
                        </div>

                        <div className="flex gap-3">
                            <CheckCircle className="w-5 h-5 text-brand-lime shrink-0" />
                            <p>Dès qu’un passager monte dans le véhicule, le trajet se déroule sous l’entière responsabilité du conducteur et du passager. UNIRIDE ne peut être tenu responsable en cas d’accident, litige ou dommage.</p>
                        </div>
                    </div>

                    <div className="space-y-4 px-2">
                        <h2 className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                            <FileText className="w-4 h-4 text-brand-lime" />
                            Données personnelles (RGPD)
                        </h2>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                            <li>Vos données sont utilisées uniquement pour le fonctionnement de la plateforme.</li>
                            <li>Vous pouvez demander leur modification ou suppression à tout moment.</li>
                        </ul>
                    </div>
                </div>

                {/* Acceptance Checkbox */}
                <div className="pt-6 border-t border-slate-200 dark:border-zinc-800">
                    <label className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="w-6 h-6 rounded-lg border-2 border-slate-300 dark:border-zinc-700 peer-checked:bg-brand-lime peer-checked:border-brand-lime transition-all" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 text-black fill-none stroke-current stroke-[4]">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 group-hover:text-brand-lime transition-colors">
                            Je reconnais avoir lu et accepté les conditions d'utilisation.
                        </span>
                    </label>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                        onClick={handleAccept}
                        disabled={!accepted || isSubmitting}
                        className="flex-1 bg-brand-lime text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-lime/10 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isSubmitting ? 'TRAITEMENT...' : 'ACCEPTER ET CONTINUER'}
                    </button>
                    <button
                        onClick={() => signout()}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        REFUSER
                    </button>
                </div>
            </div>

            <p className="mt-8 text-xs font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest text-center">
                UNIRIDE &copy; 2026 • Plateforme Étudiante Sécurisée
            </p>
        </main>
    );
}
