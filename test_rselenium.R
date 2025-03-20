library(RSelenium)

# Cria o driver remoto com as mesmas configurações usadas no seu workflow
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

# Tenta abrir o navegador
cat("📡 Tentando abrir o navegador...\n")
remDr$open()
cat("✅ Navegador aberto com sucesso!\n")

# Navega para o Google e aguarda
cat("🔍 Navegando para https://www.google.com ...\n")
remDr$navigate("https://www.google.com")
Sys.sleep(10)  # aguarda 10 segundos para o carregamento

# Obtém e imprime a URL atual
current_url <- remDr$getCurrentUrl()
cat("🌍 URL carregada:", current_url[[1]], "\n")

# Fecha o navegador
remDr$close()
