import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CodeBlock from '../CodeBlock';
import apiService from '@/lib/apiService';
import { executeRCode } from '@/lib/webr';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

interface EdaTabProps {
  selectedDataset: string | null;
  uploadedData: any | null;
}

interface AnalysisResult {
  code: string;
  output: string;
  plot?: string;
  error?: string;
  loading: boolean;
}

const EdaTab: React.FC<EdaTabProps> = ({ selectedDataset, uploadedData }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [hasAddedCode, setHasAddedCode] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // State for each analysis type
  const [basicAnalysis, setBasicAnalysis] = useState<AnalysisResult>({
    code: 'summary(df)',
    output: '',
    loading: false
  });
  
  const [detailedSummary, setDetailedSummary] = useState<AnalysisResult>({
    code: `# Create a detailed summary using base R functions as a fallback
# Try to load summarytools if available
if (requireNamespace("summarytools", quietly = TRUE)) {
  library(summarytools)
  dfSummary(df)
} else {
  # Fallback to base R if summarytools is not available
  cat("Using base R for detailed summary (summarytools package not available)\n\n")
  # Structure of the dataframe
  str(df)
  
  # Summary statistics for each column
  cat("\n--- Summary Statistics ---\n")
  print(summary(df))
  
  # Count NA values in each column
  cat("\n--- Missing Values ---\n")
  na_counts <- sapply(df, function(x) sum(is.na(x)))
  print(na_counts)
  
  # Column types
  cat("\n--- Column Types ---\n")
  col_types <- sapply(df, class)
  print(col_types)
  
  # First few rows
  cat("\n--- First Rows ---\n")
  print(head(df))
}`,
    output: '',
    loading: false
  });
  
  const [tableOne, setTableOne] = useState<AnalysisResult>({
    code: `# Create a table one using the tableone package if available
if (requireNamespace("tableone", quietly = TRUE)) {
  library(tableone)
  vars <- names(df) # all variables in the dataset
  tableOne <- CreateTableOne(vars = vars, data = df)
  print(tableOne)
} else {
  # Fallback to base R if tableone is not available
  cat("Using base R for Table One (tableone package not available)\n\n")
  
  # Identify variable types
  cat("--- Variable Types ---\n")
  var_types <- sapply(df, function(x) {
    if (is.numeric(x)) return("Continuous")
    if (is.factor(x) || is.character(x) || is.logical(x)) return("Categorical")
    return("Other")
  })
  print(var_types)
  
  # Summary for continuous variables
  cont_vars <- names(which(var_types == "Continuous"))
  if (length(cont_vars) > 0) {
    cat("\n--- Continuous Variables ---\n")
    cont_summary <- do.call(rbind, lapply(cont_vars, function(v) {
      values <- df[[v]]
      if (all(is.na(values))) {
        return(c(v, NA, NA, NA, NA, NA, sum(is.na(values))))
      }
      c(
        v,
        mean(values, na.rm = TRUE),
        sd(values, na.rm = TRUE),
        min(values, na.rm = TRUE),
        median(values, na.rm = TRUE),
        max(values, na.rm = TRUE),
        sum(is.na(values))
      )
    }))
    colnames(cont_summary) <- c("Variable", "Mean", "SD", "Min", "Median", "Max", "Missing")
    print(cont_summary)
  }
  
  # Summary for categorical variables
  cat_vars <- names(which(var_types == "Categorical"))
  if (length(cat_vars) > 0) {
    cat("\n--- Categorical Variables ---\n")
    for (v in cat_vars) {
      cat("\n", v, ":\n", sep="")
      if (all(is.na(df[[v]]))) {
        cat("All values are NA\n")
      } else {
        print(table(df[[v]], useNA = "ifany"))
        cat("Missing:", sum(is.na(df[[v]])), "\n")
      }
    }
  }
}`,
    output: '',
    loading: false
  });
  
  const [categoricalAnalysis, setCategoricalAnalysis] = useState<AnalysisResult>({
    code: `# Analyze categorical variables
if (requireNamespace("DataExplorer", quietly = TRUE)) {
  # Use DataExplorer if available
  library(DataExplorer)
  # Check if we need ggplot2 explicitly
  if (!requireNamespace("ggplot2", quietly = TRUE)) {
    install.packages("ggplot2", repos = "https://cloud.r-project.org/")
    library(ggplot2)
  } else {
    library(ggplot2)
  }
  
  # Simplified plotting code without theme customizations that might cause errors
  plot_bar(df)
} else {
  # Fallback to base R for categorical variable visualization
  cat("Using base R for categorical plots (DataExplorer package not available)\n\n")
  
  # Identify categorical variables (factor, character, logical)
  cat_vars <- names(df)[sapply(df, function(x) {
    is.factor(x) || is.character(x) || is.logical(x) || 
    (is.numeric(x) && length(unique(x)) <= 10)
  })]
  
  if (length(cat_vars) == 0) {
    cat("No categorical variables detected in the dataset\n")
  } else {
    # Create a color palette
    color_palette <- c("#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", 
                       "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab")
    
    # Set up the plot layout based on number of variables
    n_vars <- length(cat_vars)
    n_cols <- min(2, n_vars)
    n_rows <- ceiling(n_vars / n_cols)
    
    # Set white background
    par(mfrow = c(n_rows, n_cols), mar = c(4, 4, 3, 2))
    
    # Create bar plots for each categorical variable
    for (i in 1:length(cat_vars)) {
      var <- cat_vars[i]
      # Count frequencies
      if (is.factor(df[[var]]) || is.character(df[[var]]) || is.logical(df[[var]])) {
        counts <- table(df[[var]], useNA = "ifany")
        # Create colorful barplot
        color_index <- (i-1) %% length(color_palette) + 1
        barplot(counts, main=var, las=2, cex.names=0.7, 
                col=color_palette[color_index], 
                border="white")
      } else if (is.numeric(df[[var]])) {
        # For numeric variables with few distinct values
        color_index <- (i-1) %% length(color_palette) + 1
        hist(df[[var]], main=paste("Distribution of", var), 
             xlab=var, breaks=min(length(unique(df[[var]])), 10),
             col=color_palette[color_index], border="white")
      }
    }
  }
}`,
    output: '',
    loading: false
  });
  
  const [numericalAnalysis, setNumericalAnalysis] = useState<AnalysisResult>({
    code: `# Analyze numerical variables
if (requireNamespace("DataExplorer", quietly = TRUE)) {
  # Use DataExplorer if available
  library(DataExplorer)
  # Check if we need ggplot2 explicitly
  if (!requireNamespace("ggplot2", quietly = TRUE)) {
    install.packages("ggplot2", repos = "https://cloud.r-project.org/")
    library(ggplot2)
  } else {
    library(ggplot2)
  }
  
  # Use simplified plotting without complex theming
  # First plot: QQ plots
  plot_qq(df)
  
  # Second plot: histograms
  plot_histogram(df)
} else {
  # Fallback to base R for numerical variable visualization
  cat("Using base R for numerical plots (DataExplorer package not available)\n\n")
  
  # Identify numerical variables
  num_vars <- names(df)[sapply(df, is.numeric)]
  
  if (length(num_vars) == 0) {
    cat("No numerical variables detected in the dataset\n")
  } else {
    # Create a color palette for the plots
    hist_colors <- c("#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f", 
                    "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab")
    
    # Set up the plot layout based on number of variables
    n_vars <- length(num_vars)
    max_plots <- min(n_vars, 8) # Limit to maximum 8 plots
    n_cols <- min(2, max_plots)
    n_rows <- ceiling(max_plots / n_cols)
    
    # First set of plots: Histograms
    par(mfrow = c(n_rows, n_cols), mar = c(4, 4, 3, 2))
    cat("Generating histograms for numerical variables\n")
    
    # Create histograms with improved colors
    for (i in 1:max_plots) {
      var <- num_vars[i]
      color_index <- (i-1) %% length(hist_colors) + 1
      hist(df[[var]], 
           main=paste("Histogram of", var), 
           xlab=var, 
           col=hist_colors[color_index], 
           border="white")
    }
    
    # Second set of plots: QQ plots with colored points
    par(mfrow = c(n_rows, n_cols), mar = c(4, 4, 3, 2))
    cat("\nGenerating QQ plots for numerical variables\n")
    
    # Create QQ plots with improved colors
    for (i in 1:max_plots) {
      var <- num_vars[i]
      color_index <- (i-1) %% length(hist_colors) + 1
      qqnorm(df[[var]], 
             main=paste("QQ Plot of", var),
             pch=19, # Solid circle points
             col=hist_colors[color_index])
      qqline(df[[var]], col="red", lwd=2)
    }
  }
}`,
    output: '',
    loading: false
  });
  
  const [correlationAnalysis, setCorrelationAnalysis] = useState<AnalysisResult>({
    code: `# Create correlation plot
# Filter for numeric columns only
num_df <- df[, sapply(df, is.numeric)]

# Check if we have enough numeric columns
if (ncol(num_df) > 1) {
  if (requireNamespace("corrplot", quietly = TRUE)) {
    # Use corrplot if available
    library(corrplot)
    correlation_matrix <- cor(num_df, use = "complete.obs")
    corrplot(correlation_matrix, method = "circle")
  } else {
    # Fallback to base R for correlation visualization
    cat("Using base R for correlation plot (corrplot package not available)\n\n")
    
    # Compute the correlation matrix
    correlation_matrix <- cor(num_df, use = "complete.obs")
    
    # Print the correlation matrix
    cat("Correlation Matrix:\n")
    print(round(correlation_matrix, 2))
    
    # Create a simple visualization with base R
    par(mar = c(10, 10, 4, 10)) # Adjust margins for labels
    image(1:ncol(correlation_matrix), 1:nrow(correlation_matrix), 
          t(correlation_matrix), 
          col = colorRampPalette(c("blue", "white", "red"))(100),
          axes = FALSE, main = "Correlation Matrix")
    
    # Add axis labels
    axis(1, 1:ncol(correlation_matrix), colnames(correlation_matrix), las = 2, cex.axis = 0.7)
    axis(2, 1:nrow(correlation_matrix), rownames(correlation_matrix), las = 2, cex.axis = 0.7)
    
    # Add correlation values
    text(expand.grid(1:ncol(correlation_matrix), 1:nrow(correlation_matrix)),
         labels = round(c(correlation_matrix), 2),
         cex = 0.6)
  }
} else {
  message("Not enough numeric columns for correlation analysis")
}`
    ,
    output: '',
    loading: false
  });

  // Execute analysis when tab is selected or data changes
  useEffect(() => {
    const runAnalysis = async () => {
      if (!selectedDataset && !uploadedData) return;
      
      // Set all analyses to match the current dataset
      if (!hasAddedCode) {
        setHasAddedCode(true);
        setIsInitializing(true);
        
        try {
          // Run basic analysis first
          await executeAnalysis('basic');
          toast({
            title: "Data loaded",
            description: "Basic analysis completed. Other analyses will run when you view their tabs."
          });
        } catch (error) {
          console.error("Error running initial analysis:", error);
          toast({
            title: "Analysis Error",
            description: "Failed to run initial analysis. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsInitializing(false);
        }
      }
    };
    
    runAnalysis();
  }, [selectedDataset, uploadedData]);
  
  // Execute analysis when tab changes
  useEffect(() => {
    if (activeTab !== 'basic' && !isInitializing) {
      executeAnalysis(activeTab);
    }
  }, [activeTab]);
  
  const executeAnalysis = async (tabName: string) => {
    if (!selectedDataset && !uploadedData) return;
    
    let codeToExecute = '';
    let setStateAction: React.Dispatch<React.SetStateAction<AnalysisResult>> | null = null;
    let currentState: AnalysisResult | null = null;
    
    // Determine which analysis to run
    switch (tabName) {
      case 'basic':
        codeToExecute = basicAnalysis.code;
        setStateAction = setBasicAnalysis;
        currentState = basicAnalysis;
        break;
      case 'summary':
        codeToExecute = detailedSummary.code;
        setStateAction = setDetailedSummary;
        currentState = detailedSummary;
        break;
      case 'table1':
        codeToExecute = tableOne.code;
        setStateAction = setTableOne;
        currentState = tableOne;
        break;
      case 'categorical':
        codeToExecute = categoricalAnalysis.code;
        setStateAction = setCategoricalAnalysis;
        currentState = categoricalAnalysis;
        break;
      case 'numerical':
        codeToExecute = numericalAnalysis.code;
        setStateAction = setNumericalAnalysis;
        currentState = numericalAnalysis;
        break;
      case 'correlation':
        codeToExecute = correlationAnalysis.code;
        setStateAction = setCorrelationAnalysis;
        currentState = correlationAnalysis;
        break;
    }
    
    // Skip if already loaded or loading
    if (!setStateAction || currentState?.loading || (currentState?.output && currentState?.plot)) {
      return;
    }
    
    // Set loading state
    setStateAction(prev => ({ ...prev, loading: true }));
    
    try {
      // Execute the R code using WebR
      const result = await executeRCode(
        codeToExecute, 
        selectedDataset, 
        uploadedData
      );
      
      // Store the results
      if (result.success) {
        setStateAction({
          code: codeToExecute,
          output: result.output || 'Analysis completed successfully.',
          plot: result.plot,
          loading: false
        });
        
        // Update the code in apiService for tracking
        apiService.addGeneratedCode({
          title: `EDA: ${tabName}`,
          code: codeToExecute,
          output: result.output || '',
          plot: result.plot,
          tabSource: 'EDA Tab'
        });
      } else {
        setStateAction({
          code: codeToExecute,
          output: '',
          error: result.error || 'An error occurred during analysis',
          loading: false
        });
        
        console.error(`Error in ${tabName} analysis:`, result.error);
      }
    } catch (error) {
      console.error(`Error executing ${tabName} analysis:`, error);
      setStateAction({
        code: codeToExecute,
        output: '',
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        loading: false
      });
    }
  };
  
  // Retry a failed analysis
  const handleRetry = (tabName: string) => {
    executeAnalysis(tabName);
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            Exploratory Data Analysis: {selectedDataset || (uploadedData?.name || 'No dataset selected')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedDataset && !uploadedData ? (
            <Alert>
              <AlertTitle>No dataset selected</AlertTitle>
              <AlertDescription>
                Please select a dataset from the Basic tab or upload your own data to perform exploratory data analysis.
              </AlertDescription>
            </Alert>
          ) : isInitializing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Initializing analysis environment...</p>
              <p className="text-sm text-muted-foreground">This may take a moment while required packages are installed</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="w-full grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="table1">Table 1</TabsTrigger>
                <TabsTrigger value="categorical">Categorical</TabsTrigger>
                <TabsTrigger value="numerical">Numerical</TabsTrigger>
                <TabsTrigger value="correlation">Correlation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Basic Data Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {basicAnalysis.loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : basicAnalysis.error ? (
                      <div className="space-y-4">
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{basicAnalysis.error}</AlertDescription>
                        </Alert>
                        <Button onClick={() => handleRetry('basic')}>Retry Analysis</Button>
                      </div>
                    ) : (
                      <CodeBlock 
                        code={basicAnalysis.output} 
                        language="r" 
                        title="Basic Analysis Results"
                        showCopy={true}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="summary" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Detailed Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Generated by the summarytools package using the command: summarytools::dfSummary(df).</p>
                    {detailedSummary.loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : detailedSummary.error ? (
                      <div className="space-y-4">
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{detailedSummary.error}</AlertDescription>
                        </Alert>
                        <Button onClick={() => handleRetry('summary')}>Retry Analysis</Button>
                      </div>
                    ) : (
                      <div className="mt-4 border rounded p-4 bg-gray-50">
                        <CodeBlock 
                          code={detailedSummary.output} 
                          language="r" 
                          title="Detailed Summary Results"
                          showCopy={true}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="table1" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Table One</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Generated by the CreateTableOne() function in the 
                      <a href="https://cran.r-project.org/web/packages/tableone/vignettes/introduction.html" target="_blank" rel="noreferrer" className="text-socr-blue hover:underline ml-1">
                        tableone
                      </a> 
                      package.
                    </p>
                    {tableOne.loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : tableOne.error ? (
                      <div className="space-y-4">
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{tableOne.error}</AlertDescription>
                        </Alert>
                        <Button onClick={() => handleRetry('table1')}>Retry Analysis</Button>
                      </div>
                    ) : (
                      <div className="mt-4 border rounded p-4 bg-gray-50">
                        <CodeBlock 
                          code={tableOne.output} 
                          language="r" 
                          title="Table One Results"
                          showCopy={true}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="categorical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Categorical Variables</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Categorical plots generated by 'plot_bar()' in the package 
                      <a href="https://cran.r-project.org/web/packages/DataExplorer/vignettes/dataexplorer-intro.html" target="_blank" rel="noreferrer" className="text-socr-blue hover:underline ml-1">
                        DataExplorer
                      </a>.
                    </p>
                    {categoricalAnalysis.loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : categoricalAnalysis.error ? (
                      <div className="space-y-4">
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{categoricalAnalysis.error}</AlertDescription>
                        </Alert>
                        <Button onClick={() => handleRetry('categorical')}>Retry Analysis</Button>
                      </div>
                    ) : (
                      <div className="mt-4 border rounded p-4 bg-gray-50 flex justify-center">
                        {categoricalAnalysis.plot ? (
                          <img 
                            src={categoricalAnalysis.plot} 
                            alt="Categorical variables plot" 
                            className="max-w-full h-auto"
                          />
                        ) : (
                          <p className="text-center text-muted-foreground py-8">No plot generated</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="numerical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Numerical Variables</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Quantile-quantile plots and histograms using 'plot_qq()' and 'plot_histogram()' in package 
                      <a href="https://cran.r-project.org/web/packages/DataExplorer/vignettes/dataexplorer-intro.html" target="_blank" rel="noreferrer" className="text-socr-blue hover:underline ml-1">
                        DataExplorer
                      </a>.
                    </p>
                    {numericalAnalysis.loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : numericalAnalysis.error ? (
                      <div className="space-y-4">
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{numericalAnalysis.error}</AlertDescription>
                        </Alert>
                        <Button onClick={() => handleRetry('numerical')}>Retry Analysis</Button>
                      </div>
                    ) : (
                      <div className="mt-4 border rounded p-4 bg-gray-50 flex justify-center">
                        {numericalAnalysis.plot ? (
                          <img 
                            src={numericalAnalysis.plot} 
                            alt="Numerical variables plot" 
                            className="max-w-full h-auto"
                          />
                        ) : (
                          <p className="text-center text-muted-foreground py-8">No plot generated</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="correlation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Correlation Map</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Correlation plot using 'corrplot()' in package 
                      <a href="https://cran.r-project.org/web/packages/corrplot/vignettes/corrplot-intro.html" target="_blank" rel="noreferrer" className="text-socr-blue hover:underline ml-1">
                        corrplot
                      </a>.
                    </p>
                    {correlationAnalysis.loading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : correlationAnalysis.error ? (
                      <div className="space-y-4">
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{correlationAnalysis.error}</AlertDescription>
                        </Alert>
                        <Button onClick={() => handleRetry('correlation')}>Retry Analysis</Button>
                      </div>
                    ) : (
                      <div className="mt-4 border rounded p-4 bg-gray-50 flex justify-center">
                        {correlationAnalysis.plot ? (
                          <img 
                            src={correlationAnalysis.plot} 
                            alt="Correlation map" 
                            className="max-w-full h-auto"
                          />
                        ) : (
                          <p className="text-center text-muted-foreground py-8">No plot generated or not enough numeric variables</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EdaTab;
