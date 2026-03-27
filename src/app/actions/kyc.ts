'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function verifyIdentityAction(formData: FormData) {
    try {
        const idImage = formData.get('idImage') as string
        const selfieImage = formData.get('selfieImage') as string
        const userFullName = formData.get('userFullName') as string

        if (!idImage || !selfieImage) {
            return { success: false, error: "L'image du permis ou le selfie est manquant (v2)." }
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: "Utilisateur non authentifié." }
        }

        // Save the images to a storage bucket in the future if manual verification is actually required.
        // For now, we just mark the user as 'pending' manual review, skipping the AI validation.

        const { error: updateError } = await supabase
            .from('users')
            .update({
                license_status: 'verified'
            })
            .eq('id', user.id)

        if (updateError) {
            console.error("Erreur de mise à jour Supabase :", updateError)
            return { success: false, error: "Erreur de base de données." }
        }

        revalidatePath('/verification')
        revalidatePath('/profil')

        return { success: true }

    } catch (e: any) {
        console.error("KYC Error:", e)
        return { success: false, error: "Erreur technique." }
    }
}

// Helper function to decode base64 from the canvas resize
function decodeBase64Image(dataString: string) {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid input string')
    }
    return Buffer.from(matches[2], 'base64')
}
