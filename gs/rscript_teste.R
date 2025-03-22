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
            cat("URL atual:", current_url, "\n")
            cat("Título:", page_title, "\n")


# 🛠️ Depuração: imprimir a URL obtida
print("URL obtida pelo Selenium:")
print(current_url)

# Verificar se a URL está vazia ou não corresponde
if (length(current_url) == 0 || is.null(current_url[[1]])) {
  stop("Erro: Selenium não retornou nenhuma URL. O site pode não ter carregado corretamente.")
}

# Alternativa mais flexível: verificar se o URL contém "omie.es"
if (!grepl("omie.es", current_url[[1]])) {
  stop(paste("A página não foi carregada corretamente. URL obtida:", current_url[[1]]))
}


# Extração dos dados
data_chart <- html %>%
  html_node("#prices-and-volumes-block") %>%
  html_attr("data-chart")

chart_data <- fromJSON(data_chart)
portugal_data <- chart_data$series$data[[1]]
espanha_data  <- chart_data$series$data[[2]]

# Extração da data
page_date_str <- html %>%
  html_node("h3.block-title") %>%
  html_text() %>%
  str_extract("\\d{2}/\\d{2}/\\d{4}")

page_date <- dmy(page_date_str)
print(paste("Data extraída da página:", page_date))

remDr$close()

if(page_date == csv_date + 1) {
  # Criar um data frame com 24 linhas para cada hora (supondo 24 horas)
  novo_registo <- tibble(
    Fecha = rep(page_date_str, 24),
    Hora = as.character(1:24),
    `Precio marginal en el sistema español (EUR/MWh)` = as.character(espanha_data),
    `Precio marginal en el sistema portugués (EUR/MWh)` = as.character(portugal_data)
    )
  # Visualizar os novos registros
  print("Novos registros extraídos da página:")
  print(novo_registo)
  
  # Acrescentar esses registros no início do data frame original
  dados_csv <- bind_rows(novo_registo, dados_csv)
  
} else {
  message("A data da página não é igual à data do CSV acrescida de 1 dia; não foram acrescentadas novas linhas.")
}


#print(dados_csv,n=30)

dados_csv <- dados_csv %>%
  mutate(
    Fecha = as.Date(Fecha, format = "%d/%m/%Y"),
    Hora = as.integer(Hora),
    `Precio marginal en el sistema portugués (EUR/MWh)` =
      as.numeric(gsub(",", ".", `Precio marginal en el sistema portugués (EUR/MWh)`))
  ) %>%
  select(Data = Fecha, HoraD = Hora,
         Preço = `Precio marginal en el sistema portugués (EUR/MWh)`) %>%
  arrange(desc(Data), desc(HoraD)) %>%
  filter(!is.na(Data) & !is.na(HoraD) & !is.na(Preço)) %>%
  mutate(
    Preço_Posterior = lag(Preço)
  ) %>% 
  filter(year(Data) == 2025)  %>%
  mutate(
    Nova_Coluna = if_else(Data == max(Data), Preço, Preço_Posterior)
  )

dados_agrupados <- dados_csv %>%
  group_by(Data) %>%
  summarise(Preço = mean(Nova_Coluna, na.rm = TRUE)) %>%
  mutate(Futuro = as.integer(if_else(Data == max(Data), 1, 0)))

# 3. Combinar os dois conjuntos e ordenar conforme solicitado:
#    - Data decrescente, depois HoraD decrescente e depois Quarto decrescente.
Dados <- bind_rows(dados_pre, dados_pos) %>%
  arrange(desc(Data), desc(HoraD), desc(Quarto))

# Ler o CSV preservando as colunas em branco

simulador <- read_delim("gs/SimuladorEletricidade_OF_MN_2025.csv",
                        delim = ";",
                        col_names = FALSE,
                        locale = locale(encoding = "UTF-8"),
                        col_types = cols(.default = col_character()))


# Atualizar as células da coluna 55 (correspondente à coluna BC)
# para as linhas de 2 até 35041 com os valores de Dados$Preço

format_no_trailing <- function(x, decimals = 8) {
  # Arredonda para "decimals" casas decimais – isso "limpa" imprecisões
  rx <- round(x, decimals)
  # Cria uma string com o número fixo de casas decimais
  s <- sprintf(paste0("%.", decimals, "f"), rx)
  # Remove zeros à direita (deixa pelo menos um dígito se houver separador)
  s <- sub("0+$", "", s)
  # Se o separador ficar sozinho, remove-o também
  s <- sub("([0-9]),$", "\\1", s)
  # Substitui ponto por vírgula
  s <- gsub("\\.", ",", s)
  s
}

simulador[2:35041, 55] <- format_no_trailing(Dados$Preço)

# Defina o formato das datas (ajuste se necessário)
date_format <- "%d/%m/%Y"

# Converter a coluna TData (coluna 48, linhas 2 a 35041) para Date
TData <- as.Date(unlist(simulador[2:35041, 48]), format = date_format)

# Converter a coluna TPreço (coluna 55, linhas 2 a 35041) para numérico
# Se os valores têm vírgula como separador decimal, substitua para ponto antes de converter
TPreco <- as.numeric(gsub(",", ".", unlist(simulador[2:35041, 55])))

# Converter BG9 (linha 9, coluna 59) e BH9 (linha 9, coluna 60) para Date
BG <- as.Date(unlist(simulador[9:27, 59]), format = date_format)
BH <- as.Date(unlist(simulador[9:27, 60]), format = date_format)

# Usando sapply para calcular, para cada par BG[i] e BH[i], 
# a média dos TPreço correspondentes, dividindo por 1000 e arredondando.
novos_valores <- sapply(seq_along(BG), function(i) {
  indices <- TData >= BG[i] & TData <= BH[i]
  round(mean(TPreco[indices], na.rm = TRUE) / 1000, 5)
})

# Formata os valores para texto, com vírgula como separador decimal
novos_valores_formatted <- formatC(novos_valores, format = "f", digits = 5, decimal.mark = ",")
# Atualiza as células de simulador (linhas 6 a 24, coluna 30) com os resultados
simulador[6:24, 30] <- novos_valores_formatted

simulador <- as.data.frame(simulador)
names(simulador) <- NULL
write.csv2(simulador, "gs/SimuladorEletricidade_OF_MN_2025_3.csv", row.names = FALSE, na = "")


# Salvar o CSV mantendo a estrutura e as colunas em branco
# Remover os nomes das colunas do dataframe

# Primeiro, salva o conteúdo em um arquivo temporário
temp_file <- "temp_Simulador.csv"
write.table(simulador,
            file = temp_file,
            sep = ";",
            dec = ",",
            row.names = FALSE,
            col.names = FALSE,
            na = "",
            fileEncoding = "UTF-8",
            quote = FALSE)

# Lê o conteúdo e adiciona o BOM
content <- readLines(temp_file, encoding = "UTF-8")
bom <- "\ufeff"  # BOM em UTF-8

# Se houver pelo menos uma linha, insira o BOM no começo da primeira
if (length(content) > 0) {
  content[1] <- paste0(bom, content[1])
}

# Agora salve normalmente
writeLines(content, "gs/SimuladorEletricidade_OF_MN_2025_3.csv", useBytes = TRUE)

file.remove(temp_file)
