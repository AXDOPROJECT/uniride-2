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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-xl relative animate-in zoom-in-95 duration-200">

                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Signaler l'utilisateur</h3>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            Vous signalez actuellement <span className="font-semibold text-slate-700 dark:text-slate-200">{reportedUserName}</span>. Ce signalement sera transmis à nos administrateurs.
                        </p>

                        {success ? (
                            <div className="text-center py-6 animate-in slide-in-from-bottom-2">
                                <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
                                    <Flag className="w-6 h-6 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400" />
                                </div>
                                <p className="font-semibold text-red-700 dark:text-red-400">Signalement envoyé</p>
                                <p className="text-sm text-red-600/80 dark:text-red-500 mt-1">Notre équipe va examiner la situation dans les plus brefs délais.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Motif du signalement *
                                    </label>
                                    <select
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                        className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700"
                                    >
                                        <option value="" disabled>Sélectionnez un motif...</option>
                                        {REPORT_REASONS.map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Plus de détails *
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        placeholder="Décrivez la situation en détail..."
                                        className="block w-full rounded-md border-0 py-2.5 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !reason || !description.trim()}
                                    className="w-full flex justify-center items-center gap-2 rounded-md bg-red-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer le signalement"}
                                </button>

                                <p className="text-xs text-center text-slate-400 mt-4">
                                    En cas d'urgence immédiate sur le campus, contactez le 112 ou la sécurité.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
