import { WebR } from 'webr';

export const webR = new WebR();

export async function initWebR() {
  await webR.init();
}

async function getRandomNumbers() { //for testing only
    await webR.init();
    const result = await webR.evalR('rnorm(20,10,10)');
    try {
      return await result;
    } finally {
      webR.destroy(result);
    }
  }


export async function listDatasets(): Promise<{ value: string; label: string }[]> {
  await initWebR();           // no-op if already initialised

  /* Ask R for the catalogue and use dataset name for both value and label */
  const robj = await webR.evalR(`
    ds <- unique(as.character(data()$results[, "Item"]))
    ds <- sub(" .*$", "", ds)
    df <- data.frame(value = sort(ds), label = sort(ds), stringsAsFactors = FALSE)
    df
  `);
  const result = await (robj as any).toD3();
  webR.destroy(robj);
  return result;
}

export async function fetchDataset(name: string): Promise<{rows: Record<string, unknown>[], summary: string}> {
  await initWebR();

  try {
    /* -----------------------------------------------------------
     * 1. R code block (all runs inside WebR)
     *    • new.env()  → scratch space, keeps .GlobalEnv clean
     *    • data(list = "<name>", envir = e) loads the dataset
     *    • obj <- get("<name>", envir = e) fetches it
     *    • if it isn't already a data.frame, try to coerce
     * --------------------------------------------------------- */
    const r = await webR.evalR(`
      {
        e   <- new.env()
        ok  <- suppressMessages( data(list = "${name}", envir = e) )
        if (!length(ok)) stop("dataset not found")

        obj <- get("${name}", envir = e)

        # Coerce ts / matrix / table etc. so JS gets rows+cols
        if (!is.data.frame(obj)) {
          if (is.matrix(obj) || is.table(obj)) {
            obj <- as.data.frame(obj)
          } else if (is.ts(obj)) {
            obj <- data.frame(time = time(obj), value = as.numeric(obj))
          } else {
            obj <- as.data.frame(obj)
          }
        }
        
        # Create a summary output as text
        summary_output <- capture.output(str(obj))
        summary_text <- paste(summary_output, collapse="\\n")
        
        # Return both the data and its summary
        list(data = obj, summary = summary_text)
      }
    `);

    // Convert the complex R object to a JavaScript object
    const result = await (r as any).toObject();
    
    // Extract and process rows
    const rows = await result.data.toD3();
    
    // Extract summary as a plain string
    const summary = await result.summary.toString();
    
    // Clean up resources
    webR.destroy(r);
    webR.destroy(result.data);
    webR.destroy(result.summary);

    if (!rows.length) {
      throw new Error(`Dataset '${name}' loaded but contains no rows.`);
    }
    
    return { rows, summary };
  } catch (err: any) {
    throw new Error(`Failed to load dataset '${name}': ${err?.message || err}`);
  }
}

/**
 * Execute R code using WebR and return the results, including any generated plots
 * @param code The R code to execute
 * @param datasetName Optional dataset name to load before executing code
 * @param uploadedData Optional uploaded data to use instead of a named dataset
 * @returns Object with code execution results and plot data URL if available
 */
