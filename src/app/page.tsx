import { Car, Search } from 'lucide-react'
import Link from 'next/link'
import LiveRideMap from '@/components/LiveRideMap'
import LiveRideTicker from '@/components/LiveRideTicker'
import { createClient } from '@/utils/supabase/server'

export default async function Page() {
  const supabase = await createClient()

  const { data: rides, error: ridesError } = await supabase
    .from('rides')
    .select('id, origin, destination, origin_lat, origin_lng, dest_lat, dest_lng, departure_time, driver:driver_id(name)')
    .eq('status', 'scheduled')
    .gte('departure_time', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
    .limit(10)

  if (ridesError) {
    console.error("Error fetching rides for map:", ridesError.message)
  }

  return (
    <main className="flex-1 overflow-y-auto bg-transparent">
      <div className="max-w-xl mx-auto px-6 pt-10 pb-24 space-y-10">

        {/* Branding */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-lime flex items-center justify-center overflow-hidden border-2 border-white dark:border-zinc-800 shadow-sm">
              <img src="/logo.png" alt="UR" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">UNIRIDE</span>
          </div>
          <p className="text-slate-900 dark:text-white font-black text-2xl uppercase leading-tight italic">
            Voyagez pour <span className="bg-brand-lime text-black px-2 rounded-lg">moins d'un café</span>.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="grid grid-cols-1 gap-5">
          <Link href="/proposer" className="group premium-card p-6 flex items-center gap-5 border-l-8 border-l-brand-purple">
            <div className="w-16 h-16 rounded-full bg-brand-purple-soft dark:bg-brand-purple/10 flex items-center justify-center text-brand-purple transition-transform group-hover:scale-110">
              <Car className="w-8 h-8 fill-brand-purple/20" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Proposer un trajet</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-500 font-medium">Partagez vos places libres et économisez.</p>
            </div>
          </Link>

          <Link href="/rechercher" className="group premium-card p-6 flex items-center gap-5 border-l-8 border-l-pink-500">
            <div className="w-16 h-16 rounded-full bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-500 transition-transform group-hover:scale-110">
              <Search className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Trouver un trajet</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-500 font-medium">Recherchez un covoiturage étudiant.</p>
            </div>
          </Link>
        </div>

        {/* Nearby Rides Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase">Trajets en direct</h2>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 uppercase">Live</span>
            </div>
          </div>

          <LiveRideMap
            rides={rides || []}
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}
          />

          <div className="-mx-6">
            <LiveRideTicker rides={rides || []} />
          </div>
        </div>

      </div>
    </main >
  );
}
