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

export async function fetchDataset(name: string): Promise<Record<string, unknown>[]> {
  await initWebR();

  try {
    /* -----------------------------------------------------------
     * 1. R code block (all runs inside WebR)
     *    • new.env()  → scratch space, keeps .GlobalEnv clean
     *    • data(list = "<name>", envir = e) loads the dataset
     *    • obj <- get("<name>", envir = e) fetches it
     *    • if it isn’t already a data.frame, try to coerce
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
        obj
      }
    `);

    const rows = await (r as any).toD3();   // array-of-row objects
    webR.destroy(r);

    if (!rows.length) {
      throw new Error(`Dataset '${name}' loaded but contains no rows.`);
    }
    return rows;
  } catch (err: any) {
    throw new Error(`Failed to load dataset '${name}': ${err?.message || err}`);
  }
}
