import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataTableProps {
  data: Array<Record<string, any>>;
  paginatedData: Array<Record<string, any>>;
  searchQuery?: string;
  totalRows: number;
  isFullScreen?: boolean;
  currentPage?: number;
  rowsPerPage?: number;
}

const isNumericValue = (value: any) =>
  value !== null && value !== undefined && value !== '' && !isNaN(Number(value));

const DataTable: React.FC<DataTableProps> = ({
  data,
  paginatedData,
  searchQuery = '',
  totalRows,
  isFullScreen = false,
  currentPage = 1,
  rowsPerPage = 15
}) => {
  const headers = useMemo(() => (data && data.length > 0 ? Object.keys(data[0]) : []), [data]);

  // A column is treated as numeric only if every non-empty value in the current page parses as a number
  const numericColumns = useMemo(() => {
    const result: Record<string, boolean> = {};
    headers.forEach((header) => {
      const values = paginatedData.map((row) => row[header]).filter((v) => v !== null && v !== undefined && v !== '');
      result[header] = values.length > 0 && values.every(isNumericValue);
    });
    return result;
  }, [headers, paginatedData]);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate the start and end row numbers for the current page
  const startRow = Math.min((currentPage - 1) * rowsPerPage + 1, totalRows);
  const endRow = Math.min(startRow + paginatedData.length - 1, totalRows);

  // Highlight text that matches the search query
  const highlightText = (text: string) => {
    if (!searchQuery.trim() || !text) return text;

    const parts = text.toString().split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase()
        ? <span key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded-sm">{part}</span>
        : part
    );
  };

  return (
    <Card className={cn('overflow-hidden', isFullScreen ? 'h-full flex flex-col' : '')}>
      <CardContent className={cn('p-0 overflow-auto', isFullScreen ? 'flex-1' : '')}>
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_0] shadow-border">
            <TableRow className="hover:bg-transparent">
              {headers.map((header) => (
                <TableHead
                  key={header}
                  className={cn(
                    'h-9 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap',
                    numericColumns[header] && 'text-right'
                  )}
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className={rowIndex % 2 === 1 ? 'bg-muted/30' : undefined}
              >
                {headers.map((header) => {
                  const value = row[header]?.toString() || '';
                  const numeric = numericColumns[header];
                  return (
                    <TableCell
                      key={`${rowIndex}-${header}`}
                      className={cn(
                        'px-3 py-1.5 text-sm',
                        numeric ? 'text-right tabular-nums' : 'max-w-[280px] truncate'
                      )}
                      title={!numeric && value.length > 30 ? value : undefined}
                    >
                      {searchQuery ? highlightText(value) : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <div className="border-t px-3 py-1.5 text-xs text-muted-foreground shrink-0">
        {searchQuery
          ? `Rows ${startRow}–${endRow} of ${totalRows} matching`
          : `Rows ${startRow}–${endRow} of ${totalRows}`}
      </div>
    </Card>
  );
};

export default DataTable;
