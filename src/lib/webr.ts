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

  /* Ask R for the catalogue and turn it into a neat JS array */
  const robj = await webR.evalR(`
    # data() returns a matrix; pull name (Item) and human title (Title)
    df <- as.data.frame(data()$results)[ , c("Item", "Title")]
    names(df) <- c("value", "label")
    df
  `);
  const result = await robj.toD3();        // [{ value: 'iris', label: 'Edgar Anderson\'s Iris Data' }, ...]
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