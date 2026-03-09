'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/user'
import { Loader2, Save, User, Phone, ShieldCheck, Star } from 'lucide-react'

type ProfileProps = {
    initialName: string | null;
    initialPhone: string | null;
    isVerified: boolean | null;
    rating: number | null;
}

export default function ProfileForm({ initialName, initialPhone, isVerified, rating }: ProfileProps) {
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSaving(true)
        setMessage(null)

        const formData = new FormData(e.currentTarget)

        try {
            await updateProfile(formData)
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' })
            setTimeout(() => setMessage(null), 3000)
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : "Erreur de sauvegarde." })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Paramètres du profil</h2>
                <div className="flex flex-wrap items-center gap-2">
                    {rating !== null && (
                        <div className="flex items-center gap-1.5 text-sm font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/50">
                            <Star className="w-4 h-4 fill-amber-500" />
                            <span>{rating.toFixed(1)} / 5.0</span>
                        </div>
                    )}
                    {isVerified && (
                        <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Permis vérifié</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                        Nom complet
                    </label>
                    <div className="relative mt-2">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <User className="h-5 w-5 text-slate-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            defaultValue={initialName || ''}
                            placeholder="Jean Dupont"
                            className="block w-full rounded-md border-0 py-2 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-200">
                        Numéro de téléphone <span className="text-xs text-slate-500 font-normal">(Optionnel, pour faciliter les contacts)</span>
                    </label>
                    <div className="relative mt-2">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Phone className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        </div>
                        <input
                            type="tel"
                            name="phone"
                            id="phone"
                            defaultValue={initialPhone || ''}
                            placeholder="06 12 34 56 78"
                            className="block w-full rounded-md border-0 py-2 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700"
                        />
                    </div>
                </div>
            </div>

            {message && (
                <div className={`mt-6 p-3 rounded-md text-sm font-medium text-center ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div className="mt-6 flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex justify-center items-center gap-2 rounded-md bg-slate-900 dark:bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 dark:hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-70"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Enregistrer les modifications
                </button>
            </div>
        </form>
    )
}
