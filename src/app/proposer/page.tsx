import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProposerClient from './ProposerClient'

export const metadata = {
    title: 'Proposer un trajet | UNIRIDE',
    description: 'Publiez un trajet et partagez vos frais.',
}

export default async function ProposerPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check KYC status
    const { data: profile } = await supabase
        .from('users')
        .select('license_status')
        .eq('id', user.id)
        .single()

    if (profile?.license_status !== 'verified') {
        redirect('/verification')
    }

    return <ProposerClient />
}
