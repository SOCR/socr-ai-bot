
import React, { useState } from 'react';
import { Check, Copy, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
  showCopy?: boolean;
  showRun?: boolean;
  onRun?: () => void;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'r', 
  title,
  className,
  showCopy = true,
  showRun = false,
  onRun
}) => {
  const [copied, setCopied] = useState(false);
  const { theme, systemTheme } = useTheme();
  
  // Determine if we should use dark theme
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = () => {
    if (onRun) {
      onRun();
    }
  };

  // Custom style for R syntax highlighting
  const customStyle = {
    ...( isDark ? vscDarkPlus : vs ),
    'pre[class*="language-"]': {
      ...( isDark ? vscDarkPlus : vs )['pre[class*="language-"]'],
      background: isDark ? '#1e1e1e' : '#fafafa',
      fontSize: '14px',
      lineHeight: '1.5',
      padding: '1rem',
      margin: 0,
      overflow: 'auto',
    },
    'code[class*="language-"]': {
      ...( isDark ? vscDarkPlus : vs )['code[class*="language-"]'],
      background: 'transparent',
      fontSize: '14px',
      lineHeight: '1.5',
    }
  };

  return (
    <div className={cn(
      "relative rounded-lg overflow-hidden border",
      isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200",
      className
    )}>
      {(title || showCopy || showRun) && (
        <div className={cn(
          "px-4 py-2 flex justify-between items-center border-b",
          isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
        )}>
          <div className="flex items-center gap-2">
            {title && (
              <span className={cn(
                "font-mono text-sm font-medium",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                {title}
              </span>
            )}
            {language && (
              <span className={cn(
                "px-2 py-1 text-xs rounded-md font-mono",
                isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"
              )}>
                {language.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {showRun && onRun && (
              <button
                onClick={handleRun}
                className={cn(
                  "p-1.5 rounded-md transition-colors flex items-center gap-1 text-sm",
                  isDark 
                    ? "hover:bg-gray-700 text-green-400 hover:text-green-300" 
                    : "hover:bg-gray-200 text-green-600 hover:text-green-700"
                )}
                aria-label="Run code"
              >
                <Play size={14} />
                <span className="text-xs">Run</span>
              </button>
            )}
            {showCopy && (
              <button
                onClick={handleCopy}
                className={cn(
                  "p-1.5 rounded-md transition-colors flex items-center gap-1",
                  isDark 
                    ? "hover:bg-gray-700 text-gray-400 hover:text-gray-300" 
                    : "hover:bg-gray-200 text-gray-600 hover:text-gray-700"
                )}
                aria-label="Copy code"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="relative">
        <SyntaxHighlighter
          language={language}
          style={customStyle}
          customStyle={{
            margin: 0,
            background: isDark ? '#1e1e1e' : '#fafafa',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
          showLineNumbers={code.split('\n').length > 10}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: isDark ? '#6b7280' : '#9ca3af',
            borderRight: isDark ? '1px solid #374151' : '1px solid #e5e7eb',
            marginRight: '1em',
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
