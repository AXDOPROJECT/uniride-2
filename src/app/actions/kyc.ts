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

        if (process.env.GEMINI_API_KEY === undefined || process.env.GEMINI_API_KEY === '') {
            return { success: false, error: "Clé API Gemini (Google) manquante. Veuillez l'ajouter." }
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: "Utilisateur non authentifié." }
        }

        const { GoogleGenerativeAI } = require('@google/generative-ai')
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const prompt = `Tu es un expert anti-fraude KYC (Know Your Customer). Tu reçois deux images: la 1ère est un permis de conduire, la 2ème est un selfie en direct. Ta mission STRICTE est d'analyser ces images pour vérifier l'identité.
        
Vérifie strictement ces points:
1. La première image est un permis de conduire valide officiel français ou européen.
2. Le document n'est pas expiré (cherche la date de validité 4b).
3. Le nom et prénom sur le permis correspondent (même partiellement ou phonétiquement) à l'utilisateur ciblé : "${userFullName}".
4. Le visage sur le selfie (2ème image) correspond au visage imprimé sur le permis (1ère image). Ce point est critique pour éviter l'usurpation.

RÉPONDRE UNIQUEMENT EN JSON STRICT. Structure demandée:
{
  "isValid": boolean,
  "reason": "Une phrase en français expliquant le résultat. Si isValid est false, sois très précis sur ce qui a échoué."
}`

        const idPart = {
            inlineData: {
                data: idImage.replace(/^data:image\/\w+;base64,/, ''),
                mimeType: "image/jpeg"
            }
        }

        const selfiePart = {
            inlineData: {
                data: selfieImage.replace(/^data:image\/\w+;base64,/, ''),
                mimeType: "image/jpeg"
            }
        }

        // Call Gemini
        const aiResponse = await model.generateContent([prompt, idPart, selfiePart])
        const replyRaw = aiResponse.response.text()

        if (!replyRaw) throw new Error("Réponse vide de Gemini")

        // Clean JSON formatting (sometimes LLMs wrap in ```json ... ```)
        const cleanedJsonStr = replyRaw.replace(/```json/g, '').replace(/```/g, '').trim()
        const result = JSON.parse(cleanedJsonStr)

        if (result.isValid === true) {
            // VERIFICATION SUCCESSFUL. Update user profile.
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    license_status: 'verified',
                    license_verified_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (updateError) {
                console.error("Erreur de mise à jour Supabase :", updateError)
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
        return { success: false, error: "Erreur technique du serveur AI gratuit. Vérifiez la clé API." }
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
