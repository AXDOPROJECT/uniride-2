'use client'

import { useState, useRef } from 'react'
import { Camera, CheckCircle, ShieldAlert, FileText, User as UserIcon, Loader2, RefreshCw } from 'lucide-react'
import { verifyIdentityAction } from '@/app/actions/kyc'
import { useRouter } from 'next/navigation'

export default function VerificationClient({ userFullName }: { userFullName: string }) {
    const router = useRouter()

    const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
    const [idImage, setIdImage] = useState<string | null>(null)
    const [selfieImage, setSelfieImage] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const selfieInputRef = useRef<HTMLInputElement>(null)

    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    // EXTREME COMPRESSION TO BYPASS VERCEL 4.5MB LIMIT
                    const MAX_WIDTH = 600; 
                    const scaleSize = Math.min(MAX_WIDTH / img.width, 1);
                    canvas.width = img.width * scaleSize;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    }
                    resolve(canvas.toDataURL('image/jpeg', 0.6));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }

    const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>, isSelfie: boolean) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const compressedBase64 = await resizeImage(file)
            if (isSelfie) {
                setSelfieImage(compressedBase64)
                setStep(3)
                // Submit immediately avoiding React state lag
                await autoSubmitVerification(compressedBase64)
            } else {
                setIdImage(compressedBase64)
                setStep(2)
            }
        } catch (err) {
            console.error(err)
            setError("Erreur lors de la lecture de l'image. Veuillez réessayer.")
        }
    }

    const autoSubmitVerification = async (newSelfieBase64: string) => {
        if (!idImage) return

        setIsAnalyzing(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('idImage', idImage)
            formData.append('selfieImage', newSelfieBase64)
            formData.append('userFullName', userFullName)

            const result = await verifyIdentityAction(formData)

            if (result.success) {
                // Force Next.js to re-fetch Server Components (including profile.license_status)
                router.refresh()
                // Show local success state immediately
                setSuccess(true)
                setStep(4)
                
                // Redirect to /verification so the server re-renders and shows the pending screen
                setTimeout(() => {
                    router.push('/verification')
                }, 2500)
            } else {
                console.error("KYC Action Failed:", result.error)
                setError(result.error || "Échec de l'envoi (Erreur Serveur).")
                setStep(1) // Reset to start
                setIdImage(null)
                setSelfieImage(null)
            }
        } catch (err: any) {
            console.error("KYC HTTP/Network Error:", err)
            // Show explicit error on screen to prevent silent failures
            setError(err?.message || "Erreur de connexion (Image trop lourde ou réseau faible).")
            setStep(1)
            setIdImage(null)
            setSelfieImage(null)
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="premium-card p-8 flex flex-col items-center max-w-md w-full mx-auto relative overflow-hidden">

            {/* INSTRUCTIONS */}
            {step === 1 && (
                <div className="w-full text-center space-y-6">
                    <div className="bg-brand-purple/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-purple/20">
                        <FileText className="w-10 h-10 text-brand-purple" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">1. Photo de votre Permis</h2>
                    <p className="text-slate-500 font-medium text-sm">
                        Prenez une photo claire et lisible du recto de votre permis de conduire. Évitez les reflets.
                    </p>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium flex gap-2 text-left">
                            <ShieldAlert className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={(e) => handlePhotoCapture(e, false)}
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full premium-btn py-4 gap-3 text-lg"
                    >
                        <Camera className="w-6 h-6" />
                        Ouvrir l'appareil photo
                    </button>
                </div>
            )}

            {/* SELFIE STEP */}
            {step === 2 && (
                <div className="w-full text-center space-y-6">
                    <div className="bg-brand-indigo/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-indigo/20">
                        <UserIcon className="w-10 h-10 text-brand-indigo dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">2. Selfie (Face ID)</h2>
                    <p className="text-slate-500 font-medium text-sm">
                        Prenez un selfie en temps réel pour confirmer que vous êtes bien la personne sur le permis.
                    </p>

                    {idImage && (
                        <div className="text-sm font-medium text-green-600 mb-2">✅ Permis enregistré</div>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        ref={selfieInputRef}
                        onChange={(e) => handlePhotoCapture(e, true)}
                    />

                    <button
                        onClick={() => selfieInputRef.current?.click()}
                        className="w-full premium-btn bg-slate-900 dark:bg-zinc-800 hover:shadow-slate-900/30 dark:hover:shadow-zinc-800/50 py-4 gap-3 text-lg"
                    >
                        <Camera className="w-6 h-6" />
                        Prendre un Selfie
                    </button>

                    <button
                        onClick={() => { setStep(1); setIdImage(null); }}
                        className="text-slate-400 hover:text-brand-purple text-sm font-bold transition-colors"
                    >
                        Recommencer la première étape
                    </button>
                </div>
            )}

            {/* ANALYSIS REVIEW */}
            {step === 3 && (
                <div className="w-full text-center space-y-6">
                    <h2 className="text-2xl font-black text-brand-purple animate-pulse">Envoi sécurisé</h2>
                    <p className="text-slate-500 font-medium text-sm pb-4">
                        Ne fermez pas cette page. Transmission de vos documents en cours...
                    </p>

                    <div className="flex justify-center items-center gap-4 py-8">
                        <Loader2 className="w-16 h-16 text-brand-purple animate-spin drop-shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                    </div>
                </div>
            )}

            {/* SUCCESS */}
            {step === 4 && success && (
                <div className="w-full text-center space-y-6">
                    <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100 dark:border-green-900/50">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Identité Transmise !</h2>
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Vos documents ont été envoyés avec succès. Notre équipe va les valider manuellement.
                    </p>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 animate-pulse">Redirection vers l'accueil...</p>
                    <button 
                        onClick={() => router.push('/verification')}
                        className="mt-4 w-full premium-btn bg-slate-900 dark:bg-zinc-800 hover:shadow-slate-900/30 dark:hover:shadow-zinc-800/50 py-4 text-base"
                    >
                        Voir mon statut de vérification
                    </button>
                </div>
            )}
        </div>
    )
}
