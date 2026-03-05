const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const url = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const key = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function listUsers() {
    console.log("Fetching existing users...");
    const { data: users, error } = await supabase.from('users').select('email').limit(10);
    if (error) {
        console.error("Error fetching users:", error.message);
        return;
    }
    console.log("POTENTIAL USERS:");
    users.forEach(u => console.log(u.email));
}

listUsers();
