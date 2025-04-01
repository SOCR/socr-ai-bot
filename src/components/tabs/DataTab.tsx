
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DataTable from '../DataTable';
import { sampleData } from '@/lib/demoData';

interface DataTabProps {
  selectedDataset: string | null;
  uploadedData: any | null;
}

const DataTab: React.FC<DataTabProps> = ({ selectedDataset, uploadedData }) => {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [dataInfo, setDataInfo] = useState({ rows: 0, columns: 0 });

  useEffect(() => {
    if (selectedDataset && sampleData[selectedDataset as keyof typeof sampleData]) {
      const datasetArray = sampleData[selectedDataset as keyof typeof sampleData];
      setData(datasetArray);
      setDataInfo({
        rows: datasetArray.length,
        columns: Object.keys(datasetArray[0] || {}).length
      });
    } else if (uploadedData) {
      // In a real implementation, we would use the actual uploaded data
      setData(uploadedData.data || []);
      setDataInfo({
        rows: uploadedData.rows || 0,
        columns: uploadedData.columns || 0
      });
    } else {
      setData([]);
      setDataInfo({ rows: 0, columns: 0 });
    }
  }, [selectedDataset, uploadedData]);

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Dataset Information</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <p>
              Dataset: <span className="font-medium">{selectedDataset || (uploadedData?.name || 'None')}</span> | 
              Rows: <span className="font-medium">{dataInfo.rows}</span> | 
              Columns: <span className="font-medium">{dataInfo.columns}</span>
            </p>
          ) : (
            <p>No dataset selected or uploaded</p>
          )}
        </CardContent>
      </Card>

      <div className="overflow-hidden">
        {data.length > 0 ? (
          <DataTable data={data} limit={100} />
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
  );
};

export default DataTab;
