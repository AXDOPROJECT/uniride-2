'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        throw new Error("Non autorisé.")
    }

    const phone = formData.get('phone') as string
    const name = formData.get('name') as string

    const { error } = await supabase
        .from('users')
        .update({
            phone: phone || null,
            name: name || null
        })
        .eq('id', user.id)

    if (error) {
        console.error("Profile update error:", error)
        throw new Error("Erreur lors de la mise à jour du profil.")
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function acceptTerms() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Non autorisé.")
    }

    const now = new Date().toISOString()

    // 1. Record in terms_acceptances for audit trail
    const { error: auditError } = await supabase
        .from('terms_acceptances')
        .insert({
            user_id: user.id,
            accepted_at: now,
            terms_version: '1.0'
        })

    if (auditError) {
        console.error("Terms audit error:", auditError)
        throw new Error("Erreur lors de l'enregistrement de l'acceptation.")
    }

    // 2. Update users table flag
    const { error: userError } = await supabase
        .from('users')
        .update({
            has_accepted_terms: true,
            terms_accepted_at: now
        })
        .eq('id', user.id)

    if (userError) {
        console.error("Terms user flag error:", userError)
        throw new Error("Erreur lors de la mise à jour du statut utilisateur.")
    }

    // 3. Update Auth Metadata for fast middleware checks
    const { error: authError } = await supabase.auth.updateUser({
        data: { has_accepted_terms: true }
    })

    if (authError) {
        console.error("Terms auth metadata error:", authError)
        // We don't throw here because the DB is already updated, but it might delay the middleware recognition
    }

    revalidatePath('/')
    revalidatePath('/dashboard')
    return { success: true }
}
