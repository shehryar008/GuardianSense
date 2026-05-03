const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '/Users/muhammadabdullah/Documents/GuardianSense/Web-App/apps/backend/.env' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
async function run() {
  const { data } = await supabase.from('incidents').select('*');
  console.log(JSON.stringify(data, null, 2));
}
run();
