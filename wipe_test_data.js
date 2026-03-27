const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function wipe() {
    console.log("Wiping test rides...");
    const { data: users } = await supabase.from('users').select('id').in('email', ['uniride_driver_2635@gmail.com', 'uniride_passenger_5984@gmail.com']);
    if (users && users.length > 0) {
        const ids = users.map(u => u.id);
        const { error: reqErr } = await supabase.from('ride_requests').delete().in('passenger_id', ids);
        const { error: rideErr } = await supabase.from('rides').delete().in('driver_id', ids);
        console.log("Wipe errors (if any):", reqErr, rideErr);
    }
    console.log("Wipe complete.");
}

wipe();
