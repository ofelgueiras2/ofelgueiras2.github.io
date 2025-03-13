library(httr)
library(rvest)
library(dplyr)
library(stringr)
library(lubridate)
library(readr)
library(tidyr)
library(purrr)

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
colnames(dados_csv) <- as.character(dados_csv[1,])
dados_csv <- dados_csv[-1,] %>% select(-which(is.na(names(.))))
dados_csv <- dados_csv %>%
  mutate(
    Fecha = as.Date(Fecha, format = "%d/%m/%Y"),
    Hora = as.integer(Hora),
    `Precio marginal en el sistema portugués (EUR/MWh)` =
      as.numeric(gsub(",", ".", `Precio marginal en el sistema portugués (EUR/MWh)`))
  ) %>%
  select(Data = Fecha, HoraD = Hora,
         Preço = `Precio marginal en el sistema portugués (EUR/MWh)`) %>%
  filter(year(Data) == 2025) %>%
  arrange(desc(Data), desc(HoraD)) %>%
  filter(!is.na(Data) & !is.na(HoraD) & !is.na(Preço)) %>%
  mutate(
    Preço_Posterior = lead(Preço),
    Nova_Coluna = if_else(Data == max(Data), Preço_Posterior, Preço)
  )

dados_agrupados <- dados_csv %>%
  group_by(Data) %>%
  summarise(Preço = mean(Nova_Coluna, na.rm = TRUE)) %>%
  mutate(Futuro = as.integer(if_else(Data == max(Data), 1, 0)))

### 3 – Criação do dataframe de datas e junção dos dados

# Cria o calendário de 365 dias e adiciona o número da semana
df <- tibble(Data = seq(as.Date("2025-01-01"), by = "day", length.out = 365)) %>%
  mutate(Semana = if_else(month(Data) == 12 & isoweek(Data) == 1, 53L, isoweek(Data)))

# Junta os dados "Dia", "Semana" e "Mês"
df_final <- df %>%
  left_join(dados_web %>% filter(Classificação == "Dia") %>% select(Data, Preço), by = "Data") %>%
  rename(Dia = Preço) %>%
  left_join(dados_agrupados %>% select(-Futuro), by = "Data") %>%
  mutate(Dia = if_else(!is.na(Preço), Preço, Dia)) %>%
  select(-Preço) %>%
  left_join(
    dados_web %>% filter(Classificação == "Semana") %>%
      mutate(Semana = as.integer(str_extract(Nome, "\\d+"))) %>% select(Semana, Sem = Preço),
    by = "Semana"
  ) %>%
  mutate(Mês = if_else(year(Data) == 2025, month(Data), NA_integer_)) %>%
  left_join(
    dados_web %>% filter(Classificação == "Mês") %>%
      mutate(Mês = month(as.Date(Data))) %>% select(Mês, `Preço Spot` = Preço),
    by = "Mês"
  )

# Junta os dados de "Trimestre" e realiza ajustes finais
df_final <- df_final %>%
  left_join(
    dados_web %>% filter(Classificação == "Trimestre") %>% select(Contrato = Data, Preço),
    by = c("Data" = "Contrato")
  ) %>%
  rename(Trimestre = Preço) %>%
  arrange(Data) %>%
  mutate(Trimestre = as.numeric(Trimestre)) %>%
  fill(Trimestre, .direction = "down") %>%
  mutate(
    Tri = as.integer((Mês + 2) %/% 3),
    MêsP = `Preço Spot`,
    Horas = as.integer(if_else(
      Data == (as.Date(paste0(year(Data), "-03-31")) - wday(as.Date(paste0(year(Data), "-03-31")), week_start = 7)),
      23,
      if_else(
        Data == (as.Date(paste0(year(Data), "-10-31")) - wday(as.Date(paste0(year(Data), "-10-31")), week_start = 7)),
        25, 24
      )
    ))
  )

# Atribuição final – se "Dia" estiver NA e "Sem" não, usa o valor de "Sem"
dataset <- df_final
dataset$Dia <- ifelse(is.na(dataset$Dia) & !is.na(dataset$Sem), dataset$Sem, dataset$Dia)

### 4 – Ajustes Finais (Funções de correção para Semana, Mês e Trimestre)

adjust_weekly <- function(df) {
  x <- sapply(1:53, function(s) {
    length(unique(df$Mês[df$Semana == s & !is.na(df$Sem) & !is.na(df$MêsP)]))
  })
  f <- which(x > 1)
  if (length(f) > 0) {
    week_val <- f[1]
    m1 <- as.numeric(names(sort(table(df$Mês[df$Semana == week_val]), decreasing = TRUE))[1])
    m2 <- m1 + 1
    sm1 <- sum(df$Horas[df$Mês == m1 & df$Semana == week_val], na.rm = TRUE)
    sm2 <- sum(df$Horas[df$Semana == week_val], na.rm = TRUE)
    ds <- sum(df$Dia[df$Mês == m1 & df$Semana == week_val] * df$Horas[df$Mês == m1 & df$Semana == week_val], na.rm = TRUE)
    ms <- sum(df$MêsP[df$Mês == m1] * df$Horas[df$Mês == m1], na.rm = TRUE)
    ss <- sum(df$Sem[df$Semana == week_val] * df$Horas[df$Semana == week_val], na.rm = TRUE)
    p1 <- (ms - ds) / sm1
    p2 <- (ss - p1 * sm1) / (sm2 - sm1)
    df$Dia[df$Mês == m1 & df$Semana == week_val] <- p1
    df$Dia[df$Mês == m2 & df$Semana == week_val] <- p2
  }
  df
}

