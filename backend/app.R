library(plumber)
library(jsonlite)

# CORS filter
#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "http://localhost:8080")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  }

  plumber::forward()
}

safe_require <- function(pkg) {
  suppressPackageStartupMessages(require(pkg, character.only = TRUE, quietly = TRUE))
}

safe_require("httr")
safe_require("base64enc")

release <- "2.6.2"
uploaded_data <- "User Upload"
no_data <- "No data (examples)"
rna_seq <- "RNA-Seq"
max_levels <- 12
max_char_question <- 280
brain_generator_url <- "https://rcompute.nursing.umich.edu/SOCR_ImgGenApp/"

clean_api_key <- function(api_key) {
  gsub(" ", "", api_key)
}

get_api_key <- function(kind = c("openai", "gemini")) {
  kind <- match.arg(kind)
  env_names <- if (kind == "openai") c("OPENAI_API_KEY", "OPEN_API_KEY") else c("GEMINI_API_KEY", "GOOGLE_API_KEY")
  file_name <- if (kind == "openai") "api_key_openAI.txt" else "api_key_gemini.txt"

  for (nm in env_names) {
    val <- Sys.getenv(nm, unset = "")
    if (nzchar(val)) return(clean_api_key(val))
  }

  if (file.exists(file.path(getwd(), file_name))) {
    lines <- readLines(file.path(getwd(), file_name), warn = FALSE)
    if (length(lines) > 0 && nzchar(lines[[1]])) return(clean_api_key(lines[[1]]))
  }

  ""
}

json_body <- function(req) {
  body <- req$postBody
  if (is.null(body) || !nzchar(body)) return(list())
  tryCatch(fromJSON(body, simplifyVector = TRUE), error = function(e) list())
}

normalize_df <- function(x) {
  if (is.data.frame(x)) return(x)
  if (is.matrix(x)) return(as.data.frame(x))
  if (is.list(x)) return(as.data.frame(x, stringsAsFactors = FALSE))
  stop("Unable to convert input into a data frame")
}

prepare_df <- function(body) {
  if (!is.null(body$csv_text) && nzchar(body$csv_text)) {
    return(read.csv(text = body$csv_text, check.names = FALSE))
  }
  if (!is.null(body$records)) {
    return(normalize_df(body$records))
  }
  if (!is.null(body$data)) {
    return(normalize_df(body$data))
  }
  if (!is.null(body$dataset) && is.character(body$dataset) && nzchar(body$dataset) && body$dataset != no_data) {
    obj <- tryCatch(get(body$dataset, "package:datasets"), error = function(e) NULL)
    if (!is.null(obj)) return(normalize_df(obj))
  }
  stop("Provide one of: csv_text, records, data, or dataset")
}

numeric_to_factor <- function(df, max_levels_factor = max_levels, max_proportion_factor = 0.1) {
  convert_index <- vapply(
    df,
    function(x) {
      is.numeric(x) && (length(unique(x)) / length(x) < max_proportion_factor) && length(unique(x)) <= max_levels_factor
    },
    logical(1)
  )

  for (var in names(df)[convert_index]) {
    df[[var]] <- as.factor(df[[var]])
  }
  df
}

compact_df_info <- function(df) {
  data.frame(
    column = names(df),
    class = vapply(df, function(x) paste(class(x), collapse = "/"), character(1)),
    non_null = vapply(df, function(x) sum(!is.na(x)), integer(1)),
    unique_values = vapply(df, function(x) length(unique(x)), integer(1)),
    stringsAsFactors = FALSE
  )
}

safe_summary_text <- function(df) {
  if (safe_require("summarytools")) {
    paste(capture.output(summarytools::dfSummary(df)), collapse = "\n")
  } else {
    paste(capture.output(summary(df)), collapse = "\n")
  }
}

safe_table1_text <- function(df, strata) {
  if (!safe_require("tableone")) stop("Package 'tableone' is not installed")
  if (!strata %in% names(df)) stop("strata column not found")
  paste(capture.output(tableone::CreateTableOne(vars = setdiff(names(df), strata), data = df, strata = strata)), collapse = "\n")
}

