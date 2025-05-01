import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import CodeBlock from '../CodeBlock';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// A helper function to determine if content is likely markdown
const isMarkdown = (text: string): boolean => {
  // Check for common markdown patterns
  const markdownPatterns = [
    /^#+\s+.+$/m,                  // Headers
    /\*\*.+\*\*/,                  // Bold
    /\*.+\*/,                      // Italic
    /\[.+\]\(.+\)/,                // Links
    /^>\s+.+$/m,                   // Blockquotes
    /^-\s+.+$/m,                   // Unordered lists
    /^[0-9]+\.\s+.+$/m,            // Ordered lists
    /^(\|.+\|)+$/m,                // Tables
    /^---$/m,                      // Horizontal rule
    /```[\s\S]*?```/,              // Code blocks
    /^.*\|.*\|.*$/m                // Table row
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
};

// Function to format text as markdown if it doesn't already have markdown formatting
const formatAsMarkdown = (text: string): string => {
  if (isMarkdown(text)) {
    return text;
  }
  
  // Add basic markdown formatting to plain text
  // Split by new lines and format as paragraphs
  const lines = text.split('\n');
  const formattedLines = lines.map(line => {
    line = line.trim();
    if (!line) return '';
    
    // Check if line is a heading candidate (all caps or ends with a colon)
    if (line.toUpperCase() === line && line.length > 3) {
      return `### ${line}`;
    } else if (line.endsWith(':')) {
      return `**${line}**`;
    }
    
    return line;
  });
  
  return formattedLines.join('\n\n').trim();
};

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
  // Format the output as markdown
  const formattedOutput = formatAsMarkdown(result.output);
  
  return (
    <Tabs defaultValue={result.error ? "code" : "results"} className="w-full">
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
        {result.error ? (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/40">
            <CardHeader>
              <CardTitle className="text-lg text-red-600 dark:text-red-300">Execution Error</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-red-600 font-medium mb-2 dark:text-red-300">The code failed to execute with the following error:</p>
              <p className="font-mono text-sm bg-red-50 p-3 rounded dark:bg-red-900/30 dark:text-red-300">{result.error}</p>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                You can modify the code in the "AI Generated Code" tab and try again.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg dark:text-white">Results</CardTitle>
            </CardHeader>
            <CardContent className="dark:text-gray-300">
              {/* Markdown results box with improved styling */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 prose max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700 prose-pre:rounded-md prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700 prose-th:px-3 prose-th:py-2 prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 prose-td:px-3 prose-td:py-2 prose-hr:border-gray-300 dark:prose-hr:border-gray-700 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-400 prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom component renderers
                      table: ({node, ...props}) => (
                        <div className="overflow-x-auto my-4">
                          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700" {...props} />
                        </div>
                      ),
                      thead: ({node, ...props}) => (
                        <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
                      ),
                      th: ({node, ...props}) => (
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100" {...props} />
                      ),
                      td: ({node, ...props}) => (
                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500 dark:text-gray-400" {...props} />
                      ),
                      pre: ({node, ...props}) => (
                        <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-x-auto" {...props} />
                      ),
                      code: ({node, inline, className, children, ...props}) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <CodeBlock code={String(children).replace(/\n$/, '')} language={match[1]} />
                        ) : (
                          <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm" {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {formattedOutput}
                  </ReactMarkdown>
                </div>
              </div>
              
              {/* Only show plot if it exists and we're not showing summary statistics */}
              {result.plot && !result.output.toLowerCase().includes("summary statistic") && (
                <div className="border rounded-md p-2 bg-gray-50 dark:bg-gray-900 dark:border-gray-700 mt-4">
                  <img 
                    src={result.plot} 
                    alt="Plot visualization" 
                    className="max-w-full h-auto mx-auto"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
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
  );
};

export default CodeResultDisplay;
