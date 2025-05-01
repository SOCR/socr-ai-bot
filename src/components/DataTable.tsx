import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataTableProps {
  data: Array<Record<string, any>>;
  paginatedData: Array<Record<string, any>>;
  searchQuery?: string;
  totalRows: number;
  isFullScreen?: boolean;
  currentPage?: number;
  rowsPerPage?: number;
}

const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  paginatedData, 
  searchQuery = '', 
  totalRows, 
  isFullScreen = false,
  currentPage = 1,
  rowsPerPage = 15
}) => {
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
  
  // Calculate the start and end row numbers for the current page
  const startRow = Math.min((currentPage - 1) * rowsPerPage + 1, totalRows);
  const endRow = Math.min(startRow + paginatedData.length - 1, totalRows);
  
  // Highlight text that matches the search query
  const highlightText = (text: string) => {
    if (!searchQuery.trim() || !text) return text;
    
    const parts = text.toString().split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() 
        ? <span key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</span> 
        : part
    );
  };

  return (
    <Card className={isFullScreen ? 'h-full flex flex-col' : ''}>
      <CardHeader>
        <CardTitle className="text-lg">Data Table</CardTitle>
        <p className="text-sm text-muted-foreground">
          {searchQuery 
            ? `Showing filtered results: rows ${startRow}~${endRow} of ${totalRows} rows match your search`
            : `Showing rows ${startRow}~${endRow} of ${totalRows} rows`}
        </p>
      </CardHeader>
      <CardContent className={`p-0 overflow-auto ${isFullScreen ? 'flex-1' : ''}`}>
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header} className="font-bold">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {headers.map((header) => (
                  <TableCell key={`${rowIndex}-${header}`}>
                    {searchQuery ? highlightText(row[header]?.toString() || '') : (row[header]?.toString() || '')}
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
