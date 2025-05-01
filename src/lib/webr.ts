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
    # Get all datasets from the 'datasets' package
    all_datasets <- data(package = "datasets")$results[, "Item"]
    
    # Create a data frame with the same name for both value and label
    df <- data.frame(
      value = all_datasets,
      label = all_datasets,
      stringsAsFactors = FALSE
    )
    df
  `);
  const result = await robj.toD3();
  webR.destroy(robj);
  return result;
}

export async function fetchDataset(name: string): Promise<Record<string, unknown>[]> {
  await initWebR();

  /* data(<name>) searches every attached package and loads it into .GlobalEnv  */
  await webR.evalR(`suppressMessages(data("${name}", envir = globalenv()))`);

  const df = await webR.evalR(name);       // R data.frame proxy
  const rows = await df.toD3();            // [{ col1: ..., col2: ... }, ...]  ★
  webR.destroy(df);
  return rows;
}