#!/usr/bin/env node

const readline = require('readline');
const DatabaseOperations = require('../utils/databaseOperations');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function showMenu() {
  console.log('\n🗄️  Supabase Database CLI Tool');
  console.log('================================');
  console.log('1. Insert record');
  console.log('2. Query records');
  console.log('3. Update records');
  console.log('4. Delete records');
  console.log('5. Batch operations');
  console.log('6. Get table info');
  console.log('7. Exit');
  console.log('================================');
}

async function insertRecord() {
  try {
    const table = await question('Enter table name: ');
    const dataStr = await question('Enter data as JSON (e.g., {"name": "value"}): ');
    
    let data;
    try {
      data = JSON.parse(dataStr);
    } catch (e) {
      console.log('❌ Invalid JSON format');
      return;
    }
    
    console.log('🔄 Inserting record...');
    const result = await DatabaseOperations.insertRecord(table, data);
    
    if (result.success) {
      console.log('✅ Insert successful:', result.data);
    } else {
      console.log('❌ Insert failed:', result.error);
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

async function queryRecords() {
  try {
    const table = await question('Enter table name: ');
    const columns = await question('Enter columns (or press Enter for all): ') || '*';
    const filterStr = await question('Enter filter as JSON (or press Enter for none): ') || '{}';
    
    let filter;
    try {
      filter = JSON.parse(filterStr);
    } catch (e) {
      console.log('❌ Invalid JSON format, using no filter');
      filter = {};
    }
    
    const limit = await question('Enter limit (or press Enter for no limit): ') || null;
    
    console.log('🔄 Querying records...');
    const result = await DatabaseOperations.queryRecords(table, {
      columns,
      filter: Object.keys(filter).length > 0 ? filter : null,
      limit: limit ? parseInt(limit) : null
    });
    
    if (result.success) {
      console.log('✅ Query successful:');
      console.table(result.data);
    } else {
      console.log('❌ Query failed:', result.error);
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

async function updateRecords() {
  try {
    const table = await question('Enter table name: ');
    const dataStr = await question('Enter update data as JSON: ');
    const filterStr = await question('Enter filter as JSON: ');
    
    let data, filter;
    try {
      data = JSON.parse(dataStr);
      filter = JSON.parse(filterStr);
    } catch (e) {
      console.log('❌ Invalid JSON format');
      return;
    }
    
    console.log('🔄 Updating records...');
    const result = await DatabaseOperations.updateRecords(table, data, filter);
    
    if (result.success) {
      console.log('✅ Update successful:', result.data);
    } else {
      console.log('❌ Update failed:', result.error);
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

async function deleteRecords() {
  try {
    const table = await question('Enter table name: ');
    const filterStr = await question('Enter filter as JSON: ');
    
    let filter;
    try {
      filter = JSON.parse(filterStr);
    } catch (e) {
      console.log('❌ Invalid JSON format');
      return;
    }
    
    const confirm = await question(`⚠️  Are you sure you want to delete records from ${table}? (yes/no): `);
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      return;
    }
    
    console.log('🔄 Deleting records...');
    const result = await DatabaseOperations.deleteRecords(table, filter);
    
    if (result.success) {
      console.log('✅ Delete successful:', result.data);
    } else {
      console.log('❌ Delete failed:', result.error);
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

async function batchOperations() {
  try {
    console.log('🔄 Batch operations not yet implemented in CLI');
    console.log('Use the API endpoint /api/database/batch instead');
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

async function getTableInfo() {
  try {
    const table = await question('Enter table name: ');
    
    console.log('🔄 Getting table info...');
    const result = await DatabaseOperations.getTableInfo(table);
    
    if (result.success) {
      console.log('✅ Table columns:', result.columns);
    } else {
      console.log('❌ Failed to get table info:', result.error);
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Supabase Database CLI...');
  
  while (true) {
    await showMenu();
    const choice = await question('Select an option (1-7): ');
    
    switch (choice) {
      case '1':
        await insertRecord();
        break;
      case '2':
        await queryRecords();
        break;
      case '3':
        await updateRecords();
        break;
      case '4':
        await deleteRecords();
        break;
      case '5':
        await batchOperations();
        break;
      case '6':
        await getTableInfo();
        break;
      case '7':
        console.log('👋 Goodbye!');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('❌ Invalid option, please try again');
    }
    
    await question('\nPress Enter to continue...');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  rl.close();
  process.exit(0);
});

// Run the CLI
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
