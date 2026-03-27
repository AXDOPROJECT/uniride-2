const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const url = envConfig.NEXT_PUBLIC_SUPABASE_URL;
// Need service role key to bypass RLS for direct updates
const key = envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function forceVerify() {
    console.log("Forcing verification for driver...");

    // First, find the user ID by email
    const { data: users, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'uniride_driver_2635@gmail.com')
        .limit(1);

    if (selectError || !users || users.length === 0) {
        console.error("Could not find user:", selectError);
        return;
    }

    const driverId = users[0].id;

    const { data, error } = await supabase
        .from('users')
        .update({ license_status: 'verified' })
        .eq('id', driverId);

    if (error) {
        console.error("Error updating status:", error.message);
    } else {
        console.log("DRIVER STATUS SET TO VERIFIED!");
    }
}

forceVerify();