correlation_payload <- function(df) {
  nums <- df[vapply(df, is.numeric, logical(1))]
  if (ncol(nums) < 2) stop("Need at least two numeric columns")
  mat <- stats::cor(nums, use = "pairwise.complete.obs")
  list(columns = colnames(nums), correlation = unname(split(mat, row(mat))))
}

available_datasets <- function() {
  ds <- as.character(data()$results[, 3])
  ds <- gsub(" .*", "", ds)
  ds <- gsub("ability.cov", "ability.cov$cov", ds)
  ds <- sort(unique(ds))
  ds <- c(ds, uploaded_data, rna_seq, no_data)
  unique(c(no_data, rna_seq, uploaded_data, ds))
}

openai_chat <- function(prompt, model = "gpt-4o-mini", temperature = 0.1, max_tokens = 500) {
  if (!safe_require("httr")) stop("Package 'httr' is required")
  key <- get_api_key("openai")
  if (!nzchar(key)) stop("OpenAI API key not found. Set OPENAI_API_KEY or create api_key_openAI.txt")

  body <- toJSON(list(
    model = model,
    messages = list(list(role = "user", content = prompt)),
    temperature = temperature,
    max_tokens = max_tokens
  ), auto_unbox = TRUE)

  resp <- httr::POST(
    "https://api.openai.com/v1/chat/completions",
    httr::add_headers(
      Authorization = paste("Bearer", key),
      `Content-Type` = "application/json"
    ),
    body = body,
    encode = "raw"
  )

  txt <- httr::content(resp, as = "text", encoding = "UTF-8")
  parsed <- fromJSON(txt, simplifyVector = TRUE)
  if (httr::status_code(resp) >= 300) {
    msg <- if (!is.null(parsed$error$message)) parsed$error$message else txt
    stop(msg)
  }
  parsed
}

openai_image <- function(prompt, model = "gpt-image-1", size = "1024x1024") {
  if (!safe_require("httr")) stop("Package 'httr' is required")
  key <- get_api_key("openai")
  if (!nzchar(key)) stop("OpenAI API key not found. Set OPENAI_API_KEY or create api_key_openAI.txt")

  body <- toJSON(list(
    model = model,
    prompt = prompt,
    size = size
  ), auto_unbox = TRUE)

  resp <- httr::POST(
    "https://api.openai.com/v1/images/generations",
    httr::add_headers(
      Authorization = paste("Bearer", key),
      `Content-Type` = "application/json"
    ),
    body = body,
    encode = "raw"
  )

  txt <- httr::content(resp, as = "text", encoding = "UTF-8")
  parsed <- fromJSON(txt, simplifyVector = FALSE)
  if (httr::status_code(resp) >= 300) {
    msg <- tryCatch(parsed$error$message, error = function(e) txt)
    stop(msg)
  }
  parsed
}

make_response <- function(expr, res = NULL) {
  tryCatch(
    expr,
    error = function(e) {
      if (!is.null(res)) res$status <- 400
      list(success = FALSE, error = conditionMessage(e))
    }
  )
}

#* SOCR AI Bot legacy-compatible Plumber API
#* @apiTitle SOCR AI Bot Plumber API

#* Root endpoint
#* @get /
function() {
  list(
    success = TRUE,
    app = "SOCR AI Bot",
    version = release,
    message = "Legacy Shiny functionality exposed through Plumber",
    endpoints = c(
      "/health",
      "/version",
      "/datasets",
      "/ask",
      "/synthetic-text",
      "/synthetic-image",
      "/synthetic-brain-data-generator",
      "/eda/summary",
      "/eda/table1",
      "/eda/correlation",
      "/session-info"
    )
  )
}

#* Health check
#* @get /health
function() {
  list(success = TRUE, status = "ok", time = as.character(Sys.time()), version = release)
}

#* Version info
#* @get /version
function() {
  list(success = TRUE, version = release)
}

#* List built-in datasets used by the old app
#* @get /datasets
function() {
  list(success = TRUE, datasets = available_datasets())
}

#* Session info and installed packages
#* @get /session-info
function() {
  pkgs <- .packages(all.available = TRUE)
  list(
    success = TRUE,
    release = release,
    package_count = length(pkgs),
    packages = unname(vapply(pkgs, function(x) paste(x, as.character(utils::packageVersion(x))), character(1))),
    session_info = paste(capture.output(sessionInfo()), collapse = "\n")
  )
}

