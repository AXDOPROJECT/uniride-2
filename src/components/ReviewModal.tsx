'use client'

import { useState } from 'react'
import { Star, X, Loader2 } from 'lucide-react'
import { submitReview } from '@/app/actions/reviews'

type ReviewModalProps = {
    rideId: string;
    revieweeId: string;
    revieweeName: string;
    triggerElement: React.ReactNode;
}

export default function ReviewModal({ rideId, revieweeId, revieweeName, triggerElement }: ReviewModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [rating, setRating] = useState<number>(0)
    const [hoveredRating, setHoveredRating] = useState<number>(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) {
            alert("Veuillez sélectionner une note (1 à 5 étoiles)")
            return
        }

        setIsSubmitting(true)
        try {
            await submitReview(rideId, revieweeId, rating, comment)
            setSuccess(true)
            setTimeout(() => setIsOpen(false), 2000)
        } catch (error) {
            console.error(error)
            alert(error instanceof Error ? error.message : "Erreur")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Quick close reset
    const handleClose = () => {
        setIsOpen(false)
        setTimeout(() => {
            if (!success) {
                setRating(0)
                setComment('')
            }
        }, 300)
    }

    return (
        <>
            <div onClick={() => setIsOpen(true)}>
                {triggerElement}
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

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Évaluer le trajet</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Utilisateur : <span className="font-semibold text-slate-700 dark:text-slate-200">{revieweeName}</span>
                        </p>

                        {success ? (
                            <div className="text-center py-6 animate-in slide-in-from-bottom-2">
                                <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
                                    <Star className="w-6 h-6 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                                </div>
                                <p className="font-semibold text-emerald-700 dark:text-emerald-400">Avis publié avec succès !</p>
                                <p className="text-sm text-emerald-600/80 dark:text-emerald-500 mt-1">Merci pour votre retour.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Star Interactive Rating */}
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            className="p-1 focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-10 h-10 transition-colors ${star <= (hoveredRating || rating)
                                                    ? 'text-amber-400 fill-amber-400'
                                                    : 'text-slate-200 dark:text-slate-700'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Commentaire <span className="text-slate-400 font-normal">(Optionnel)</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Comment s'est passé le trajet ?"
                                        className="block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || rating === 0}
                                    className="w-full flex justify-center items-center gap-2 rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publier l'avis"}
                                </button>
                            </form>
                        )}

                    </div>
                </div>
            )}
        </>
    )
}
