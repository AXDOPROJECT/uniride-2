const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://wwoonujniqdgtuzmabkz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3b29udWpuaXFkZ3R1em1hYmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4ODgwMDAsImV4cCI6MjA4NzQ2NDAwMH0.LxclUHUwbdFJYdPU5_2zF_v1AIIHdplve1FGrTxi7dU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
    console.log("--- SCHEMA CHECK ---");

    const { data: termsData, error: termsError } = await supabase
        .from('terms_acceptances')
        .select('id')
        .limit(1);

    if (termsError) {
        console.log("Terms Acceptances Table:", termsError.message);
    } else {
        console.log("Terms Acceptances Table: EXISTS");
    }

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('has_accepted_terms')
        .limit(1);

    if (userError) {
        console.log("Users Table Terms Column:", userError.message);
    } else {
        console.log("Users Table Terms Column: EXISTS");
    }
}

checkSchema();
