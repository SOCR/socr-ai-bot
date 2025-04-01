
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import CodeBlock from '../CodeBlock';

interface CodeResultDisplayProps {
  result: {
    code: string;
    output: string;
    error?: string;
    plot?: string;
  };
}

const CodeResultDisplay: React.FC<CodeResultDisplayProps> = ({ result }) => {
  return (
    <>
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg dark:text-white">AI Generated Code</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock code={result.code} language="r" />
        </CardContent>
      </Card>
      
      {result.error ? (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/40">
          <CardContent className="p-4">
            <p className="text-red-600 font-medium dark:text-red-300">Error:</p>
            <p className="font-mono text-sm dark:text-red-300">{result.error}</p>
          </CardContent>
        </Card>
      ) : (
        <>
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
        </>
      )}
    </>
  );
};

export default CodeResultDisplay;
