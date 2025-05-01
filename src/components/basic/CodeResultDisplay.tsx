import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import CodeBlock from '../CodeBlock';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface CodeResultDisplayProps {
  result: {
    code: string;
    output: string;
    error?: string;
    plot?: string;
    datasetSummary?: string;
    datasetRows?: Record<string, any>[];
  };
  onNavigateToDataTab?: () => void;
}

const CodeResultDisplay: React.FC<CodeResultDisplayProps> = ({ result, onNavigateToDataTab }) => {
  return (
    <>
      {result.error ? (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/40">
          <CardContent className="p-4">
            <p className="text-red-600 font-medium dark:text-red-300">Error:</p>
            <p className="font-mono text-sm dark:text-red-300">{result.error}</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="mb-2">
            <TabsTrigger value="code">AI Generated Code</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            {result.datasetSummary && <TabsTrigger value="dataset">Dataset</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="code" className="code-result-display">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">AI Generated Code</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={result.code} language="r" />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results" className="result-display">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg dark:text-white">Results</CardTitle>
              </CardHeader>
              <CardContent className="dark:text-gray-300">
                <p className="mb-4">{result.output}</p>
                {result.plot && (
                  <div className="border rounded-md p-2 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                    <img 
                      src={result.plot} 
                      alt="Plot visualization" 
                      className="max-w-full h-auto mx-auto"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {result.datasetSummary && (
            <TabsContent value="dataset" className="dataset-display">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">Dataset Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h3 className="text-base font-medium mb-2 dark:text-white">Dataset Structure</h3>
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md font-mono text-sm whitespace-pre-wrap overflow-x-auto dark:text-gray-300">
                      {result.datasetSummary}
                    </div>
                  </div>
                  
                  {result.datasetRows && result.datasetRows.length > 0 && (
                    <div>
                      <h3 className="text-base font-medium mb-2 dark:text-white">Dataset Preview (first 20 rows)</h3>
                      <div className="border rounded-md overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {Object.keys(result.datasetRows[0]).map((key) => (
                                <TableHead key={key}>{key}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.datasetRows.map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {Object.entries(row).map(([key, value], cellIndex) => (
                                  <TableCell key={`${rowIndex}-${cellIndex}`}>
                                    {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <CardFooter className="flex justify-end pt-4 px-0">
                        {onNavigateToDataTab && (
                          <Button 
                            variant="outline" 
                            className="flex items-center gap-1" 
                            onClick={onNavigateToDataTab}
                          >
                            <span>View Full Dataset</span> 
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </CardFooter>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}
    </>
  );
};

export default CodeResultDisplay;
