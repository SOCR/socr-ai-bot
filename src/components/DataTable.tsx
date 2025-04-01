
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataTableProps {
  data: Array<Record<string, any>>;
  limit?: number;
}

const DataTable: React.FC<DataTableProps> = ({ data, limit = 10 }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const headers = Object.keys(data[0]);
  const displayData = data.slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Data Preview</CardTitle>
        <p className="text-sm text-muted-foreground">
          Showing {displayData.length} of {data.length} rows
        </p>
      </CardHeader>
      <CardContent className="p-0 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((header) => (
                  <TableCell key={`${rowIndex}-${header}`}>
                    {row[header]?.toString() || ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DataTable;
