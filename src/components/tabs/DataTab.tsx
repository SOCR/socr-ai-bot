import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight, Maximize2, Minimize2, Database } from 'lucide-react';
import DataTable from '../DataTable';

interface DataTabProps {
  selectedDataset: string | null;
  uploadedData: any | null;
}

const DataTab: React.FC<DataTabProps> = ({ selectedDataset, uploadedData }) => {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [dataInfo, setDataInfo] = useState({ rows: 0, columns: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const rowsPerPage = 15;

  useEffect(() => {
    if (uploadedData) {
      setData(uploadedData.data || []);
      setDataInfo({
        rows: uploadedData.rows || 0,
        columns: uploadedData.columns || 0
      });
    } else {
      setData([]);
      setDataInfo({ rows: 0, columns: 0 });
    }
    // Reset pagination and search when data changes
    setCurrentPage(1);
    setSearchQuery('');
  }, [selectedDataset, uploadedData]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    return data.filter(row => {
      return Object.values(row).some(value =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [data, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className={isFullScreen ? 'fixed inset-0 z-50 bg-background p-4' : 'w-full px-4 md:px-6 py-6'}>
      <div className={isFullScreen ? 'h-full flex flex-col' : ''}>
        {data.length > 0 ? (
          <div id="data-toolbar" className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium truncate max-w-[16rem]" title={selectedDataset || uploadedData?.name || 'Dataset'}>
                {selectedDataset || uploadedData?.name || 'Dataset'}
              </span>
              <Badge variant="secondary">{dataInfo.rows.toLocaleString()} rows</Badge>
              <Badge variant="secondary">{dataInfo.columns} columns</Badge>
              {searchQuery && (
                <Badge variant="outline">{filteredData.length.toLocaleString()} matching</Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
              <div id="data-pagination-controls" className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground whitespace-nowrap px-1">
                  {currentPage} / {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-2"
                onClick={toggleFullScreen}
                title={isFullScreen ? "Exit full screen" : "View in full screen"}
              >
                {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ) : null}

        <div id="data-table-view" className={isFullScreen ? 'flex-1 min-h-0' : ''}>
          {data.length > 0 ? (
            <DataTable
              data={filteredData}
              paginatedData={paginatedData}
              searchQuery={searchQuery}
              totalRows={filteredData.length}
              isFullScreen={isFullScreen}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
            />
          ) : (
            <Card>
              <CardContent className="p-10">
                <p className="text-center text-muted-foreground">
                  Please select a dataset from the Generate sub-tab (under Basic) or upload your own data
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataTab;
