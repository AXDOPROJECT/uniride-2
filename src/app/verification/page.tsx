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
                        Sécurisez la communauté. Préparez votre permis de conduire.
                    </p>
                </div>

                <VerificationClient userFullName={`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()} />
            </div>
        </main>
    )
}
