import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DatasetSelectorProps {
  onSelect: (value: string) => void;
  className?: string;
  placeholder?: string;
  datasetOptions?: { value: string; label: string }[];
}

const DatasetSelector: React.FC<DatasetSelectorProps> = ({ 
  onSelect, 
  className = '',
  placeholder = 'Select a dataset',
  datasetOptions = []
}) => {
  return (
    <div className={className}>
      <Select onValueChange={onSelect}>
        <SelectTrigger className="w-full dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="dark:bg-gray-800 dark:text-gray-200">
          {datasetOptions.map((dataset) => (
            <SelectItem key={dataset.value} value={dataset.value}>
              {dataset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DatasetSelector;