export async function executeRCode(
  code: string, 
  datasetName?: string | null, 
  uploadedData?: any
): Promise<{ success: boolean; output?: string; plot?: string; error?: string }> {
  await initWebR();

  try {
    // Extract required packages from the R code
    const packageMatches = code.match(/\blibrary\s*\(\s*["']?([A-Za-z0-9.]+)["']?\s*\)/g) || [];
    const requiredPackages = packageMatches.map(match => {
      const packageMatch = match.match(/\blibrary\s*\(\s*["']?([A-Za-z0-9.]+)["']?\s*\)/);
      return packageMatch ? packageMatch[1] : null;
    }).filter(Boolean) as string[];

    // Install any missing packages
    if (requiredPackages.length > 0) {
      console.log('Checking and installing required packages:', requiredPackages);
      
      // Pre-install packages that are commonly needed
      const commonPackages = new Set([
        ...requiredPackages, 
        'ggplot2', 
        'dplyr', 
        'base64enc',
        'knitr'      // Add knitr for table formatting
      ]);
      
      // Install knitr first explicitly (needed for markdown tables)
      try {
        const knitrInstall = await webR.evalR(`
          if (!requireNamespace("knitr", quietly = TRUE)) {
            message("Pre-installing knitr package...")
            install.packages("knitr", repos = "https://cloud.r-project.org/")
            if (requireNamespace("knitr", quietly = TRUE)) {
              "Successfully installed knitr"
            } else {
              "Failed to install knitr - using alternative methods for tables"
            }
          } else {
            "knitr package already installed"
          }
        `);
        const knitrResult = await knitrInstall.toString();
        console.log(knitrResult);
        webR.destroy(knitrInstall);
      } catch (err) {
        console.warn("Error installing knitr package:", err);
      }
      
      // First ensure base64enc is installed for plot encoding
      try {
        const basePackageCheck = await webR.evalR(`
          if (!requireNamespace("base64enc", quietly = TRUE)) {
            try(webr::install("base64enc", repos = "https://repo.r-wasm.org/", quiet = TRUE))
            if (!requireNamespace("base64enc", quietly = TRUE)) {
              install.packages("base64enc", repos = "https://cloud.r-project.org/")
            }
            "Installed base64enc"
          } else {
            "base64enc already installed"
          }
        `);
        const basePackageResult = await basePackageCheck.toString();
        console.log(basePackageResult);
        webR.destroy(basePackageCheck);
      } catch (err) {
        console.warn("Error installing base64enc:", err);
      }
      
      // Install all required packages
      for (const pkg of commonPackages) {
        try {
          // Check if package is installed
          const checkResult = await webR.evalR(`
            if (requireNamespace("${pkg}", quietly = TRUE)) {
              "Package ${pkg} is already installed"
            } else {
              tryCatch({
                message("Installing package: ${pkg} (this may take a moment)...")
                # First try webr repository
                webr::install("${pkg}", repos = "https://repo.r-wasm.org/", quiet = TRUE)
                if (!requireNamespace("${pkg}", quietly = TRUE)) {
                  # If that fails, try CRAN
                  install.packages("${pkg}", repos = "https://cloud.r-project.org/")
                }
                if (requireNamespace("${pkg}", quietly = TRUE)) {
                  paste0("Successfully installed ${pkg}")
                } else {
                  paste0("Failed to install ${pkg}")
                }
              }, error = function(e) {
                paste0("Error installing ${pkg}: ", conditionMessage(e))
              })
            }
          `);
          
          const installStatus = await checkResult.toString();
          console.log(installStatus);
          webR.destroy(checkResult);
          
        } catch (err) {
          console.warn(`Error with package ${pkg}:`, err);
        }
      }
    }

    // Prepare a function to load data and execute code
    const loadDataAndExecuteCode = async () => {
      console.log('Starting code execution with:', {
        datasetName,
        uploadedData: uploadedData ? {
          hasData: !!uploadedData.data,
          dataLength: uploadedData.data?.length || 0,
          name: uploadedData.name,
          dataStructure: uploadedData.data && uploadedData.data.length > 0 ? 
            Object.keys(uploadedData.data[0]) : 'no data'
        } : null,
        codeLength: code.length
      });
      
      // Additional debugging for the uploaded data issue
      if (uploadedData && uploadedData.data && uploadedData.data.length === 0) {
        console.warn('UploadedData has empty data array, will use default dataset');
      }
      
      // First create a sheltered environment
      let setupCode = `
      {
        # Create a new environment for execution
        e <- new.env()
      `;

      // If a dataset name is provided, load it
      if (datasetName) {
        // Validate dataset name to prevent code injection
        const cleanDatasetName = datasetName.replace(/[^a-zA-Z0-9._]/g, '');
        if (cleanDatasetName !== datasetName) {
          console.warn(`Dataset name cleaned from "${datasetName}" to "${cleanDatasetName}"`);
        }
        
        setupCode += `
        # Load the specified dataset
        tryCatch({
          suppressMessages(data(list = "${cleanDatasetName}", envir = e))
          df <- get("${cleanDatasetName}", envir = e)
          
          # Ensure df is a data frame
          if (!is.data.frame(df)) {
            if (is.vector(df) || is.factor(df) || is.matrix(df) || is.table(df)) {
              # For vectors, create a single-column data frame
              if (is.vector(df) && !is.list(df)) {
                df <- data.frame(value = df)
              } else if (is.factor(df)) {
                df <- data.frame(value = as.character(df))
              } else {
                # For matrices and tables
                df <- as.data.frame(df)
              }
            } else if (is.ts(df)) {
              # For time series
              df <- data.frame(time = time(df), value = as.numeric(df))
            } else if (is.list(df) && !is.data.frame(df)) {
              # For lists that aren't data frames
              df <- as.data.frame(df, stringsAsFactors = FALSE)
            }
          }
        }, error = function(e) {
          # If dataset loading fails, create a simple example
          warning("Failed to load dataset '${cleanDatasetName}': ", e$message)
          df <- data.frame(
            x = 1:10,
            y = 1:10 + rnorm(10)
          )
        })
        `;
      } 
      // If uploaded data is provided, use it
      else if (uploadedData && uploadedData.data && uploadedData.data.length > 0) {
        // Convert the uploaded data to an R data frame
        // First, validate and clean column names
        const validColumnNames = Object.keys(uploadedData.data[0])
          .map(key => {
            // Remove any invalid characters and ensure non-empty names
            let cleanKey = key.toString().trim();
            if (!cleanKey || cleanKey.length === 0) {
              cleanKey = 'col_unnamed';
            }
            // Replace invalid characters with underscores
            cleanKey = cleanKey.replace(/[^a-zA-Z0-9_]/g, '_');
            // Ensure it starts with a letter or underscore
            if (!/^[a-zA-Z_]/.test(cleanKey)) {
              cleanKey = '_' + cleanKey;
            }
            return cleanKey;
          })
          .map((name, index, arr) => {
            // Handle duplicate names
            const count = arr.slice(0, index).filter(n => n === name).length;
            return count > 0 ? `${name}_${count + 1}` : name;
          });

        const originalKeys = Object.keys(uploadedData.data[0]);
        
        const tempDataVar = await webR.evalR(`
          temp_df <- data.frame(
            ${validColumnNames.map((cleanKey, index) => {
              const originalKey = originalKeys[index];
              return `${cleanKey} = c(${uploadedData.data.map((row: any) => {
                const value = row[originalKey];
                if (value === null || value === undefined) {
                  return 'NA';
                }
                return typeof value === 'string' ? `"${value.replace(/"/g, '\\"')}"` : value;
              }).join(',')})`;
            }).join(',')}
          )
          temp_df
        `);
        
        // Assign the data to 'df' in our execution environment
        await webR.evalR(`
          df <- temp_df
          assign("df", df, envir = e)
        `);
        
        // Clean up the temporary variable
        webR.destroy(tempDataVar);
      } 
      // If uploaded data is provided but empty, or if no data is provided
      else {
        console.log('No valid data provided, creating default dataset');
        // No data provided, create a simple example data frame
        setupCode += `
        # Create a simple example data frame
        tryCatch({
          df <- data.frame(
            x = 1:10,
            y = 1:10 + rnorm(10),
            stringsAsFactors = FALSE
          )
          cat("Created default dataset with columns:", colnames(df), "\\n")
        }, error = function(e) {
          cat("Error creating default dataset:", e$message, "\\n")
          # Fallback - even simpler
          df <- data.frame(value = 1:10)
        })
        `;
      }
      
      // Set up for capturing plots
      setupCode += `
        # Set up for plot capture
        png_file <- tempfile(fileext = ".png")
        png(png_file, width = 800, height = 600)
        
        # Make the data frame available in the execution environment
        assign("df", df, envir = e)
        
        # Pre-load required packages in the execution environment
        ${requiredPackages.map(pkg => `suppressMessages(require(${pkg}, quietly = TRUE))`).join('\n        ')}
        
        # Capture output
        output <- tryCatch({
          capture.output({
            # Execute the user code in the environment
            user_code <- "${code.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/(\r\n|\n|\r)/gm, "\\n")}"
            
            eval(parse(text = user_code), envir = e)
          })
        }, error = function(e) {
          # Use a simple string-based approach to error handling
          err_message <- paste("Error:", as.character(e))
          
          # More specific error handling
          if (grepl("attempt to use zero-length variable name", err_message)) {
            err_message <- paste("Error: Invalid column name detected in dataset. Please check that all column names are valid R identifiers.")
          } else if (grepl("object.*not found", err_message)) {
            err_message <- paste("Error: Variable or function not found. Please check variable names and ensure required packages are loaded.")
          } else if (grepl("there is no package called", err_message)) {
            # Extract package name with basic string operations
            pkg_name <- sub(".*there is no package called ['\\"]([^'\\"]+)['\\"].*", "\\\\1", err_message)
            
            message("Attempting to install missing package: ", pkg_name)
            install_result <- try({
              webr::install(pkg_name, repos = "https://repo.r-wasm.org/", quiet = TRUE)
              if (requireNamespace(pkg_name, quietly = TRUE)) {
                library(pkg_name, character.only = TRUE)
                message("Successfully installed and loaded ", pkg_name)
                # Re-run the code after installing the package
                capture.output({
                  user_code <- "${code.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/(\r\n|\n|\r)/gm, "\\n")}"
                  eval(parse(text = user_code), envir = e)
                })
              } else {
                message("Failed to install package: ", pkg_name)
                c(paste("Error: Failed to install required package:", pkg_name))
              }
            }, silent = TRUE)
            
            if (inherits(install_result, "try-error")) {
              c(paste("Error:", err_message))
            } else {
              install_result
            }
          } else {
            c(paste("Error:", err_message))
          }
        })
        
        # Finalize plot if one was created
        dev.off()
        
        # Check if plot was generated
        if (file.exists(png_file)) {
          # Read the plot file as binary
          con <- file(png_file, "rb")
          plot_data <- readBin(con, "raw", file.info(png_file)$size)
          close(con)
          # Encode as base64
          plot_base64 <- base64enc::base64encode(plot_data)
        } else {
          plot_base64 <- NULL
        }
        
        # Return results
        list(
          output = paste(output, collapse = "\\n"),
          plot_base64 = plot_base64
        )
      }`;
      
      // Execute the prepared code
      console.log('Executing R setup code...');
      try {
        const result = await webR.evalR(setupCode);
        console.log('R setup completed, extracting results...');
        
        const jsResult = await (result as any).toObject();
        
        // Extract text output
        const output = await jsResult.output.toString();
        console.log('Extracted output successfully');
        
        // Extract plot if available
        let plotDataUrl = undefined;
        if (jsResult.plot_base64) {
          const plotBase64 = await jsResult.plot_base64.toString();
          if (plotBase64 && plotBase64 !== "NULL") {
            plotDataUrl = `data:image/png;base64,${plotBase64}`;
          }
        }
        
        // Clean up
        webR.destroy(result);
        webR.destroy(jsResult.output);
        webR.destroy(jsResult.plot_base64);
        
        return { output, plotDataUrl };
      } catch (rExecutionError) {
        console.error('Error in R code execution:', rExecutionError);
        throw new Error(`R execution failed: ${rExecutionError instanceof Error ? rExecutionError.message : String(rExecutionError)}`);
      }
    };

    // Run the code execution
    const { output, plotDataUrl } = await loadDataAndExecuteCode();
    
    return {
      success: true,
      output: output,
      plot: plotDataUrl
    };
  } catch (error) {
    console.error("Error executing R code in WebR:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
