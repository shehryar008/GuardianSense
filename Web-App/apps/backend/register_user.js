require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

(async () => {
  try {
    // Check what's in the Hospitals table
    console.log('Checking Hospitals table...');
    const { data: hospitals, error } = await supabase
      .from('Hospitals')
      .select('hospital_id, hospital_name, email, is_active');

    if (error) {
      console.log('ERROR querying Hospitals:', error.message);
      // Try lowercase table name
      console.log('\nTrying lowercase "hospitals"...');
      const { data: h2, error: e2 } = await supabase
        .from('hospitals')
        .select('hospital_id, hospital_name, email, is_active');
      if (e2) console.log('ERROR:', e2.message);
      else console.log('Found (lowercase):', JSON.stringify(h2, null, 2));
    } else {
      console.log('Found hospitals:', JSON.stringify(hospitals, null, 2));
    }
  } catch (e) {
    console.log('CATCH:', e.message);
  }
})();
