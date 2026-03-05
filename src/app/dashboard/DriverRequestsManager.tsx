'use client'

import { useState } from 'react'
import { acceptRequest, rejectRequest } from '@/app/actions/requests'
import { confirmOnboarding, markNoShow } from '@/app/actions/boarding'
import { CheckCircle2, XCircle, Loader2, User, MessageCircle, KeyRound, UserX } from 'lucide-react'
import Link from 'next/link'

type Request = {
    id: string;
    status: string;
    passenger_id: string;
    created_at: string;
    confirmation_code?: string;
    passenger: {
        name: string | null;
        phone: string | null;
        email: string;
    } | null;
}

export default function DriverRequestsManager({ rideId, requests }: { rideId: string, requests: Request[] }) {
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [pinInputs, setPinInputs] = useState<Record<string, string>>({})
    const [showPinInput, setShowPinInput] = useState<Record<string, boolean>>({})

    if (!requests || requests.length === 0) {
        return (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-2">
                Aucune réservation pour ce trajet.
            </p>
        )
    }

    const handleAction = async (requestId: string, action: 'accept' | 'reject') => {
        setProcessingId(requestId)
        try {
            if (action === 'accept') {
                await acceptRequest(requestId, rideId)
            } else {
                await rejectRequest(requestId)
            }
        } catch (error) {
            console.error("Action error:", error)
            alert(error instanceof Error ? error.message : "Erreur")
        } finally {
            setProcessingId(null)
        }
    }

    const handleConfirmBoarding = async (requestId: string) => {
        const pin = pinInputs[requestId]
        if (!pin || pin.length < 4) {
            alert("Veuillez entrer le code PIN à 4 caractères donné par le passager.")
            return
        }

        setProcessingId(requestId)
        try {
            await confirmOnboarding(requestId, pin)
            // Success! The UI will update via revalidatePath
        } catch (error) {
            alert(error instanceof Error ? error.message : "Erreur de validation")
        } finally {
            setProcessingId(null)
        }
    }

    const handleNoShow = async (requestId: string) => {
        if (!window.confirm("Marquer ce passager comme 'Non présent' ?")) return

        setProcessingId(requestId)
        try {
            await markNoShow(requestId)
        } catch (error) {
            alert(error instanceof Error ? error.message : "Erreur")
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Passagers ({requests.filter(r => r.status === 'accepted').length} acceptés)
            </h4>

            {requests.map(req => (
                <div key={req.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/80">

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 flex-shrink-0">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-sm text-slate-900 dark:text-white">
                                {req.passenger?.name || req.passenger?.email?.split('@')[0]}
                            </p>

                            {/* Phone only visible if accepted to protect privacy */}
                            {req.status === 'accepted' ? (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                    {req.passenger?.phone || 'Pas de numéro'}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="w-full sm:w-auto mt-2 sm:mt-0">
                        {req.status === 'pending' && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleAction(req.id, 'accept')}
                                    disabled={processingId !== null}
                                    className="flex-1 sm:flex-none inline-flex justify-center items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
                                >
                                    {processingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                    Confirmer la réservation
                                </button>
                                <button
                                    onClick={() => handleAction(req.id, 'reject')}
                                    disabled={processingId !== null}
                                    className="flex-1 sm:flex-none inline-flex justify-center items-center gap-1.5 rounded-md bg-white dark:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
                                >
                                    {processingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                    Refuser
                                </button>
                            </div>
                        )}

                        {req.status === 'accepted' && (
                            <div className="flex flex-col gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-2 border-t border-slate-100 dark:border-slate-700/50 sm:border-none sm:pt-0">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 justify-center">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Réservation Confirmée
                                    </span>
                                    <Link
                                        href={`/messages/${rideId}`}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30 justify-center hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5" /> Message
                                    </Link>
                                </div>

                                {!showPinInput[req.id] ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowPinInput(prev => ({ ...prev, [req.id]: true }))}
                                            className="flex-1 sm:flex-none inline-flex justify-center items-center gap-1.5 rounded-md bg-slate-900 dark:bg-white px-3 py-1.5 text-[10px] font-black text-white dark:text-black shadow-sm hover:opacity-90 uppercase tracking-tighter"
                                        >
                                            <KeyRound className="w-3 h-3" /> Saisir le code PIN
                                        </button>
                                        <button
                                            onClick={() => handleNoShow(req.id)}
                                            disabled={processingId !== null}
                                            className="p-1.5 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                            title="Pas venu"
                                        >
                                            <UserX className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="PIN"
                                            maxLength={4}
                                            value={pinInputs[req.id] || ''}
                                            onChange={(e) => setPinInputs(prev => ({ ...prev, [req.id]: e.target.value.toUpperCase() }))}
                                            className="w-16 h-8 text-center font-mono font-bold text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-brand-purple"
                                        />
                                        <button
                                            onClick={() => handleConfirmBoarding(req.id)}
                                            disabled={processingId !== null}
                                            className="inline-flex justify-center items-center gap-1.5 rounded-md bg-brand-purple px-3 py-1.5 text-[10px] font-black text-white shadow-sm hover:opacity-90 uppercase"
                                        >
                                            {processingId === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'OK'}
                                        </button>
                                        <button
                                            onClick={() => setShowPinInput(prev => ({ ...prev, [req.id]: false }))}
                                            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 px-1"
                                        >
                                            Enlever
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {req.status === 'onboarded' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                🚗 À BORD
                            </span>
                        )}

                        {req.status === 'no_show' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-black text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                <UserX className="w-3.5 h-3.5" /> ABSENT
                            </span>
                        )}


                        {req.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-900/30 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30 w-full justify-center sm:w-auto">
                                <XCircle className="w-3.5 h-3.5" /> Refusé
                            </span>
                        )}
                    </div>

                </div>
            ))}
        </div>
    )
}
