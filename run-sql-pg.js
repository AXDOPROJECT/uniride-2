require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

async function run() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("Missing DATABASE_URL");
        process.exit(1);
    }

    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();

        const createTableSql = `
      CREATE TABLE IF NOT EXISTS public.announcements (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          content TEXT NOT NULL,
          author_id UUID REFERENCES public.users(id) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
      ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
    `;
        await client.query(createTableSql);

        const checkPolicy1 = `SELECT 1 FROM pg_policies WHERE tablename = 'announcements' AND policyname = 'Announcements are viewable by everyone'`;
        const checkPolicy2 = `SELECT 1 FROM pg_policies WHERE tablename = 'announcements' AND policyname = 'Only admins can insert announcements'`;

        const res1 = await client.query(checkPolicy1);
        if (res1.rowCount === 0) {
            await client.query(`CREATE POLICY "Announcements are viewable by everyone" ON public.announcements FOR SELECT USING (true);`);
        }

        const res2 = await client.query(checkPolicy2);
        if (res2.rowCount === 0) {
            await client.query(`
        CREATE POLICY "Only admins can insert announcements" ON public.announcements FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
        );
      `);
        }

        console.log("SQL execution successful!");
    } catch (err) {
        console.error("Error executing SQL:", err);
    } finally {
        await client.end();
    }
}

run();
