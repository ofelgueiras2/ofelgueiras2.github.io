library(RSelenium)

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

cat("📡 Tentando abrir o navegador...\n")
remDr$open()
cat("✅ Navegador aberto com sucesso!\n")

cat("🔍 Navegando para https://www.google.com ...\n")
remDr$navigate("https://www.google.com")
Sys.sleep(10)

# Verifica se a URL foi obtida
current_url <- remDr$getCurrentUrl()
cat("Comprimento do vetor de URL:", length(current_url), "\n")
print(current_url)

# Tenta capturar parte do conteúdo da página
page_source <- remDr$getPageSource()[[1]]
cat("Trecho do page source:\n", substr(page_source, 1, 300), "\n")

remDr$close()

