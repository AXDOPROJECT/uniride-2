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
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
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
            } else {
                setIdImage(compressedBase64)
                setStep(2)
            }
        } catch (err) {
            console.error(err)
            setError("Erreur lors de la lecture de l'image. Veuillez réessayer.")
        }
    }

    const submitVerification = async () => {
        if (!idImage || !selfieImage) return

        setIsAnalyzing(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('idImage', idImage)
            formData.append('selfieImage', selfieImage)
            formData.append('userFullName', userFullName)

            const result = await verifyIdentityAction(formData)

            if (result.success) {
                setSuccess(true)
                setStep(4)
                setTimeout(() => {
                    router.push('/proposer')
                }, 3000)
            } else {
                setError(result.error || "Échec de la vérification. Veuillez réessayer.")
                setStep(1) // Reset to start
                setIdImage(null)
                setSelfieImage(null)
            }
        } catch (err) {
            console.error(err)
            setError("Une erreur inattendue est survenue.")
            setStep(1)
            setIdImage(null)
            setSelfieImage(null)
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">

            {/* INSTRUCTIONS */}
            {step === 1 && (
                <div className="w-full text-center space-y-6">
                    <div className="bg-[#ccff00]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-[#a3cc00]" />
                    </div>
                    <h2 className="text-xl font-semibold">1. Photo de votre Permis</h2>
                    <p className="text-gray-600 text-sm">
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
                        className="w-full py-4 px-4 bg-[#ccff00] hover:bg-[#b3e600] text-black font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <Camera className="w-5 h-5" />
                        Ouvrir l'appareil photo
                    </button>
                </div>
            )}

            {/* SELFIE STEP */}
            {step === 2 && (
                <div className="w-full text-center space-y-6">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserIcon className="w-8 h-8 text-blue-500" />
                    </div>
                    <h2 className="text-xl font-semibold">2. Selfie (Face ID)</h2>
                    <p className="text-gray-600 text-sm">
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
                        className="w-full py-4 px-4 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <Camera className="w-5 h-5" />
                        Prendre un Selfie
                    </button>

                    <button
                        onClick={() => { setStep(1); setIdImage(null); }}
                        className="text-gray-500 text-sm font-medium underline"
                    >
                        Recommencer la première étape
                    </button>
                </div>
            )}

            {/* ANALYSIS REVIEW */}
            {step === 3 && (
                <div className="w-full text-center space-y-6">
                    <h2 className="text-xl font-semibold">Analyse IA en cours</h2>
                    <p className="text-gray-600 text-sm pb-4">
                        Ne fermez pas cette page. Nous comparons votre identité...
                    </p>

                    <div className="flex justify-center items-center gap-4 py-8">
                        {isAnalyzing ? (
                            <Loader2 className="w-12 h-12 text-[#ccff00] animate-spin" />
                        ) : (
                            <button
                                onClick={submitVerification}
                                className="w-full py-4 px-4 bg-[#ccff00] hover:bg-[#b3e600] text-black font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Lancer l'analyse sécurisée
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* SUCCESS */}
            {step === 4 && success && (
                <div className="w-full text-center space-y-6 animate-pulse">
                    <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Identité Vérifiée !</h2>
                    <p className="text-green-600 font-medium">
                        Votre permis est valide. Vous pouvez maintenant publier des trajets. Redirection en cours...
                    </p>
                </div>
            )}
        </div>
    )
}
