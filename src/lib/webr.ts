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
      const commonPackages = new Set([...requiredPackages, 'ggplot2', 'dplyr', 'base64enc']);
      
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
      // First create a sheltered environment
      let setupCode = `
      {
        # Create a new environment for execution
        e <- new.env()
      `;

      // If a dataset name is provided, load it
      if (datasetName) {
        setupCode += `
        # Load the specified dataset
        suppressMessages(data(list = "${datasetName}", envir = e))
        df <- get("${datasetName}", envir = e)
        `;
      } 
      // If uploaded data is provided, use it
      else if (uploadedData && uploadedData.data) {
        // Convert the uploaded data to an R data frame
        const tempDataVar = await webR.evalR(`
          temp_df <- data.frame(
            ${Object.keys(uploadedData.data[0]).map(key => 
              `${key} = c(${uploadedData.data.map((row: any) => 
                typeof row[key] === 'string' ? `"${row[key]}"` : row[key]).join(',')})`
            ).join(',')}
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
      } else {
        // No data provided, create a simple example data frame
        setupCode += `
        # Create a simple example data frame
        df <- data.frame(
          x = 1:10,
          y = 1:10 + rnorm(10)
        )
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
        output <- capture.output({
          # Execute the user code in the environment
          tryCatch({
            eval(parse(text = "${code.replace(/"/g, '\\"').replace(/(\r\n|\n|\r)/gm, "\\n")}"), envir = e)
          }, error = function(e) {
            # If we hit a package error, try loading common packages directly
            message("Error encountered: ", conditionMessage(e))
            if (grepl("there is no package called", conditionMessage(e))) {
              pkg_name <- gsub(".*there is no package called ['\\"]([^'\\"]+)['\\"].*", "\\\\1", conditionMessage(e))
              message("Attempting to install missing package: ", pkg_name)
              tryCatch({
                webr::install(pkg_name, repos = "https://repo.r-wasm.org/", quiet = TRUE)
                if (requireNamespace(pkg_name, quietly = TRUE)) {
                  library(pkg_name, character.only = TRUE)
                  message("Successfully installed and loaded ", pkg_name)
                  eval(parse(text = "${code.replace(/"/g, '\\"').replace(/(\r\n|\n|\r)/gm, "\\n")}"), envir = e)
                }
              }, error = function(e2) {
                message("Failed to recover: ", conditionMessage(e2))
                stop(conditionMessage(e))
              })
            } else {
              stop(conditionMessage(e))
            }
          })
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
      const result = await webR.evalR(setupCode);
      const jsResult = await (result as any).toObject();
      
      // Extract text output
      const output = await jsResult.output.toString();
      
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
