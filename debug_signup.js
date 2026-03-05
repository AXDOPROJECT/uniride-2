const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`Attempting signup for ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: 'Test User',
                role: 'passenger'
            }
        }
    });

    if (error) {
        console.error("Signup Error:", JSON.stringify(error, null, 2));
    } else {
        console.log("Signup Success:", JSON.stringify(data, null, 2));
    }
}

testSignup();
