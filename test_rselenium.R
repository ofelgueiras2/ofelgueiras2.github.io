library(RSelenium)

cat("=== Início do teste de RSelenium ===\n")

# Configura o remoteDriver com os mesmos parâmetros utilizados
remDr <- remoteDriver(
  remoteServerAddr = "127.0.0.1",
  port = 4444L,
  browserName = "firefox",
  extraCapabilities = list(
    "moz:firefoxOptions" = list(
      args = c("--headless", "--no-sandbox", "--disable-gpu")
    )
  )
)

cat("\n📡 Tentando abrir o navegador...\n")
remDr$open()

# Verifica o status do Selenium
cat("\n🔎 Status do Selenium Server:\n")
status <- tryCatch(remDr$getStatus(), error = function(e) e)
print(status)

cat("\n✅ Navegador aberto com sucesso!\n")

# Passo 1: Testar navegação para about:blank
cat("\n🔍 Navegando para about:blank...\n")
remDr$navigate("about:blank")
Sys.sleep(5)

# Capturar e imprimir a URL de about:blank
url_blank <- tryCatch(remDr$getCurrentUrl(), error = function(e) NULL)
if (!is.null(url_blank) && length(url_blank) > 0 && nzchar(url_blank[[1]])) {
  cat("🌍 URL obtida (about:blank):", url_blank[[1]], "\n")
} else {
  cat("❌ Nenhuma URL obtida para about:blank.\n")
}

# Obter e imprimir parte do page source
page_source_blank <- tryCatch(remDr$getPageSource(), error = function(e) NULL)
if (!is.null(page_source_blank) && length(page_source_blank) > 0) {
  cat("📄 Trecho do page source (about:blank):\n",
      substr(page_source_blank[[1]], 1, 300), "\n")
} else {
  cat("❌ Nenhum conteúdo da página obtido para about:blank.\n")
}

# Passo 2: Testar navegação para o Google
cat("\n🔍 Navegando para https://www.google.com ...\n")
remDr$navigate("https://www.google.com")
Sys.sleep(5)  # espera inicial

# Implementar polling para aguardar a URL
max_wait <- 30
interval <- 2
start_time <- Sys.time()
current_url <- character(0)

repeat {
  current_url <- tryCatch(remDr$getCurrentUrl(), error = function(e) NULL)
  if (!is.null(current_url) && length(current_url) > 0 && nzchar(current_url[[1]])) {
    break
  }
  if (as.numeric(Sys.time() - start_time, units = "secs") > max_wait) {
    break
  }
  Sys.sleep(interval)
}

if (is.null(current_url) || length(current_url) == 0 || !nzchar(current_url[[1]])) {
  cat("❌ Erro: Página do Google não carregou, nenhuma URL obtida.\n")
} else {
  cat("🌍 URL obtida (Google):", current_url[[1]], "\n")
}

# Obter o page source do Google
page_source_google <- tryCatch(remDr$getPageSource(), error = function(e) NULL)
if (!is.null(page_source_google) && length(page_source_google) > 0) {
  cat("📄 Trecho do page source (Google):\n",
      substr(page_source_google[[1]], 1, 300), "\n")
} else {
  cat("❌ Nenhum conteúdo da página obtido para o Google.\n")
}

# Fechar o navegador
remDr$close()
cat("\n=== Teste finalizado ===\n")


