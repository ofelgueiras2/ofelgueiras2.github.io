library(RSelenium)
Sys.setenv(DISPLAY = ":99")

cat("=== Início do teste de RSelenium ===\n")

# Configura o perfil do Firefox
#fprof <- makeFirefoxProfile(list(
#  "moz:firefoxOptions" = list(
#    args = c("--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--profile", "/tmp/firefox-profile")
#  )
#))

# Define capabilities more explicitly
fprof <- list(
  browserName = "firefox",
  "moz:firefoxOptions" = list(
    args = c("--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"),
    prefs = list(
      "browser.download.folderList" = 2,
      "browser.download.manager.showWhenStarting" = FALSE
    ),
    log = list(level = "trace")
  )
)

# Connect to Selenium Server with error handling
tryCatch({
  cat("Attempting to connect to Selenium server...\n")
  remDr <- remoteDriver(
    remoteServerAddr = "127.0.0.1",
    port = 4444L,
    browserName = "firefox",
    extraCapabilities = fprof,
    verbose = TRUE
  )




# Abre o navegador
remDr$open()

# Define um timeout maior
remDr$setTimeout(type = "page load", milliseconds = 30000)

cat("📡 Tentando abrir o navegador...\n")
remDr$open()
cat("✅ Navegador aberto com sucesso.\n")

# Define um timeout maior
remDr$setTimeout(type = "page load", milliseconds = 30000)

cat("🔍 Navegando para about:blank...\n")
remDr$navigate("about:blank")
Sys.sleep(10)  # Aumente o tempo de espera

# Verifica o título da página
print(remDr$getTitle())

url_blank <- remDr$getCurrentUrl()
cat("URL obtida para about:blank: ", url_blank, "\n")

cat("🔍 Testando navegação para https://www.google.com ...\n")
remDr$navigate("https://www.google.com")
Sys.sleep(20)  # Aumente o tempo de espera
current_url <- remDr$getCurrentUrl()
cat("🌍 URL obtida (Google):", current_url, "\n")

remDr$close()
cat("=== Teste finalizado ===\n")

