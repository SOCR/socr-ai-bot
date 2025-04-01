
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Upload, X, FileText } from 'lucide-react';

interface DataUploadProps {
  onDataUploaded: (data: any) => void;
}

const DataUpload: React.FC<DataUploadProps> = ({ onDataUploaded }) => {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check if it's a CSV or other accepted format
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.tsv') && !file.name.endsWith('.xlsx')) {
      toast({
        title: "Unsupported file format",
        description: "Please upload a CSV, TSV, or Excel file",
        variant: "destructive"
      });
      return;
    }
    
    setFile(file);
    
    // In a real implementation, we would parse the CSV file here
    // For now, just simulate uploading data
    toast({
      title: "File uploaded",
      description: `${file.name} has been uploaded successfully.`
    });
    
    // Simulated data for demonstration
    const mockData = {
      name: file.name,
      rows: 200,
      columns: 15,
      // We would actually parse the CSV here in a real implementation
      data: []
    };
    
    onDataUploaded(mockData);
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {!file ? (
          <div
            className={`border-2 border-dashed rounded-md p-6 text-center ${
              dragActive ? 'border-socr-blue bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm font-medium">
              Drag and drop your data file here, or click to select
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supports CSV, TSV, and Excel files (max 10MB)
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Select File
            </Button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".csv,.tsv,.xlsx"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="flex items-center p-2 border rounded-md bg-gray-50">
            <FileText className="h-6 w-6 text-socr-blue mr-2" />
            <span className="flex-1 truncate text-sm">{file.name}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-red-500"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataUpload;
