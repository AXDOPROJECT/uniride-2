'use client'

import { useState } from 'react'
import { Flag, X, Loader2, AlertTriangle } from 'lucide-react'
import { reportUser } from '@/app/actions/alerts'

type ReportModalProps = {
    reportedUserId: string;
    reportedUserName: string;
    rideId?: string;
    triggerElement?: React.ReactNode;
}

const REPORT_REASONS = [
    "Comportement inapproprié",
    "Faux profil / Arnaque",
    "Conduite dangereuse",
    "Annulation abusive au dernier moment",
    "Autre"
]

export default function ReportModal({ reportedUserId, reportedUserName, rideId, triggerElement }: ReportModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [reason, setReason] = useState<string>('')
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reason) {
            alert("Veuillez sélectionner un motif.")
            return
        }

        setIsSubmitting(true)
        try {
            await reportUser(reportedUserId, reason, description, rideId)
            setSuccess(true)
            setTimeout(() => setIsOpen(false), 2500)
        } catch (error) {
            console.error(error)
            alert(error instanceof Error ? error.message : "Erreur lors du signalement")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setIsOpen(false)
        setTimeout(() => {
            if (!success) {
                setReason('')
                setDescription('')
            }
        }, 300)
    }

    return (
        <>
            <div onClick={() => setIsOpen(true)} className="inline-block">
                {triggerElement || (
                    <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors">
                        <Flag className="w-3.5 h-3.5" />
                        Signaler
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300 border-none">

                        <button
                            onClick={handleClose}
                            className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-900/20">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Signaler</h3>
                        </div>

                        <p className="text-sm font-bold text-slate-500 dark:text-zinc-500 mb-8 leading-relaxed">
                            Vous signalez actuellement <span className="text-slate-900 dark:text-white">{reportedUserName}</span>. Ce signalement sera transmis à nos administrateurs.
                        </p>

                        {success ? (
                            <div className="text-center py-10 animate-in slide-in-from-bottom-4">
                                <div className="mx-auto w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center mb-4">
                                    <Flag className="w-8 h-8 text-emerald-600 fill-emerald-600" />
                                </div>
                                <p className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase">MERCI</p>
                                <p className="text-sm font-bold text-slate-500">Signalement envoyé. Notre équipe va examiner la situation.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                        Motif du signalement *
                                    </label>
                                    <select
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                        className="block w-full rounded-2xl border-none bg-slate-50 dark:bg-zinc-800/50 py-4 px-5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-purple transition-all sm:text-sm appearance-none"
                                    >
                                        <option value="" disabled>Sélectionnez un motif...</option>
                                        {REPORT_REASONS.map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                        Détails *
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        placeholder="Décrivez la situation en détail..."
                                        className="block w-full rounded-2xl border-none bg-slate-50 dark:bg-zinc-800/50 py-4 px-5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-brand-purple transition-all sm:text-sm placeholder:text-slate-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !reason || !description.trim()}
                                    className="w-full flex justify-center items-center gap-2 rounded-3xl bg-red-600 py-5 text-lg font-black text-white shadow-xl shadow-red-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "ENVOYER"}
                                </button>

                                <p className="text-[10px] font-black text-center text-slate-400 uppercase tracking-tight mt-4">
                                    En cas d'urgence sur le campus, contactez le 112.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
