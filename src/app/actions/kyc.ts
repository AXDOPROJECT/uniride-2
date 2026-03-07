'use server'

import { createClient } from '@/utils/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'MISSING_KEY'
})

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

        // Call GPT-4o Vision
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Tu es un expert anti-fraude KYC (Know Your Customer). Tu reçois deux images: la 1ère est un permis de conduire, la 2ème est un selfie en direct. Ta mission STRICTE est d'analyser ces images pour vérifier l'identité. Tu dois répondre UNIQUEMENT en format JSON."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Vérifie strictement ces points:
1. La première image est un permis de conduire valide officiel français ou européen.
2. Le document n'est pas expiré (cherche la date de validité 4b).
3. Le nom et prénom sur le permis correspondent (même partiellement ou phonétiquement) à l'utilisateur ciblé : "${userFullName}".
4. Le visage sur le selfie (2ème image) correspond au visage imprimé sur le permis (1ère image). Ce point est critique pour éviter l'usurpation.

RÉPONDRE UNIQUEMENT EN JSON STRICT. Structure demandée:
{
  "isValid": boolean,
  "reason": "Une phrase en français expliquant le résultat. Si isValid est false, sois très précis sur ce qui a échoué (ex: Date expirée, Visage différent, Nom différent)."
}`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: idImage // Contains "data:image/jpeg;base64,..."
                            }
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: selfieImage
                            }
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 300
        });

        const replyRaw = response.choices[0].message.content
        if (!replyRaw) throw new Error("Réponse vide de GPT")

        const result = JSON.parse(replyRaw)

        if (result.isValid === true) {
            // VERIFICATION SUCCESSFUL. Update user profile.
            // Notice: to bypass RLS, we should technically use the Service Role Key
            // BUT, users can often update their own `license_status` if there's no policy blocking it.
            // Let's use the standard client first. If it fails, we fall back to Service Role.

            const { error: updateError } = await supabase
                .from('users')
                .update({
                    license_status: 'verified',
                    license_verified_at: new Date().toISOString()
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
                        license_status: 'verified',
                        license_verified_at: new Date().toISOString()
                    }).eq('id', user.id)
                }
            }

            return { success: true }
        } else {
            // VERIFICATION FAILED
            await supabase
                .from('users')
                .update({
                    license_status: 'rejected',
                    kyc_rejection_reason: result.reason
                })
                .eq('id', user.id)

            return { success: false, error: result.reason }
        }

    } catch (e: any) {
        console.error("KYC Error:", e)
        return { success: false, error: "Erreur technique du serveur AI." }
    }
}
