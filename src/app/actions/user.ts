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
