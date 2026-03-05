const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestRide() {
    // 1. Get a test driver
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

    if (userError || !users || users.length === 0) {
        console.error("No users found to act as driver.");
        return;
    }

    const driverId = users[0].id;

    // 2. Insert ride from Paris to Lyon
    const { data, error } = await supabase
        .from('rides')
        .insert([{
            driver_id: driverId,
            origin: 'Paris, France',
            origin_lat: 48.8566,
            origin_lng: 2.3522,
            destination: 'Lyon, France',
            dest_lat: 45.7640,
            dest_lng: 4.8357,
            departure_time: new Date(Date.now() + 86400000).toISOString(),
            total_seats: 4,
            available_seats: 4,
            price: 25.0
        }])
        .select();

    if (error) {
        console.error("Error inserting ride:", error);
    } else {
        console.log("Successfully inserted test ride:", data[0].id);
    }
}

insertTestRide();
