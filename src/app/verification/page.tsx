import VerificationClient from "./VerificationClient";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
    title: 'Vérification d\'Identité | UNIRIDE',
    description: 'Vérifiez votre permis de conduire pour proposer des trajets.',
}

export default async function VerificationPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user is already verified
    const { data: profile } = await supabase
        .from('users')
        .select('license_status, first_name, last_name')
        .eq('id', user.id)
        .single()

    if (profile?.license_status === 'verified') {
        redirect('/proposer')
    }

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col pt-16 pb-24">
            <div className="flex-1 w-full max-w-md mx-auto p-4 flex flex-col">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Vérification de sécurité</h1>
                    <p className="text-gray-600 text-sm">
                        {profile?.license_status === 'pending'
                            ? "Vos documents sont en cours d'analyse manuelle."
                            : "Sécurisez la communauté. Préparez votre permis de conduire."}
                    </p>
                </div>

                {profile?.license_status === 'pending' ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">En attente de validation</h2>
                        <p className="text-sm font-medium text-gray-600">
                            Vos documents ont bien été reçus !
                            <br /><br />Notre équipe va les vérifier manuellement pour assurer la sécurité de tous. Cela peut prendre quelques heures.
                        </p>
                        <a href="/" className="mt-6 w-full py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-colors">
                            Retour à l'accueil
                        </a>
                    </div>
                ) : (
                    <VerificationClient userFullName={`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()} />
                )}
            </div>
        </main>
    )
}
