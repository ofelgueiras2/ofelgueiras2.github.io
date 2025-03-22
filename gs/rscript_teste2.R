library(httr)
library(rvest)
library(dplyr)
library(stringr)
library(lubridate)
library(readr)
library(tidyr)
library(purrr)
library(RSelenium)
library(jsonlite)
library(netstat)
library(wdman)

### 1 – Extração e processamento dos dados da web

extrair_dados <- function(url, seletor) {
  res <- GET(url)
  if (status_code(res) != 200) return(NULL)
  html <- read_html(res)
  pt_section <- html_nodes(html, ".contratos-country-PT")
  if (length(pt_section) == 0) return(NULL)
  nodes <- html_nodes(pt_section, seletor)
  if (length(nodes) == 0) return(NULL)
  data.frame(
    Nome = html_text(html_node(nodes, ".name"), trim = TRUE),
    Preço = html_text(html_node(nodes, ".price"), trim = TRUE),
    stringsAsFactors = FALSE
  )
}

url_web <- "https://www.omip.pt/pt"
dados_web <- bind_rows(
  extrair_dados(url_web, ".header4.contrato"),
  extrair_dados(url_web, ".date-value")
) %>%
  filter(!str_detect(Nome, "^P"), str_detect(Nome, "25$")) %>%
  distinct(Nome, .keep_all = TRUE) %>%
  mutate(
    Preço = as.numeric(str_replace(Preço, "€", "")),
    Classificação = factor(case_when(
      str_detect(Nome, "^\\d") ~ "Dia",
      str_detect(Nome, "^W") ~ "Semana",
      str_detect(Nome, "^Q") ~ "Trimestre",
      str_detect(Nome, "^Y") ~ "Ano",
      TRUE ~ "Mês"
    ), levels = c("Dia", "Semana", "Mês", "Trimestre", "Ano"))
  ) %>%
  arrange(Classificação) %>%
  mutate(Data = case_when(
    Classificação == "Dia" ~ as.Date(paste0(str_sub(Nome, 1, 2), "-", str_sub(Nome, 3, 5), "-2025"), format = "%d-%b-%Y"),
    Classificação == "Semana" ~ {
      sem <- as.numeric(str_extract(Nome, "\\d+"))
      inicio <- as.Date("2025-01-01") + (sem - 1) * 7
      inicio - wday(inicio) + 2
    },
    Classificação == "Mês" ~ as.Date(paste0("2025-", match(str_sub(Nome, 1, 3), month.abb), "-01"), format = "%Y-%m-%d"),
    Classificação == "Trimestre" ~ as.Date(paste0("2025-", (as.numeric(str_extract(Nome, "\\d+")) - 1) * 3 + 1, "-01"), format = "%Y-%m-%d"),
    TRUE ~ NA_Date_
  ))


### 2 – Leitura e processamento dos dados CSV

url_csv <- "https://www.omie.es/sites/default/files/dados/NUEVA_SECCION/INT_PBC_EV_H_ACUM.TXT"
dados_csv <- read_delim(url_csv, delim = ";", col_names = FALSE,
                        locale = locale(encoding = "windows-1252"),
                        col_types = cols(.default = col_character()),
                        skip = 2)
dados_csv <- dados_csv[-1,1:4]
dados_csv <- dados_csv[,1:4]
names(dados_csv)=c("Fecha","Hora",
                   "Precio marginal en el sistema español (EUR/MWh)",
                   "Precio marginal en el sistema portugués (EUR/MWh)")
csv_date <- dmy(dados_csv$Fecha[1])


# --- Parte 1: Extração via RSelenium e rvest -----------------

            remDr <- remoteDriver(
              remoteServerAddr = "127.0.0.1",
              port = 4444L,
              browserName = "firefox",
              extraCapabilities = list(
                "moz:firefoxOptions" = list(args = list("--headless"))
              )
            )

# Polling para conectar
max_wait <- 30  # tempo máximo em segundos
interval <- 2   # intervalo entre tentativas
start_time <- Sys.time()
connected <- FALSE

            remDr$open()     

# Navegar para a página
url <- "https://www.omie.es"  # substitua pela URL real
remDr$navigate(url)
Sys.sleep(5)  # Aumentar o tempo de espera para garantir carregamento

# Obter a URL atual (o retorno geralmente é uma lista)
current_url <- remDr$getCurrentUrl()

            page_title <- remDr$getTitle()[[1]]
#            cat("URL atual:", current_url, "\n")
            cat("Título:", page_title, "\n")


# 🛠️ Depuração: imprimir a URL obtida
print("URL obtida pelo Selenium:")
print(current_url)

remDr$close()

