const DatabaseOperations = require('./utils/databaseOperations');
const { v4: uuidv4 } = require('uuid');

async function testDatabaseOperations() {
  console.log('🧪 Testing Supabase Database Operations...\n');

  try {
    // Test 1: Get table info
    console.log('1️⃣ Testing table info...');
    const tableInfo = await DatabaseOperations.getTableInfo('profiles');
    console.log('Table info result:', tableInfo);

    // Test 2: Query existing records
    console.log('\n2️⃣ Testing query...');
    const queryResult = await DatabaseOperations.queryRecords('profiles', {
      limit: 3
    });
    console.log('Query result:', queryResult);

    // Test 3: Insert a test record
    console.log('\n3️⃣ Testing insert...');
    const testId = uuidv4();
    const insertResult = await DatabaseOperations.insertRecord('game_types', {
      id: testId,
      name: `Test Game Type ${Date.now()}`,
      description: 'A test game type for testing database operations',
      created_at: new Date().toISOString(),
      route_access: ['/test'],
      is_default: false
    });
    console.log('Insert result:', insertResult);

    // Test 4: Query the inserted record
    if (insertResult.success) {
      console.log('\n4️⃣ Testing query of inserted record...');
      const queryTestResult = await DatabaseOperations.queryRecords('game_types', {
        filter: { id: testId }
      });
      console.log('Query test result:', queryTestResult);
    }

    // Test 5: Clean up test record
    if (insertResult.success) {
      console.log('\n5️⃣ Cleaning up test record...');
      const deleteResult = await DatabaseOperations.deleteRecords('game_types', {
        id: testId
      });
      console.log('Delete result:', deleteResult);
    }

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testDatabaseOperations();
}

module.exports = { testDatabaseOperations };
