const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const url = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const key = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function createTestUsers() {
    console.log("Creating test accounts...");

    // Use slightly more realistic emails to avoid valiation issues if any
    const driverEmail = `uniride_driver_${Math.floor(Math.random() * 10000)}@gmail.com`;
    const passengerEmail = `uniride_passenger_${Math.floor(Math.random() * 10000)}@gmail.com`;
    const password = 'Password123!';

    const { data: d, error: de } = await supabase.auth.signUp({
        email: driverEmail,
        password,
        options: { data: { name: 'Driver Verification', phone: '+33600000001' } }
    });
    const { data: p, error: pe } = await supabase.auth.signUp({
        email: passengerEmail,
        password,
        options: { data: { name: 'Passenger Verification', phone: '+33600000002' } }
    });

    if (de) console.log("Driver error:", de.message);
    else console.log("DRIVER_CREDS=" + driverEmail + ":" + password);

    if (pe) console.log("Passenger error:", pe.message);
    else console.log("PASSENGER_CREDS=" + passengerEmail + ":" + password);
}

createTestUsers();
