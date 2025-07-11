import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeBlock from '../CodeBlock';
import apiService, { CodeChunk } from '@/lib/apiService';
import { useToast } from '@/components/ui/use-toast';

const ReportTab: React.FC = () => {
  const { toast } = useToast();
  const [codeChunks, setCodeChunks] = useState<CodeChunk[]>([]);
  const [selectedChunks, setSelectedChunks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('selection');
  const [hasLoadedChunks, setHasLoadedChunks] = useState(false);

  // Load code chunks from apiService when component mounts
  useEffect(() => {
    // Only load code chunks once to prevent duplication
    if (hasLoadedChunks) return;
    
    // Get ONLY the code chunks from the Basic Tab
    const allGeneratedCode = apiService.getAllGeneratedCode()
      .filter(chunk => chunk.tabSource === "Basic Tab");
    
    if (allGeneratedCode.length > 0) {
      setCodeChunks(allGeneratedCode);
      // By default, select all code chunks
      setSelectedChunks(allGeneratedCode.map(chunk => chunk.id));
      setHasLoadedChunks(true);
    } else {
      // If no code has been generated, display a message to the user
      toast({
        title: "No code generated yet",
        description: "Go to the Basic tab and use OpenAI or Gemini to generate and run R code first.",
        duration: 5000,
      });
      
      // Set some default empty chunks
      setCodeChunks([
        {
          id: 'empty-chunk',
          title: 'No Code Generated Yet',
          code: '# Go to the Basic tab and use OpenAI or Gemini to generate and run R code',
          output: 'No output available',
          tabSource: 'default',
          timestamp: Date.now()
        }
      ]);
      setSelectedChunks(['empty-chunk']);
      setHasLoadedChunks(true);
    }
  }, [toast, hasLoadedChunks]);

  // Group code chunks by their source tab for better organization (in case we have chunks from other tabs)
  const chunksByTab = codeChunks.reduce<Record<string, CodeChunk[]>>((acc, chunk) => {
    const tabName = chunk.tabSource || 'Unknown';
    if (!acc[tabName]) {
      acc[tabName] = [];
    }
    acc[tabName].push(chunk);
    return acc;
  }, {});

  const handleChunkToggle = (chunkId: string) => {
    setSelectedChunks(prev => 
      prev.includes(chunkId)
        ? prev.filter(id => id !== chunkId)
        : [...prev, chunkId]
    );
  };

  const handleSelectAll = (tabName: string) => {
    const tabChunkIds = chunksByTab[tabName].map(chunk => chunk.id);
    
    // If all chunks from this tab are already selected, deselect them all
    const allSelected = tabChunkIds.every(id => selectedChunks.includes(id));
    
    if (allSelected) {
      setSelectedChunks(prev => prev.filter(id => !tabChunkIds.includes(id)));
    } else {
      // Add all the tab's chunk IDs to selected chunks, avoiding duplicates
      setSelectedChunks(prev => Array.from(new Set([...prev, ...tabChunkIds])));
    }
  };

  const handleRefresh = () => {
    // Force a refresh of the code chunks
    setHasLoadedChunks(false);
  };

  const downloadRMarkdown = () => {
    const selectedCodeChunks = codeChunks.filter(chunk => 
      selectedChunks.includes(chunk.id)
    );
    
    if (selectedCodeChunks.length === 0 || (selectedCodeChunks.length === 1 && selectedCodeChunks[0].id === 'empty-chunk')) {
      toast({
        title: "No code chunks selected",
        description: "Please select at least one code chunk to include in the report.",
        variant: "destructive",
      });
      return;
    }
    
    let rmdContent = `---
title: "SOCR AI Bot Report"
author: "Generated by SOCR AI Bot"
date: "${new Date().toLocaleDateString()}"
output: html_document
---

\`\`\`{r setup, include=FALSE}
knitr::opts_chunk$set(echo = TRUE)
\`\`\`

## Data Analysis Report

This report was automatically generated by the SOCR AI Bot containing R code generated by AI models.

`;

    // Group code chunks by their source tab
    const chunksByTabForDownload: Record<string, CodeChunk[]> = {};
    selectedCodeChunks.forEach(chunk => {
      if (!chunksByTabForDownload[chunk.tabSource]) {
        chunksByTabForDownload[chunk.tabSource] = [];
      }
      chunksByTabForDownload[chunk.tabSource].push(chunk);
    });

    // Create sections for each tab
    Object.entries(chunksByTabForDownload).forEach(([tabSource, tabChunks]) => {
      // Skip the default tab
      if (tabSource === 'default') return;
      
      // Create a section header for the tab
      rmdContent += `## ${tabSource} Analysis\n\n`;
      
      // Add all code chunks from this tab
      tabChunks.forEach(chunk => {
        rmdContent += `### ${chunk.title}\n\n\`\`\`{r}\n${chunk.code}\n\`\`\`\n\n`;
        if (chunk.output) {
          rmdContent += `Output:\n\n\`\`\`\n${chunk.output}\n\`\`\`\n\n`;
        }
        if (chunk.plot) {
          rmdContent += `*Plot visualization available in the R environment*\n\n`;
        }
      });
    });
    
    const blob = new Blob([rmdContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'socr_ai_bot_report.Rmd';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report downloaded",
      description: "Your RMarkdown report has been downloaded successfully.",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-3xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">AI-Generated Code Report</CardTitle>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              Refresh Code
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="w-full">
                <TabsTrigger value="selection">Chunk Selection</TabsTrigger>
                <TabsTrigger value="preview">RMarkdown Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="selection" className="space-y-4">
                <div className="space-y-4">
                  {Object.entries(chunksByTab).map(([tabName, chunks]) => (
                    tabName !== 'default' && (
                      <div key={tabName} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">{tabName} ({chunks.length})</h3>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSelectAll(tabName)}
                          >
                            {chunks.every(chunk => selectedChunks.includes(chunk.id)) 
                              ? 'Deselect All' 
                              : 'Select All'}
                          </Button>
                        </div>
                        <div className="space-y-1 ml-4">
                          {chunks.map(chunk => (
                            <div key={chunk.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={chunk.id}
                                checked={selectedChunks.includes(chunk.id)}
                                onCheckedChange={() => handleChunkToggle(chunk.id)}
                              />
                              <Label htmlFor={chunk.id} className="text-sm">
                                {chunk.title}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  ))}
                  
                  {Object.keys(chunksByTab).filter(tabName => tabName !== 'default').length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No code has been generated from the Basic Tab yet.</p>
                      <p className="text-muted-foreground mt-1">Go to the Basic tab and use OpenAI or Gemini to generate R code.</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={downloadRMarkdown}>
                    <Download className="mr-2 h-4 w-4" />
                    Download RMarkdown
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border">
                  <CodeBlock 
                    code={`---
title: "SOCR AI Bot Report"
author: "Generated by SOCR AI Bot"
date: "${new Date().toLocaleDateString()}"
output: html_document
---

\`\`\`{r setup, include=FALSE}
knitr::opts_chunk$set(echo = TRUE)
\`\`\`

## Data Analysis Report

This report was automatically generated by the SOCR AI Bot containing R code generated by AI models.

${Object.entries(chunksByTab)
  .filter(([tabName]) => tabName !== 'default')
  .map(([tabName, chunks]) => {
    const selectedTabChunks = chunks.filter(chunk => selectedChunks.includes(chunk.id));
    if (selectedTabChunks.length === 0) return '';
    
    return `## ${tabName} Analysis\n\n` + 
      selectedTabChunks.map(chunk => `### ${chunk.title}

\`\`\`{r}
${chunk.code}
\`\`\`

${chunk.output ? `Output:

\`\`\`
${chunk.output}
\`\`\`
` : ''}
`).join('\n\n');
  }).join('\n\n')}`}
                    language="markdown"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={downloadRMarkdown}>
                    <Download className="mr-2 h-4 w-4" />
                    Download RMarkdown
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportTab;
