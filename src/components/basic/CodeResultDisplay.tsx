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

// Function to clean debug output from R execution results
const cleanOutput = (text: string): string => {
  if (!text) return text;
  
  const lines = text.split('\n');
  const cleanedLines = lines.filter(line => {
    const trimmedLine = line.trim();
    
    // Remove debug messages and system messages we don't want to show to users
    const debugPatterns = [
      /^Executing user code:/,
      /^Created default dataset with columns:/,
      /^Error creating default dataset:/,
      /^Installing package:/,
      /^Attempting to install missing package:/,
      /^Successfully installed and loaded/,
      /^Failed to install package:/,
      /^Package .* is already installed/,
      /^Using base R for .* \(.*package not available\)/,
      /^Generating .* for .* variables/,
    ];
    
    // Keep the line if it doesn't match any debug pattern
    return !debugPatterns.some(pattern => pattern.test(trimmedLine));
  });
  
  // Remove any consecutive empty lines and trim
  return cleanedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
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
  // Clean the output first to remove debug messages, then format as markdown
  const cleanedOutput = cleanOutput(result.output);
  const formattedOutput = formatAsMarkdown(cleanedOutput);
  
  return (
    <Tabs defaultValue={result.error ? "code" : "results"} className="w-full">
      <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <TabsTrigger 
          value="code" 
          className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md px-4 py-2"
        >
          <span>💻</span>
          <span>AI Generated Code</span>
        </TabsTrigger>
        <TabsTrigger 
          value="results"
          className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md px-4 py-2"
        >
          <span>📊</span>
          <span>Results</span>
        </TabsTrigger>
        {result.datasetSummary && (
          <TabsTrigger 
            value="dataset"
            className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm rounded-md px-4 py-2"
          >
            <span>📋</span>
            <span>Dataset</span>
          </TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="code" className="code-result-display">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white flex items-center gap-2">
              <span>🤖 AI Generated R Code</span>
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This R code was generated by AI based on your request. Review and modify as needed.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <CodeBlock 
              code={result.code} 
              language="r" 
              title="Generated R Code"
              showCopy={true}
              className="border-0 rounded-none"
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="results" className="result-display">
        {result.error ? (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/40">
            <CardHeader>
              <CardTitle className="text-lg text-red-600 dark:text-red-300 flex items-center gap-2">
                <span>❌ Execution Error</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-red-600 font-medium dark:text-red-300">
                The code failed to execute with the following error:
              </p>
              
              <CodeBlock 
                code={result.error}
                language="text"
                title="Error Message"
                showCopy={true}
                className="border-red-200 dark:border-red-800"
              />
              
              <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">💡 Troubleshooting Tips:</h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                  <li>Check the generated code in the "AI Generated Code" tab for syntax errors</li>
                  <li>Ensure your dataset has the expected structure and column names</li>
                  <li>Try simplifying your request if the code is too complex</li>
                  <li>Some R packages may need additional time to install</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg dark:text-white flex items-center gap-2">
                <span>📊 Analysis Results</span>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Output from executing the AI-generated R code on your dataset.
              </p>
            </CardHeader>
            <CardContent className="dark:text-gray-300">
              {/* Enhanced results display with better code formatting */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 prose max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700 prose-pre:rounded-md prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700 prose-th:px-3 prose-th:py-2 prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 prose-td:px-3 prose-td:py-2 prose-hr:border-gray-300 dark:prose-hr:border-gray-700 prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-700 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-400 prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom component renderers for better table display
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
                      // Enhanced pre/code blocks
                      pre: ({node, ...props}) => (
                        <div className="my-4">
                          <CodeBlock 
                            code={String(props.children).replace(/\n$/, '')} 
                            language="r"
                            title="R Output"
                            showCopy={true}
                            className="border-0"
                          />
                        </div>
                      ),
                      code: ({node, className, children, ...props}: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !props.inline;
                        return !isInline && match ? (
                          <CodeBlock 
                            code={String(children).replace(/\n$/, '')} 
                            language={match[1]}
                            showCopy={true}
                            className="my-4"
                          />
                        ) : (
                          <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-mono" {...props}>
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
              
              {/* Enhanced plot display */}
              {result.plot && !result.output.toLowerCase().includes("summary statistic") && (
                <div className="mt-6">
                  <h3 className="text-base font-medium mb-3 dark:text-white flex items-center gap-2">
                    <span>📈 Generated Visualization</span>
                  </h3>
                  <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900 dark:border-gray-700 shadow-sm">
                    <img 
                      src={result.plot} 
                      alt="Generated plot visualization" 
                      className="max-w-full h-auto mx-auto rounded-md shadow-sm"
                    />
                  </div>
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
              <CardTitle className="text-lg dark:text-white flex items-center gap-2">
                <span>📋 Dataset Information</span>
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Overview of the dataset structure and sample data used in the analysis.
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-base font-medium mb-3 dark:text-white flex items-center gap-2">
                  <span>📊 Dataset Structure</span>
                </h3>
                <CodeBlock 
                  code={result.datasetSummary || 'No dataset structure information available'} 
                  language="r"
                  title="str(dataset) Output"
                  showCopy={true}
                />
              </div>
              
              {result.datasetRows && result.datasetRows.length > 0 && (
                <div>
                  <h3 className="text-base font-medium mb-3 dark:text-white flex items-center gap-2">
                    <span>👀 Dataset Preview</span>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">(first 20 rows)</span>
                  </h3>
                  <div className="border rounded-lg overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-800">
                            {Object.keys(result.datasetRows[0]).map((key) => (
                              <TableHead key={key} className="font-semibold text-gray-900 dark:text-gray-100">
                                {key}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.datasetRows.map((row, rowIndex) => (
                            <TableRow 
                              key={rowIndex}
                              className={rowIndex % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50"}
                            >
                              {Object.entries(row).map(([key, value], cellIndex) => (
                                <TableCell 
                                  key={`${rowIndex}-${cellIndex}`}
                                  className="font-mono text-sm"
                                >
                                  {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <CardFooter className="flex justify-end pt-4 px-0">
                    {onNavigateToDataTab && (
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2" 
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
