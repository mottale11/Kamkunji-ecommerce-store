'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/SupabaseProvider';

export default function TestDatabasePage() {
  const [dbInfo, setDbInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();

  useEffect(() => {
    testDatabase();
  }, []);

  const testDatabase = async () => {
    try {
      setLoading(true);
      const results: any = {};

      // Test 1: Check if we can connect to Supabase
      console.log('Testing Supabase connection...');
      
      // Test 2: Check what tables exist and their data
      const tables = ['profiles', 'products', 'categories', 'product_images', 'orders'];
      
      for (const table of tables) {
        try {
          console.log(`Testing table: ${table}`);
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact' });
          
          if (error) {
            console.error(`Error with table ${table}:`, error);
            results[table] = { error: error.message, exists: false };
          } else {
            console.log(`Table ${table} data:`, data);
            results[table] = { 
              exists: true, 
              count: count || data?.length || 0, 
              sampleData: data?.slice(0, 2) || [],
              columns: data && data.length > 0 ? Object.keys(data[0]) : []
            };
          }
        } catch (err) {
          console.error(`Exception with table ${table}:`, err);
          results[table] = { error: 'Exception occurred', exists: false };
        }
      }

      // Test 3: Check storage buckets
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        results.storage = { buckets: buckets || [] };
      } catch (err) {
        console.error('Error checking storage:', err);
        results.storage = { error: 'Failed to check storage' };
      }

      setDbInfo(results);
    } catch (err: any) {
      console.error('Database test error:', err);
      setError(err.message || 'Failed to test database');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Database Test Results</h1>
        <p className="mt-1 text-sm text-gray-500">
          Testing database connectivity and table structure
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Database Status</h3>
          
          {Object.entries(dbInfo).map(([tableName, info]: [string, any]) => (
            <div key={tableName} className="mb-6 p-4 border rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{tableName}</h4>
              
              {info.error ? (
                <div className="text-red-600">
                  <strong>Error:</strong> {info.error}
                </div>
              ) : (
                <div className="space-y-2">
                  <div><strong>Exists:</strong> {info.exists ? 'Yes' : 'No'}</div>
                  {info.count !== undefined && <div><strong>Count:</strong> {info.count}</div>}
                  
                  {info.columns && info.columns.length > 0 && (
                    <div>
                      <strong>Columns:</strong> {info.columns.join(', ')}
                    </div>
                  )}
                  
                  {info.sampleData && info.sampleData.length > 0 && (
                    <div>
                      <strong>Sample Data:</strong>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(info.sampleData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Console Output</h3>
        <p className="text-sm text-gray-600">
          Check the browser console for detailed database query results and any errors.
        </p>
      </div>
    </div>
  );
}
