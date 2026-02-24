'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { sendMessage } from '@/app/actions/messages'
import { Send, Loader2 } from 'lucide-react'

type Message = {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    users?: {
        name: string | null;
        email: string;
    } | null;
}

export default function ChatInterface({ rideId, currentUserId, initialMessages }: { rideId: string, currentUserId: string, initialMessages: Message[] }) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Scroll to bottom on new message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        // Subscribe to real-time inserts on the 'messages' table FOR THIS SPECIFIC RIDE
        const channel = supabase
            .channel(`ride_${rideId}_chat`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `ride_id=eq.${rideId}`
                },
                async (payload) => {
                    const incomingMessage = payload.new as Message

                    // We need to fetch the sender's user details (name/email) since the generic realtime payload
                    // only broadcasts the raw table columns (sender_id) without the relational join
                    const { data: userData } = await supabase
                        .from('users')
                        .select('name, email')
                        .eq('id', incomingMessage.sender_id)
                        .single()

                    const fullMessage: Message = {
                        ...incomingMessage,
                        users: userData || null
                    }

                    setMessages((prev) => {
                        // Prevent duplicates if we already optimistically added it or rapid-fires occur
                        if (prev.find(m => m.id === fullMessage.id)) return prev;
                        return [...prev, fullMessage]
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [rideId, supabase])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || isSending) return

        const content = newMessage.trim()
        setNewMessage('')
        setIsSending(true)

        try {
            await sendMessage(rideId, content)
            // Note: We don't manually push into `messages` array here.
            // We rely completely on the Supabase Realtime Subscription `INSERT` above
            // to loop it back to us and everyone else perfectly synchronized.
        } catch (error) {
            console.error("Erreur d'envoi", error)
            alert(error instanceof Error ? error.message : "Erreur")
            setNewMessage(content) // restore failed message
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="flex flex-col h-[600px] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white">Discussion du Trajet</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Restez courtois et organisez votre point de rendez-vous.</p>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                        Aucun message. Commencez la discussion !
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId
                        const displayName = msg.users?.name || msg.users?.email?.split('@')[0] || 'Utilisateur'

                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <span className="text-[10px] text-slate-400 mb-1 px-1">
                                    {isMe ? 'Vous' : displayName} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${isMe
                                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-tl-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez votre message..."
                        disabled={isSending}
                        className="flex-1 rounded-full border-0 py-2.5 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="inline-flex items-center justify-center rounded-full bg-indigo-600 p-2.5 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-colors"
                    >
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
            </div>
        </div>
    )
}
