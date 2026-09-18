# SOCR AI Bot Webapp

![](https://github.com/SOCR/socr-ai-bot/blob/main/socr-ai-bot_snap.png?raw=true)

This project reimplements the [SOCR AI Bot](https://socr.umich.edu/GAIM/) — originally an
[R/RShiny application](https://rcompute.nursing.umich.edu/SOCR_AI_Bot/) — as a modern, fully
client-side HTML5 webapp. It is a single `React`/`TypeScript` frontend with **no separate backend
server**: `R` itself runs directly in the browser via [WebR](https://docs.r-wasm.org/webr/latest/)
(R compiled to WebAssembly), and generative AI features call OpenAI/Google Gemini directly from
the client using a user-supplied API key.

The SOCR AI Bot leverages SOCR/DSPA computational libraries and [Generative AI Model (GAIM)](https://socr.umich.edu/GAIM/)
interfaces, including OpenAI's GPT-4o and Google's Gemini models, to translate natural language
commands into `R` code, generate synthetic text and images, analyze uploaded or built-in datasets,
and compile the results into downloadable reports.

## Implementation Overview

### R execution: WebR (in-browser, no server)

`src/lib/webr.ts` boots a `WebR` instance and exposes:
- `listDatasets()` — enumerates the built-in R datasets available via `data()`
- `fetchDataset(name)` — loads a built-in dataset into a data frame and returns its rows plus an
  `str()`-style summary
- `executeRCode(code, datasetName?, uploadedData?)` — loads the chosen dataset (or a user-uploaded
  one) into a data frame `df`, auto-installs any R packages the generated code `library()`s in
  (via the `webr` WASM package repository, falling back to CRAN), evaluates the code in a
  sandboxed environment, and captures both console output and any generated plot as a base64 PNG

All statistical computation therefore happens locally in the browser's WebAssembly sandbox — there
is nothing to deploy or host for the R side.

### Generative AI: OpenAI + Google Gemini

`src/services/openaiApiClient.ts` and `src/services/googleApiClient.ts` call the OpenAI and Google
Generative AI SDKs directly from the browser using an API key the user enters in the Settings
dialog (stored client-side; see `src/lib/utils.ts`). These are used to:
- Translate natural-language requests into R code (Generate sub-tab)
- Answer open-ended statistics/data-science questions (Ask sub-tab)
- Generate synthetic text and images (Synth tab)

No GenAI key is required to use the WebR-powered EDA, Data, and Report features — only the
text/code/image generation features need one.

### Frontend: React/TypeScript UI

The app (`src/pages/Index.tsx`) renders a top-level `Navbar` and switches between tabs:

1. **Basic** (`BasicTab`) — a sub-tabbed workspace:
   - *Generate*: pick a built-in dataset or upload your own (CSV/TSV/Excel), describe the desired
     analysis in plain language, and have GPT-4o/Gemini generate and run R code against it via WebR
   - *EDA*: quick exploratory analyses (summaries, distributions, correlations, plots) run via WebR
   - *Ask*: free-form Q&A with the selected LLM about statistics/data science
   - *Report*: assembles the R code chunks generated across the other sub-tabs into a downloadable
     report
2. **Synth** (`SynthTab`) — *Text* and *Image* sub-tabs for generating synthetic text and images
   via the configured GenAI provider
3. **Synthetic Brain Data Generator** (`BrainGenTab`) — links out to the standalone
   [SOCR Brain Generator](https://socr.umich.edu/HTML5/BrainGen/) app
4. **Data** (`DataTab`) — searchable, paginated table view of the currently selected/uploaded dataset
5. **About** (`AboutTab`) — project background, FAQ, and version/update log

Shared UI (data upload, dataset selector, prompt input, code block viewer, accordion results,
in-app tutorial, theme toggle, settings dialog) lives under `src/components/`.

### How It Works

1. The user selects a built-in dataset or uploads their own, or uses the Ask/Synth tabs without any data
2. For code-generation requests, the prompt (plus dataset summary/preview) is sent to the selected
   LLM, which returns R code
3. The generated R code is executed locally by WebR, installing any needed packages on the fly
4. Console output and any generated plot are rendered in the UI, and the code/output can be
   collected into a report

## Technology Stack

- `React` 18 + `TypeScript`, built with `Vite`
- `shadcn/ui` (Radix UI primitives) + `Tailwind CSS` for styling
- [`webr`](https://www.npmjs.com/package/webr) — R running in-browser via WebAssembly
- `openai` and `@google/generative-ai` SDKs for GPT-4o and Gemini
- `react-router-dom`, `@tanstack/react-query`, `recharts`, `react-markdown`

## Setup Instructions

### Prerequisites
- Node.js and npm

### Installation

```bash
git clone https://github.com/SOCR/socr-ai-bot.git
cd socr-ai-bot
npm install
```

### Running the app

```bash
npm run dev
```

The app starts at `http://localhost:8080`. There is no separate backend to start — R runs entirely
in-browser via WebR.

Other scripts:
```bash
npm run build      # production build
npm run build:dev  # development-mode build
npm run preview    # preview a production build locally
npm run lint        # run ESLint
```

## Using the Webapp

1. Choose default (light) or optional (dark) display mode
2. Open **Settings** and add your OpenAI and/or Google Gemini API key if you want to use the
   Generate, Ask, or Synth features (EDA/Data/Report work without a key once a dataset is loaded)
3. Run through the interactive hands-on tutorial (`?` Help button in the top-right of the navbar)

## References
 - [SOCR](https://socr.umich.edu),  [SOCR HTML5 Webapps](https://socr.umich.edu/HTML5/), [SOCR GAIMs](https://socr.umich.edu/GAIM/)
 - [Live HTML5 SOCR AI Bot Webapp](https://socr-ai-bot.gray-rain.com/), [Live SOCR AI Bot RShiny App](https://rcompute.nursing.umich.edu/SOCR_AI_Bot/)
 - [Source code on GitHub](https://github.com/SOCR/socr-ai-bot)
 - [WebR documentation](https://docs.r-wasm.org/webr/latest/)
