const supabase = require('../supabaseClient');

class DatabaseOperations {
  // Insert a single record
  static async insertRecord(table, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error(`Insert error in ${table}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Insert multiple records
  static async insertMultipleRecords(table, records) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(records)
        .select();
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error(`Bulk insert error in ${table}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Update records with filter
  static async updateRecords(table, data, filter) {
    try {
      let query = supabase
        .from(table)
        .update(data);
      
      if (filter) {
        Object.keys(filter).forEach(key => {
          query = query.eq(key, filter[key]);
        });
      }
      
      const { data: result, error } = await query.select();
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error(`Update error in ${table}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Delete records with filter
  static async deleteRecords(table, filter) {
    try {
      let query = supabase
        .from(table)
        .delete();
      
      if (filter) {
        Object.keys(filter).forEach(key => {
          query = query.eq(key, filter[key]);
        });
      }
      
      const { data: result, error } = await query.select();
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error(`Delete error in ${table}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Query records with filters
  static async queryRecords(table, options = {}) {
    try {
      const { columns, filter, order, limit, offset } = options;
      
      let query = supabase
        .from(table)
        .select(columns || '*');
      
      // Apply filters
      if (filter) {
        Object.keys(filter).forEach(key => {
          if (Array.isArray(filter[key])) {
            query = query.in(key, filter[key]);
          } else {
            query = query.eq(key, filter[key]);
          }
        });
      }
      
      // Apply ordering
      if (order) {
        if (typeof order === 'string') {
          const [column, direction] = order.split(':');
          query = query.order(column, { ascending: direction === 'asc' });
        } else if (Array.isArray(order)) {
          order.forEach(([column, direction]) => {
            query = query.order(column, { ascending: direction === 'asc' });
          });
        }
      }
      
      // Apply pagination
      if (limit) {
        query = query.limit(parseInt(limit));
      }
      
      if (offset) {
        query = query.range(parseInt(offset), parseInt(offset) + (parseInt(limit) || 1000) - 1);
      }
      
      const { data: result, error } = await query;
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error(`Query error in ${table}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Execute custom SQL (if you have the right permissions)
  static async executeRawSQL(sql, params = []) {
    try {
      const { data: result, error } = await supabase.rpc('exec_sql', {
        sql_query: sql,
        sql_params: params
      });
      
      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error('Raw SQL execution error:', error);
      return { success: false, error: error.message };
    }
  }

  // Batch operations
  static async batchOperations(operations) {
    const results = [];
    
    for (const operation of operations) {
      const { action, table, data, filter } = operation;
      
      try {
        let result;
        switch (action) {
          case 'insert':
            result = await this.insertRecord(table, data);
            break;
          case 'update':
            result = await this.updateRecords(table, data, filter);
            break;
          case 'delete':
            result = await this.deleteRecords(table, filter);
            break;
          default:
            result = { success: false, error: `Unknown action: ${action}` };
        }
        
        results.push({ action, table, result });
      } catch (error) {
        results.push({ action, table, result: { success: false, error: error.message } });
      }
    }
    
    return results;
  }

  // Get table schema information
  static async getTableInfo(table) {
    try {
      // Query a single record to get column information
      const { data: result, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      // Get column names from the first record
      const columns = result && result.length > 0 ? Object.keys(result[0]) : [];
      return { success: true, columns };
    } catch (error) {
      console.error(`Schema info error for ${table}:`, error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = DatabaseOperations;
