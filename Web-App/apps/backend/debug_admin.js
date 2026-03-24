const supabase = require('./src/config/db');
const { findAllUsers, getActivityLog, getAllIncidents } = require('./src/modules/admin/admin.repository');

async function test() {
  try {
    console.log('--- Testing findAllUsers ---');
    await findAllUsers();
    console.log('findAllUsers: OK');
  } catch (err) {
    console.error('findAllUsers ERROR:\n', JSON.stringify(err, null, 2));
  }

  try {
    console.log('\n--- Testing incident_dispatch relation ---');
    const { data, error } = await supabase.from('incident_dispatch').select('*, hospitals(*)').limit(1);
    console.log('incident_dispatch hospitals ERROR:\n', error ? JSON.stringify(error, null, 2) : 'OK');
  } catch (err) {}

  try {
    console.log('\n--- Testing getActivityLog ---');
    await getActivityLog(5);
    console.log('getActivityLog: OK');
  } catch (err) {
    console.error('getActivityLog ERROR:\n', JSON.stringify(err, null, 2));
  }
}

test();
