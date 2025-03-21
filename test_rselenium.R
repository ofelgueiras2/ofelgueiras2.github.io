library(RSelenium)
Sys.setenv(DISPLAY = ":99")

cat("=== Início do teste de RSelenium ===\n")

remDr <- remoteDriver(
  remoteServerAddr = "127.0.0.1",
  port = 4444L,
  browserName = "firefox",
  extraCapabilities = list(
    "moz:firefoxOptions" = list(
      args = c("--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage")
    )
  )
)

cat("📡 Tentando abrir o navegador...\n")
remDr$open()
cat("✅ Navegador aberto com sucesso.\n")

cat("🔍 Navegando para about:blank...\n")
remDr$navigate("about:blank")
Sys.sleep(10)  # Aumente o tempo de espera
url_blank <- remDr$getCurrentUrl()
cat("URL obtida para about:blank: ", url_blank, "\n")

cat("🔍 Testando navegação para https://www.google.com ...\n")
remDr$navigate("https://www.google.com")
Sys.sleep(20)  # Aumente o tempo de espera
current_url <- remDr$getCurrentUrl()
cat("🌍 URL obtida (Google):", current_url, "\n")

remDr$close()
cat("=== Teste finalizado ===\n")

