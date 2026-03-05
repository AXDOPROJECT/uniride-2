const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const url = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const key = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function testFlow() {
    console.log("--- STARTING FLOW TEST ---");

    // 1. Get a user to act as driver and passenger (or use same for test)
    const { data: users } = await supabase.from('users').select('id').limit(2);
    if (!users || users.length < 1) {
        console.error("No users found to test.");
        return;
    }
    const driverId = users[0].id;
    const passengerId = users[1] ? users[1].id : users[0].id;

    console.log(`Using Driver: ${driverId}, Passenger: ${passengerId}`);

    // 2. Create a ride
    const { data: ride, error: rideError } = await supabase.from('rides').insert({
        driver_id: driverId,
        origin: 'Pessac',
        destination: 'Talence',
        departure_time: new Date(Date.now() + 3600000).toISOString(),
        available_seats: 3,
        price: 5,
        status: 'scheduled'
    }).select().single();

    if (rideError) {
        console.error("Error creating ride:", rideError.message);
        return;
    }
    console.log("Ride created:", ride.id);

    // 3. Create a request
    const { data: req, error: reqError } = await supabase.from('ride_requests').insert({
        ride_id: ride.id,
        passenger_id: passengerId,
        status: 'accepted' // Pre-accept for simplicity
    }).select().single();

    if (reqError) {
        console.error("Error creating request:", reqError.message);
        return;
    }
    console.log("Request created:", req.id);

    // 4. Verify Upcoming
    // We check if it matches "scheduled" and "not onboarded"
    if (ride.status === 'scheduled' && req.status === 'accepted') {
        console.log("PASSED: Ride is in UPCOMING state.");
    }

    // 5. Simulate Boarding (Change request to onboarded)
    const { error: onboardError } = await supabase.from('ride_requests').update({ status: 'onboarded' }).eq('id', req.id);
    if (onboardError) console.error("Onboard Error:", onboardError.message);
    else console.log("Passenger onboarded.");

    // 6. Verify Ongoing
    const { data: updatedReq } = await supabase.from('ride_requests').select('status').eq('id', req.id).single();
    if (updatedReq.status === 'onboarded') {
        console.log("PASSED: Ride is now in ONGOING state (due to onboarded request).");
    }

    // 7. Simulate Completion
    const { error: completeError } = await supabase.from('rides').update({ status: 'completed' }).eq('id', ride.id);
    if (completeError) console.error("Complete Error:", completeError.message);
    else console.log("Ride completed.");

    // 8. Verify Past
    const { data: finalRide } = await supabase.from('rides').select('status').eq('id', ride.id).single();
    if (finalRide.status === 'completed') {
        console.log("PASSED: Ride is now in PAST state.");
    }

    // 9. Cleanup
    await supabase.from('ride_requests').delete().eq('id', req.id);
    await supabase.from('rides').delete().eq('id', ride.id);
    console.log("Test cleanup done.");
}

testFlow();