adjust_monthly <- function(df) {
  x <- sapply(1:12, function(m) {
    c(sum(df$Mês == m & !is.na(df$Dia)), sum(df$Mês == m & !is.na(df$MêsP)))
  })
  dif <- x[2, ] - x[1, ]
  f <- which(dif > 0 & dif != x[2, ])
  if (length(f) > 0) {
    dn <- sum(df$Horas[df$Mês %in% f & !is.na(df$Dia)], na.rm = TRUE)
    mn <- sum(df$Horas[df$Mês %in% f & !is.na(df$MêsP)], na.rm = TRUE)
    ds <- sum(df$Dia[df$Mês %in% f] * df$Horas[df$Mês %in% f], na.rm = TRUE)
    ms <- sum(df$MêsP[df$Mês %in% f] * df$Horas[df$Mês %in% f], na.rm = TRUE)
    p <- (ms - ds) / (mn - dn)
    df$Dia[is.na(df$Dia) & df$Mês %in% f] <- p
  }
  df$Dia[is.na(df$Dia)] <- df$MêsP[is.na(df$Dia)]
  df
}

adjust_quarterly <- function(df) {
  x <- sapply(1:4, function(q) {
    c(sum(df$Tri == q & !is.na(df$Dia)), sum(df$Tri == q & !is.na(df$Trimestre)))
  })
  dif <- x[2, ] - x[1, ]
  f <- which(dif > 0 & dif != x[2, ])
  if (length(f) > 0) {
    dn <- sum(df$Horas[df$Tri %in% f & !is.na(df$MêsP)], na.rm = TRUE)
    mn <- sum(df$Horas[df$Tri %in% f & !is.na(df$Trimestre)], na.rm = TRUE)
    ds <- sum(df$Dia[df$Tri %in% f & !is.na(df$MêsP)] * df$Horas[df$Tri %in% f & !is.na(df$MêsP)], na.rm = TRUE)
    ms <- sum(df$Trimestre[df$Tri %in% f & !is.na(df$Tri)] * df$Horas[df$Tri %in% f & !is.na(df$Tri)], na.rm = TRUE)
    p <- (ms - ds) / (mn - dn)
    df$Dia[is.na(df$MêsP) & df$Tri %in% f & !is.na(df$Tri)] <- p
    df$Dia[is.na(df$Dia)] <- df$Trimestre[is.na(df$Dia)]
  }
  df$Dia[is.na(df$Dia)] <- df$Trimestre[is.na(df$Dia)]
  df
}

# Aplicar os ajustes
dataset <- adjust_weekly(dataset)
dataset <- adjust_monthly(dataset)
dataset <- adjust_quarterly(dataset)

### 5 – Obter o dataset final

dados <- dataset[, c("Data", "Dia")]

# 1. Criar um dataframe com todos os dias de 2025 e, para cada dia,
#    gerar as horas de 1 até o número indicado em df_final$Horas.
#    Em seguida, para cada combinação de Data e HoraD, replicar para Quarto de 1 a 4.

# Supondo que df_final possua uma linha por Data de 2025 e a coluna Horas indica quantas horas há naquele dia.
calendario <- df_final %>% 
  select(Data, Horas)

dados_temp <- calendario %>%
  # Cria para cada Data uma lista com seq(1, Horas)
  mutate(HoraD = map(Horas, ~ seq(1, .x))) %>%
  unnest(HoraD) %>%
  # Para cada Data e HoraD, replicar para Quarto de 1 a 4
  crossing(Quarto = 1:4)

# 2. Separar as datas em duas partes, de acordo com o critério:
#    - Para datas anteriores à data máxima de dados_csv, usar o valor de Nova_Coluna.
#    - Para as demais datas, usar o valor de Dia do dataframe dados_d.
max_data_csv <- max(dados_csv$Data)

# Para as datas anteriores (exclusivo) à data máxima de dados_csv:
dados_pre <- dados_temp %>%
  filter(Data < max_data_csv) %>%
  left_join(dados_csv %>% select(Data, HoraD, Nova_Coluna),
            by = c("Data", "HoraD")) %>%
  mutate(Preço = Nova_Coluna) %>%
  select(Data, Quarto, HoraD, Preço)

# Para as demais datas (Data >= max_data_csv):
dados_pos <- dados_temp %>%
  filter(Data >= max_data_csv) %>%
  left_join(dados, by = "Data") %>%  # dados_d contém as colunas Data e Dia
  mutate(Preço = Dia) %>%
  select(Data, Quarto, HoraD, Preço)

# 3. Combinar os dois conjuntos e ordenar conforme solicitado:
#    - Data decrescente, depois HoraD decrescente e depois Quarto decrescente.
Dados <- bind_rows(dados_pre, dados_pos) %>%
  arrange(desc(Data), desc(HoraD), desc(Quarto))

# Ler o CSV preservando as colunas em branco

simulador <- read_delim("SimuladorEletricidade_OF_MN_2025.csv",
                        delim = ";",
                        col_names = FALSE,
                        locale = locale(encoding = "UTF-8"),
                        col_types = cols(.default = col_character()))


# Atualizar as células da coluna 55 (correspondente à coluna BC)
# para as linhas de 2 até 35041 com os valores de Dados$Preço

simulador[2:35041, 55] <- formatC(Dados$Preço, format = "g", decimal.mark = ",")

simulador <- as.data.frame(simulador)

write.csv2(simulador, "SimuladorEletricidade_OF_MN_2025_2.csv", row.names = FALSE, na = "")


# Salvar o CSV mantendo a estrutura e as colunas em branco
# Remover os nomes das colunas do dataframe
names(simulador) <- NULL

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
writeLines(content, "SimuladorEletricidade_OF_MN_2025_2.csv", useBytes = TRUE)

file.remove(temp_file)
