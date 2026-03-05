const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const url = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const key = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function getData() {
    const { data: users } = await supabase.from('users').select('id, email').limit(2);
    console.log("USERS:", JSON.stringify(users));
}

getData();
