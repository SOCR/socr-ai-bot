import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GenerateTab from './GenerateTab';
import EdaTab from './EdaTab';
import AskTab from './AskTab';
import ReportTab from './ReportTab';

interface BasicTabProps {
  onOpenSettings: () => void;
  onDatasetChange?: (dataset: string | null, data: any | null) => void;
  selectedDataset?: string | null;
  uploadedData?: any | null;
  onNavigateToDataTab?: () => void;
}

const BasicTab: React.FC<BasicTabProps> = (props) => {
  const { selectedDataset, uploadedData } = props;

  return (
    <Tabs defaultValue="generate" className="w-full">
      <div className="container mx-auto pt-4">
        <TabsList>
          <TabsTrigger id="generate-subtab" value="generate">Generate</TabsTrigger>
          <TabsTrigger id="eda-subtab" value="eda">EDA</TabsTrigger>
          <TabsTrigger id="ask-subtab" value="ask">Ask</TabsTrigger>
          <TabsTrigger id="report-subtab" value="report">Report</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="generate">
        <GenerateTab {...props} />
      </TabsContent>

      <TabsContent value="eda">
        <EdaTab selectedDataset={selectedDataset ?? null} uploadedData={uploadedData ?? null} />
      </TabsContent>

      <TabsContent value="ask">
        <AskTab />
      </TabsContent>

      <TabsContent value="report">
        <ReportTab />
      </TabsContent>
    </Tabs>
  );
};

export default BasicTab;
