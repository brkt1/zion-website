const DatabaseOperations = require('../utils/databaseOperations');

async function runDatabaseExamples() {
  console.log('🚀 Starting Supabase Database Operations Examples...\n');

  try {
    // Example 1: Insert a single record
    console.log('1️⃣ Inserting a single record...');
    const insertResult = await DatabaseOperations.insertRecord('profiles', {
      id: 'test-user-' + Date.now(),
      email: 'test@example.com',
      username: 'testuser',
      created_at: new Date().toISOString()
    });
    
    if (insertResult.success) {
      console.log('✅ Insert successful:', insertResult.data);
    } else {
      console.log('❌ Insert failed:', insertResult.error);
    }

    // Example 2: Query records
    console.log('\n2️⃣ Querying records...');
    const queryResult = await DatabaseOperations.queryRecords('profiles', {
      columns: 'id, email, username',
      filter: { email: 'test@example.com' },
      limit: 5
    });
    
    if (queryResult.success) {
      console.log('✅ Query successful:', queryResult.data);
    } else {
      console.log('❌ Query failed:', queryResult.error);
    }

    // Example 3: Update records
    console.log('\n3️⃣ Updating records...');
    const updateResult = await DatabaseOperations.updateRecords(
      'profiles',
      { username: 'updated-testuser' },
      { email: 'test@example.com' }
    );
    
    if (updateResult.success) {
      console.log('✅ Update successful:', updateResult.data);
    } else {
      console.log('❌ Update failed:', updateResult.error);
    }

    // Example 4: Batch operations
    console.log('\n4️⃣ Running batch operations...');
    const batchOperations = [
      {
        action: 'insert',
        table: 'profiles',
        data: {
          id: 'batch-user-1-' + Date.now(),
          email: 'batch1@example.com',
          username: 'batchuser1',
          created_at: new Date().toISOString()
        }
      },
      {
        action: 'insert',
        table: 'profiles',
        data: {
          id: 'batch-user-2-' + Date.now(),
          email: 'batch2@example.com',
          username: 'batchuser2',
          created_at: new Date().toISOString()
        }
      }
    ];
    
    const batchResult = await DatabaseOperations.batchOperations(batchOperations);
    console.log('✅ Batch operations completed:', batchResult);

    // Example 5: Get table information
    console.log('\n5️⃣ Getting table information...');
    const tableInfo = await DatabaseOperations.getTableInfo('profiles');
    if (tableInfo.success) {
      console.log('✅ Table columns:', tableInfo.columns);
    } else {
      console.log('❌ Failed to get table info:', tableInfo.error);
    }

    // Example 6: Delete test records
    console.log('\n6️⃣ Cleaning up test records...');
    const deleteResult = await DatabaseOperations.deleteRecords('profiles', {
      email: 'test@example.com'
    });
    
    if (deleteResult.success) {
      console.log('✅ Cleanup successful:', deleteResult.data);
    } else {
      console.log('❌ Cleanup failed:', deleteResult.error);
    }

    // Clean up batch records too
    const batchDeleteResult = await DatabaseOperations.deleteRecords('profiles', {
      email: 'batch1@example.com'
    });
    
    if (batchDeleteResult.success) {
      console.log('✅ Batch cleanup successful:', batchDeleteResult.data);
    }

    console.log('\n🎉 All examples completed successfully!');

  } catch (error) {
    console.error('💥 Error running examples:', error);
  }
}

// Run the examples if this file is executed directly
if (require.main === module) {
  runDatabaseExamples();
}

module.exports = { runDatabaseExamples };
