'use server'

import { createClient } from '@/utils/supabase/server'
export async function verifyIdentityAction(formData: FormData) {
    try {
        const idImage = formData.get('idImage') as string
        const selfieImage = formData.get('selfieImage') as string
        const userFullName = formData.get('userFullName') as string

        if (!idImage || !selfieImage || !userFullName) {
            return { success: false, error: "Image ou identité manquante." }
        }

        if (process.env.OPENAI_API_KEY === undefined || process.env.OPENAI_API_KEY === '') {
            return { success: false, error: "Clé API OpenAI manquante côté serveur." }
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: "Utilisateur non authentifié." }
        }

        // Decode base64 images for storage
        const idBuffer = decodeBase64Image(idImage)
        const selfieBuffer = decodeBase64Image(selfieImage)

        // 1. Upload ID Image to Supabase Storage
        const idFileName = `${user.id}/id_${Date.now()}.jpg`
        const { error: idUploadError } = await supabase.storage
            .from('kyc_documents')
            .upload(idFileName, idBuffer, {
                contentType: 'image/jpeg',
                upsert: true
            })

        if (idUploadError) throw idUploadError

        // 2. Upload Selfie Image to Supabase Storage
        const selfieFileName = `${user.id}/selfie_${Date.now()}.jpg`
        const { error: selfieUploadError } = await supabase.storage
            .from('kyc_documents')
            .upload(selfieFileName, selfieBuffer, {
                contentType: 'image/jpeg',
                upsert: true
            })

        if (selfieUploadError) throw selfieUploadError

        // 3. Update User Status to 'pending' (Awaiting manual admin review)
        const { error: updateError } = await supabase
            .from('users')
            .update({
                license_status: 'pending'
            })
            .eq('id', user.id)

        if (updateError) {
            console.error("Erreur de mise à jour Supabase :", updateError)
            // Fallback to Service Role Key (if available in env)
            if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
                const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
                const adminSupabase = createSupabaseClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY
                )
                await adminSupabase.from('users').update({
                    license_status: 'pending'
                }).eq('id', user.id)
            } else {
                throw updateError
            }
        }

        return { success: true }

    } catch (e: any) {
        console.error("KYC Error:", e)
        return { success: false, error: "Erreur lors de l'envoi des documents. Veuillez réessayer." }
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
