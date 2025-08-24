const express = require('express');
const supabase = require('../supabaseClient');

const router = express.Router();

// INSERT - Add new records
router.post('/insert', async (req, res) => {
  try {
    const { table, data } = req.body;
    
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();
    
    if (error) throw error;
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Insert error:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Modify existing records
router.put('/update', async (req, res) => {
  try {
    const { table, data, filter } = req.body;
    
    let query = supabase
      .from(table)
      .update(data);
    
    // Apply filters if provided
    if (filter) {
      Object.keys(filter).forEach(key => {
        query = query.eq(key, filter[key]);
      });
    }
    
    const { data: result, error } = await query.select();
    
    if (error) throw error;
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Remove records
router.delete('/delete', async (req, res) => {
  try {
    const { table, filter } = req.body;
    
    let query = supabase
      .from(table)
      .delete();
    
    // Apply filters if provided
    if (filter) {
      Object.keys(filter).forEach(key => {
        query = query.eq(key, filter[key]);
      });
    }
    
    const { data: result, error } = await query.select();
    
    if (error) throw error;
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// SELECT - Query records
router.get('/select', async (req, res) => {
  try {
    const { table, columns, filter, order, limit } = req.query;
    
    let query = supabase
      .from(table)
      .select(columns || '*');
    
    // Apply filters if provided
    if (filter) {
      const filterObj = JSON.parse(filter);
      Object.keys(filterObj).forEach(key => {
        query = query.eq(key, filterObj[key]);
      });
    }
    
    // Apply ordering if provided
    if (order) {
      const [column, direction] = order.split(':');
      query = query.order(column, { ascending: direction === 'asc' });
    }
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const { data: result, error } = await query;
    
    if (error) throw error;
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Select error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Execute raw SQL (if you have the right permissions)
router.post('/raw-sql', async (req, res) => {
  try {
    const { sql, params } = req.body;
    
    const { data: result, error } = await supabase.rpc('exec_sql', {
      sql_query: sql,
      sql_params: params || []
    });
    
    if (error) throw error;
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Raw SQL error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Batch operations
router.post('/batch', async (req, res) => {
  try {
    const { operations } = req.body;
    const results = [];
    
    for (const operation of operations) {
      const { action, table, data, filter } = operation;
      
      let query;
      switch (action) {
        case 'insert':
          query = supabase.from(table).insert(data).select();
          break;
        case 'update':
          query = supabase.from(table).update(data);
          if (filter) {
            Object.keys(filter).forEach(key => {
              query = query.eq(key, filter[key]);
            });
          }
          query = query.select();
          break;
        case 'delete':
          query = supabase.from(table).delete();
          if (filter) {
            Object.keys(filter).forEach(key => {
              query = query.eq(key, filter[key]);
            });
          }
          query = query.select();
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      const { data: result, error } = await query;
      if (error) throw error;
      
      results.push({ action, table, result });
    }
    
    res.json({ success: true, results });
  } catch (error) {
    console.error('Batch operation error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
