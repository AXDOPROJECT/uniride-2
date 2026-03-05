'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        // You could redirect back to login?error=Something or return state
        redirect('/login?error=L\'adresse%20e-mail%20ou%20le%20mot%20de%20passe%20ne%20sont%20pas%20valides')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        name: formData.get('name') as string,
        role: formData.get('role') as string,
    }

    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                name: data.name,
                role: data.role,
            }
        }
    })

    if (error) {
        if (error.code === 'over_email_send_rate_limit') {
            redirect('/signup?error=Limite%20d\'envoi d\'e-mails%20atteinte.%20Veuillez%20désactiver%20la%20confirmation%20par%20e-mail%20dans%20votre%20Dashboard%20Supabase.')
        }
        // Include the actual error message to help the user debug (e.g., SMTP verification errors)
        const errorMessage = encodeURIComponent(error.message)
        redirect(`/signup?error=${errorMessage}`)
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}