#* Legacy ask endpoint using OpenAI chat
#* @post /ask
function(req, res) {
  make_response({
    body <- json_body(req)
    question <- body$question %||% body$prompt
    if (is.null(question) || !nzchar(question)) stop("Provide 'question' or 'prompt'")
    if (nchar(question) > max_char_question) question <- substr(question, 1, max_char_question)
    if (!grepl("\\.$", question)) question <- paste0(question, ".")

    response <- openai_chat(
      prompt = question,
      model = if (!is.null(body$model)) body$model else "gpt-4o-mini",
      temperature = if (!is.null(body$temperature)) as.numeric(body$temperature) else 0.1,
      max_tokens = if (!is.null(body$max_tokens)) as.integer(body$max_tokens) else 500
    )

    list(
      success = TRUE,
      question = question,
      model = response$model,
      answer = response$choices[[1]]$message$content,
      usage = response$usage
    )
  }, res)
}

#* Synthetic text generation endpoint
#* @post /synthetic-text
function(req, res) {
  make_response({
    body <- json_body(req)
    prompt <- body$prompt %||% body$text_prompt
    if (is.null(prompt) || !nzchar(prompt)) stop("Provide 'prompt' or 'text_prompt'")
    if (nchar(prompt) > max_char_question) prompt <- substr(prompt, 1, max_char_question)
    if (!grepl("\\.$", prompt)) prompt <- paste0(prompt, ".")

    response <- openai_chat(
      prompt = prompt,
      model = if (!is.null(body$model)) body$model else "gpt-4o-mini",
      temperature = if (!is.null(body$temperature)) as.numeric(body$temperature) else 0.8,
      max_tokens = if (!is.null(body$max_tokens)) as.integer(body$max_tokens) else 300
    )

    list(
      success = TRUE,
      prompt = prompt,
      text = response$choices[[1]]$message$content,
      usage = response$usage
    )
  }, res)
}

#* Synthetic image generation endpoint
#* @post /synthetic-image
function(req, res) {
  make_response({
    body <- json_body(req)
    prompt <- body$prompt %||% body$image_prompt
    if (is.null(prompt) || !nzchar(prompt)) stop("Provide 'prompt' or 'image_prompt'")

    response <- openai_image(
      prompt = prompt,
      model = if (!is.null(body$model)) body$model else "gpt-image-1",
      size = if (!is.null(body$size)) body$size else "1024x1024"
    )

    data <- response$data
    out <- lapply(data, function(x) {
      list(url = x$url %||% NULL, b64_json = x$b64_json %||% NULL, revised_prompt = x$revised_prompt %||% NULL)
    })

    list(success = TRUE, prompt = prompt, images = out)
  }, res)
}

#* Old Shiny app redirected the brain generator to a separate deployed app
#* @get /synthetic-brain-data-generator
function(res) {
  res$setHeader("Location", brain_generator_url)
  res$status <- 302
  list(success = TRUE, redirect = brain_generator_url)
}

#* Return summary text and column metadata for a dataset
#* @post /eda/summary
function(req, res) {
  make_response({
    body <- json_body(req)
    df <- prepare_df(body)
    df <- numeric_to_factor(df)
    list(
      success = TRUE,
      rows = nrow(df),
      columns = ncol(df),
      column_info = compact_df_info(df),
      summary = safe_summary_text(df)
    )
  }, res)
}

#* Create a Table 1 style summary by strata
#* @post /eda/table1
function(req, res) {
  make_response({
    body <- json_body(req)
    strata <- body$strata
    if (is.null(strata) || !nzchar(strata)) stop("Provide 'strata'")
    df <- prepare_df(body)
    df <- numeric_to_factor(df)
    list(success = TRUE, strata = strata, table1 = safe_table1_text(df, strata))
  }, res)
}

#* Compute numeric correlation matrix
#* @post /eda/correlation
function(req, res) {
  make_response({
    body <- json_body(req)
    df <- prepare_df(body)
    list(success = TRUE, result = correlation_payload(df))
  }, res)
}

`%||%` <- function(x, y) if (is.null(x)) y else x

#* @post /brain-gen
function(req, res) {
  body <- jsonlite::fromJSON(req$postBody)
  list(success = TRUE, recieved = body, message = "You did it!")
}