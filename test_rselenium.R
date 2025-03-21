library(RSelenium)
Sys.setenv(DISPLAY=":99")

cat("=== Início do teste de RSelenium ===\n")

# Configure o remoteDriver com argumentos extras
remDr <- remoteDriver(
  remoteServerAddr = "127.0.0.1",
  port = 4444L,
  browserName = "firefox",
  extraCapabilities = list(
    "moz:firefoxOptions" = list(
      # Para diagnóstico, remova "--headless". Se funcionar sem, depois tente re-adicionar
      # args = c("--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage")
      args = c("--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage")
    )
  )
)

cat("📡 Tentando abrir o navegador...\n")
# Tente abrir em loop para aguardar o servidor
max_wait <- 30
interval <- 2
start_time <- Sys.time()
connected <- FALSE

while(as.numeric(Sys.time() - start_time, units = "secs") < max_wait) {
  result <- tryCatch({
    remDr$open()
    TRUE
  }, error = function(e) {
    Sys.sleep(interval)
    FALSE
  })
  if(result) { connected <- TRUE; break }
}

if(!connected) {
  stop("❌ Erro: Não foi possível conectar ao Selenium Server após ", max_wait, " segundos.")
} else {
  cat("✅ Conectado ao Selenium Server.\n")
}

# Teste navegando para about:blank (página simples)
cat("🔍 Navegando para about:blank...\n")
remDr$navigate("about:blank")
Sys.sleep(40)
url_blank <- tryCatch(remDr$getCurrentUrl(), error = function(e) NULL)
cat("URL obtida para about:blank: ", ifelse(length(url_blank) > 0, url_blank[[1]], "vazia"), "\n")

# Teste navegando para Google
cat("🔍 Testando navegação para https://www.google.com ...\n")
remDr$navigate("https://www.google.com")
# Aguarda um tempo maior para carregamento (por exemplo, 15 segundos)
Sys.sleep(40)
current_url <- tryCatch(remDr$getCurrentUrl(), error = function(e) NULL)
if (is.null(current_url) || length(current_url) == 0 || !nzchar(current_url[[1]])) {
  stop("❌ Erro: Página do Google não carregou, nenhuma URL obtida.")
} else {
  cat("🌍 URL obtida (Google):", current_url[[1]], "\n")
}

# Obter parte do page source para confirmar
page_source_google <- tryCatch(remDr$getPageSource(), error = function(e) NULL)
if (!is.null(page_source_google) && length(page_source_google) > 0) {
  cat("📄 Trecho do page source (Google):\n", substr(page_source_google[[1]], 1, 300), "\n")
} else {
  cat("❌ Nenhum conteúdo da página obtido para o Google.\n")
}

remDr$close()
cat("=== Teste finalizado ===\n")

