import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
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
    if (selectedDataset && uploadedData) {
      // We now have the data in uploadedData
      setData(uploadedData.data || []);
      setDataInfo({
        rows: uploadedData.rows || 0,
        columns: uploadedData.columns || 0
      });
    } else if (uploadedData) {
      // Directly uploaded data
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
    <div className={`container mx-auto py-6 ${isFullScreen ? 'fixed inset-0 z-50 bg-background p-6' : ''}`}>
      <div className={`${isFullScreen ? 'h-full flex flex-col' : ''}`}>
        <Card className="mb-4">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle className="text-lg">Dataset Information</CardTitle>
              {data.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Current data tensor ({selectedDataset || (uploadedData?.name || 'None')}) dimensions: {dataInfo.rows} rows X {dataInfo.columns} columns
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleFullScreen} 
              title={isFullScreen ? "Exit full screen" : "View in full screen"}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {data.length > 0 ? (
              <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search data..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              <p>No dataset selected or uploaded</p>
            )}
          </CardContent>
        </Card>

        <div className={`overflow-hidden ${isFullScreen ? 'flex-1' : ''}`}>
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
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Please select a dataset from the Basic tab or upload your own data
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
