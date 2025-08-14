'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { apiClient } from '../lib/api';

export function DatabricksQuery() {
  const [warehouseId, setWarehouseId] = useState('');
  const [sqlStatement, setSqlStatement] = useState('');
  const [catalog, setCatalog] = useState('');
  const [schema, setSchema] = useState('');
  const [queryResult, setQueryResult] = useState<unknown>(null);

  const queryMutation = useMutation({
    mutationFn: (data: {
      warehouse_id: string;
      statement: string;
      catalog?: string;
      schema?: string;
    }) => apiClient.executeDatabricksQuery(data),
    onSuccess: (data) => {
      setQueryResult(data);
    },
  });

  const handleExecuteQuery = () => {
    if (!warehouseId.trim() || !sqlStatement.trim()) return;

    const queryData = {
      warehouse_id: warehouseId.trim(),
      statement: sqlStatement.trim(),
      ...(catalog.trim() && { catalog: catalog.trim() }),
      ...(schema.trim() && { schema: schema.trim() }),
    };

    queryMutation.mutate(queryData);
  };

  const formatQueryResult = (result: unknown) => {
    if (!result) return null;

    // Handle different result formats from Databricks
    const resultObj = result as { 
      status?: string; 
      result?: { 
        data_array?: unknown[]; 
        schema?: { columns?: { name?: string; type_text?: string }[] } 
      } 
    };
    
    if (resultObj.status === 'SUCCEEDED' && resultObj.result) {
      if (resultObj.result.data_array && Array.isArray(resultObj.result.data_array)) {
        return {
          type: 'table' as const,
          columns: resultObj.result.schema?.columns || [],
          rows: resultObj.result.data_array,
        };
      }
    }

    return {
      type: 'json' as const,
      data: result,
    };
  };

  const formattedResult = formatQueryResult(queryResult);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Databricks SQL Query</CardTitle>
        <CardDescription>
          Execute SQL queries on Databricks SQL warehouses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="Warehouse ID (required)"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
          />
          <Input
            placeholder="Catalog (optional)"
            value={catalog}
            onChange={(e) => setCatalog(e.target.value)}
          />
        </div>

        <Input
          placeholder="Schema (optional)"
          value={schema}
          onChange={(e) => setSchema(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SQL Statement
          </label>
          <textarea
            className="w-full min-h-[120px] p-3 border border-input rounded-md text-sm font-mono"
            placeholder="Enter your SQL query here..."
            value={sqlStatement}
            onChange={(e) => setSqlStatement(e.target.value)}
          />
        </div>

        <Button
          onClick={handleExecuteQuery}
          disabled={!warehouseId.trim() || !sqlStatement.trim() || queryMutation.isPending}
          className="w-full"
        >
          {queryMutation.isPending ? 'Executing Query...' : 'Execute Query'}
        </Button>

        {queryMutation.error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
            Error: {queryMutation.error instanceof Error ? queryMutation.error.message : 'Query execution failed'}
          </div>
        )}

        {formattedResult && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Query Result</h3>
            
            {formattedResult.type === 'table' && formattedResult.rows && (
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    {formattedResult.columns && formattedResult.columns.length > 0 && (
                      <thead className="bg-gray-50">
                        <tr>
                          {formattedResult.columns.map((column: { name?: string; type_text?: string }, index: number) => (
                            <th
                              key={index}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {column.name || `Column ${index + 1}`}
                              {column.type_text && (
                                <div className="text-xs text-gray-400 normal-case">
                                  {column.type_text}
                                </div>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(formattedResult.rows as unknown[][]).slice(0, 100).map((row: unknown[], rowIndex: number) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {row.map((cell: unknown, cellIndex: number) => (
                            <td
                              key={cellIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            >
                              {cell !== null && cell !== undefined ? String(cell) : '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(formattedResult.rows as unknown[]).length > 100 && (
                  <div className="p-3 bg-yellow-50 text-sm text-yellow-800">
                    Showing first 100 rows of {(formattedResult.rows as unknown[]).length} total rows.
                  </div>
                )}
              </div>
            )}

            {formattedResult.type === 'json' && (
              <div className="bg-gray-50 rounded-md p-4">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(formattedResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h4 className="font-medium text-blue-900 mb-2">Query Examples</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                SELECT * FROM my_catalog.my_schema.my_table LIMIT 10
              </code>
            </div>
            <div>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                SHOW TABLES IN my_catalog.my_schema
              </code>
            </div>
            <div>
              <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                DESCRIBE my_catalog.my_schema.my_table
              </code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}