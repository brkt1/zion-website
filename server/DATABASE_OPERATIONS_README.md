# Supabase Database Operations with Node.js

This guide explains how to edit your Supabase database using Node.js through various methods.

## 🚀 Quick Start

### 1. **API Endpoints** (Recommended for web applications)

Your server now includes database operation endpoints at `/api/database`:

```bash
# Insert a record
POST /api/database/insert
{
  "table": "profiles",
  "data": {
    "id": "user123",
    "email": "user@example.com",
    "username": "testuser"
  }
}

# Update records
PUT /api/database/update
{
  "table": "profiles",
  "data": { "username": "newusername" },
  "filter": { "email": "user@example.com" }
}

# Delete records
DELETE /api/database/delete
{
  "table": "profiles",
  "filter": { "email": "user@example.com" }
}

# Query records
GET /api/database/select?table=profiles&columns=id,email&filter={"email":"user@example.com"}&limit=10

# Batch operations
POST /api/database/batch
{
  "operations": [
    {
      "action": "insert",
      "table": "profiles",
      "data": { "id": "user1", "email": "user1@example.com" }
    },
    {
      "action": "update",
      "table": "profiles",
      "data": { "status": "active" },
      "filter": { "id": "user1" }
    }
  ]
}
```

### 2. **Utility Class** (For server-side scripts)

Use the `DatabaseOperations` class in your server code:

```javascript
const DatabaseOperations = require('./utils/databaseOperations');

// Insert a record
const result = await DatabaseOperations.insertRecord('profiles', {
  id: 'user123',
  email: 'user@example.com'
});

// Query records
const users = await DatabaseOperations.queryRecords('profiles', {
  filter: { status: 'active' },
  limit: 10
});

// Update records
await DatabaseOperations.updateRecords('profiles', 
  { status: 'inactive' }, 
  { email: 'user@example.com' }
);
```

### 3. **CLI Tool** (For interactive database management)

Run the interactive CLI tool:

```bash
cd server
node cli/database-cli.js
```

Or make it executable and run directly:

```bash
chmod +x cli/database-cli.js
./cli/database-cli.js
```

### 4. **Example Scripts** (For testing and learning)

Run the example script to see all operations in action:

```bash
cd server
node examples/databaseExample.js
```

## 📋 Available Operations

### **Insert Operations**
- `insertRecord(table, data)` - Insert a single record
- `insertMultipleRecords(table, records)` - Insert multiple records at once

### **Query Operations**
- `queryRecords(table, options)` - Query with filters, ordering, pagination
- `getTableInfo(table)` - Get table schema information

### **Update Operations**
- `updateRecords(table, data, filter)` - Update records matching filter criteria

### **Delete Operations**
- `deleteRecords(table, filter)` - Delete records matching filter criteria

### **Batch Operations**
- `batchOperations(operations)` - Execute multiple operations in sequence
- `executeRawSQL(sql, params)` - Execute custom SQL (if permissions allow)

## 🔧 Configuration

Make sure your `.env` file contains:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important**: Use the `service_role_key` (not `anon_key`) for server-side operations to bypass RLS policies.

## 🛡️ Security Considerations

1. **Service Role Key**: Only use the service role key on your server, never expose it to the client
2. **Input Validation**: Always validate and sanitize input data before database operations
3. **RLS Policies**: Your Supabase RLS policies will still apply to these operations
4. **Error Handling**: Implement proper error handling and logging

## 📝 Usage Examples

### **Creating a User Profile**
```javascript
const newProfile = await DatabaseOperations.insertRecord('profiles', {
  id: 'user-' + Date.now(),
  email: 'john@example.com',
  username: 'john_doe',
  created_at: new Date().toISOString(),
  status: 'active'
});
```

### **Updating User Status**
```javascript
await DatabaseOperations.updateRecords('profiles',
  { status: 'verified', updated_at: new Date().toISOString() },
  { email: 'john@example.com' }
);
```

### **Finding Active Users**
```javascript
const activeUsers = await DatabaseOperations.queryRecords('profiles', {
  columns: 'id, email, username, created_at',
  filter: { status: 'active' },
  order: 'created_at:desc',
  limit: 20
});
```

### **Batch User Operations**
```javascript
const operations = [
  {
    action: 'insert',
    table: 'profiles',
    data: { id: 'user1', email: 'user1@example.com' }
  },
  {
    action: 'insert',
    table: 'profiles',
    data: { id: 'user2', email: 'user2@example.com' }
  }
];

const results = await DatabaseOperations.batchOperations(operations);
```

## 🧪 Testing

Test the database operations:

```bash
# Test API endpoints
curl -X POST http://localhost:3000/api/database/insert \
  -H "Content-Type: application/json" \
  -d '{"table":"profiles","data":{"id":"test","email":"test@example.com"}}'

# Run examples
cd server
node examples/databaseExample.js

# Use CLI
node cli/database-cli.js
```

## 🚨 Troubleshooting

### **Common Issues**

1. **Permission Denied**: Check your Supabase service role key and RLS policies
2. **Table Not Found**: Verify table names exist in your Supabase database
3. **Column Errors**: Ensure column names match your table schema
4. **Connection Issues**: Check your Supabase URL and network connectivity

### **Debug Mode**

Enable detailed logging by setting:

```javascript
// In your supabaseClient.js
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public'
  }
});
```

## 📚 Additional Resources

- [Supabase JavaScript Client Documentation](https://supabase.com/docs/reference/javascript)
- [Supabase RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

## 🤝 Contributing

Feel free to extend these utilities with additional features like:
- Connection pooling
- Transaction support
- Migration tools
- Schema validation
- Performance monitoring
