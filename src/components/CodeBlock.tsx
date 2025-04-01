
import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'r', 
  title,
  className 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative rounded-lg overflow-hidden bg-gray-900 text-white", className)}>
      {title && (
        <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <span className="font-mono text-sm">{title}</span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
              aria-label="Copy code"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
