library(dplyr)
library(stringr)
library(lubridate)
library(readr)
library(tidyr)
library(purrr)
library(httr)
library(rvest)
library(data.table)
library(arrow)
library(htmlwidgets)
library(plotly)

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

# --- Parte 1: Extração -----------------

# URL do ficheiro INDICADORES.DAT
url <- "https://www.omie.es/sites/default/files/dados/diario/INDICADORES.DAT"

# Ler todas as linhas
linhas <- readLines(url, encoding = "UTF-8")

# Selecionar apenas as linhas que começam com 1 a 24 (as horas)
linhas_horas <- grep("^[0-9]{1,2};", linhas, value = TRUE)

# Separar campos por ponto e vírgula
dados <- strsplit(linhas_horas, ";")

# Extrair hora (coluna 1) e preço Portugal (coluna 3)
horas <- sapply(dados, function(x) as.integer(x[1]))
portugal_data <- sapply(dados, function(x) as.numeric(gsub(",", ".", x[3])))
espanha_data <- sapply(dados, function(x) as.numeric(gsub(",", ".", x[2])))

# Criar data.frame limpo
df <- data.frame(
  hora = horas,
  preco_EUR_MWh = portugal_data
)

print(df)

# Procurar a linha da sessão e extrair a data
linha_sesion <- grep("^SESION;", linhas, value = TRUE)
page_date_str <- strsplit(linha_sesion, ";")[[1]][2]  # "25/03/2025"


print(portugal_data)
print(espanha_data)


page_date <- dmy(page_date_str)
print(paste("Data extraída da página:", page_date))


if(page_date == csv_date + 1) {
  # Criar um data frame com 24 linhas para cada hora (supondo 24 horas)
  novo_registo <- tibble(
    Fecha = rep(page_date_str, 24),
    Hora = as.character(horas),
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


print(dados_csv,n=30)
# Alterado

df_old <- read_parquet("gs/Precos_20100101_20250331.parquet")

dados_old <- df_old %>%
  group_by(Data) %>%
  summarise(Dia = mean(Preço, na.rm = TRUE)) %>%
  ungroup()

df_old_convertido <- df_old %>%
  mutate(
    Fecha = format(Data, "%d/%m/%Y"),
    Hora = as.character(Hora),
    `Precio marginal en el sistema español (EUR/MWh)` = NA_character_,
    `Precio marginal en el sistema portugués (EUR/MWh)` = as.character(Preço)
  ) 

# Filtrar eficientemente
dados_csv_filtrado <- anti_join(dados_csv, df_old_convertido, by = c("Fecha", "Hora"))

# Juntar com df_old_convertido (que deve vir primeiro)
dados_combinados <- bind_rows(df_old_convertido, dados_csv_filtrado)

dados_csv <- dados_combinados %>%
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
  )

preco_manual=dados_csv[dados_csv$Data==page_date,3]
print(preco_manual,n=24)
tail(preco_manual,1)
dados_csv[1,4]=tail(preco_manual,1)

# Fim de alteração

dados_agrupados <- dados_csv %>%
  group_by(Data) %>%
  summarise(Preço = mean(Preço_Posterior, na.rm = TRUE)) %>%
  mutate(Futuro = as.integer(if_else(Data == max(Data), 1, 0)))

### 3 – Criação do dataframe de datas e junção dos dados

# Cria o calendário de 365 dias e adiciona o número da semana
df <- calendario <- tibble(Data = seq(as.Date("2010-01-01"), as.Date("2025-12-31"), by = "day")) %>%
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
    # Novo cálculo: último dia do mês e último domingo
    ultimo_dia_mes = ceiling_date(Data, "month") - 1,
    ultimo_domingo = ultimo_dia_mes - lubridate::wday(ultimo_dia_mes, week_start = 1) %% 7,
    
    Horas = case_when(
      Data == ultimo_domingo & month(Data) == 3 ~ 23,
      Data == ultimo_domingo & month(Data) == 10 ~ 25,
      TRUE ~ 24
    )
  ) %>%
  select(-ultimo_dia_mes, -ultimo_domingo)  # limpa colunas auxiliares

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

# dados tem tudo desde 2010 até fim de 2025#

dados_d <- dataset[, c("Data", "Dia", "Horas")] %>%
  rename(Preço = Dia)

# Garantir os comprimentos
n <- nrow(dados_d)
m <- length(dados_agrupados$Futuro)

# Construir vetor Futuro com valores iguais a dados_agrupados e o resto preenchido com 1
futuro_final <- c(dados_agrupados$Futuro, rep(1, max(0, n - m)))

# Atribuir ao dados_d
dados_d$Futuro <- futuro_final

calcular_dd_vetor <- function(d_vec) {
  d_vec <- as.Date(d_vec)
  
  m  <- month(d_vec)
  m1 <- month(d_vec + 1)
  d0 <- (d_vec %m-% months(1)) + 1
  dia1 <- as.Date(sprintf("%d-%02d-01", year(d_vec), m))
  
  as.Date(ifelse(m == m1, d0, dia1), origin = "1970-01-01")
}


dados_d <- dados_d %>% mutate(Data_i = calcular_dd_vetor(Data))


# Converter para data.table
dt <- as.data.table(dados_d)

# Criar coluna OMIE e FuturoM, linha a linha (mas eficiente com data.table)

dt[, c("OMIE", "FuturoM") := {
  resultado <- lapply(seq_len(.N), function(i) {
    d_ini <- Data_i[i]
    d_fim <- Data[i]
    sub <- dt[Data >= d_ini & Data <= d_fim]
    
    total_peso <- sum(sub$Horas, na.rm = TRUE)
    
    if (total_peso == 0) {
      list(NA_real_, NA_real_)
    } else {
      omie     <- sum(sub$Preço  * sub$Horas, na.rm = TRUE) / total_peso
      futuro_m <- sum(sub$Futuro * sub$Horas, na.rm = TRUE) / total_peso
      list(omie, futuro_m)
    }
  })
  
  # Separar listas para colunas
  list(
    sapply(resultado, `[[`, 1),
    sapply(resultado, `[[`, 2)
  )
}]

dt <- dt[Data >= as.Date("2023-07-01") & Data <= as.Date("2025-12-31")]
dt[, OMIE_real := ifelse(Futuro == 0, OMIE, NA)]
dt[, Projecao := ifelse(Futuro == 1, OMIE, NA)]

# Definir padding
padding <- 7

# Adicionar padding à tabela com NA
df_pad <- tibble(Data = seq(min(dt$Data) - padding, max(dt$Data) + padding, by = "day")) %>%
  left_join(dt, by = "Data") %>%
  arrange(Data)

# Valor médio para pontos invisíveis
ym <- mean(dt$OMIE_real, na.rm = TRUE)

# Criar gráfico
fig <- plot_ly(df_pad, x = ~Data) %>%
  add_lines(
    y = ~OMIE_real, name = "OMIE",
    line = list(color = "#118DFF", width = 3),
    hovertemplate = "Data: %{x|%d-%m-%Y}<br>OMIE: %{y:.2f}<extra></extra>"
  ) %>%
  add_lines(
    y = ~Projecao, name = "Projeção",
    line = list(color = "#E81123", width = 3, dash = "dot"),
    hovertemplate = "Data: %{x|%d-%m-%Y}<br>Projeção: %{y:.2f}<extra></extra>"
  ) %>%
  add_trace(  # Pontos invisíveis
    x = c(min(df_pad$Data), max(df_pad$Data)),
    y = c(ym, ym),
    type = "scatter", mode = "markers",
    marker = list(opacity = 0),
    hoverinfo = "skip",
    showlegend = FALSE
  ) %>%
  layout(
    xaxis = list(
      title = "Data", type = "date",
      showgrid = TRUE, gridcolor = "rgba(220,220,220,0.5)"
    ),
    yaxis = list(
      title = "", zeroline = FALSE,
      showgrid = TRUE, gridcolor = "rgba(220,220,220,0.5)"
    ),
    legend = list(
      orientation = "h", x = 0.5, xanchor = "center", y = 1.05
    ),
    hovermode = "closest",
    plot_bgcolor = "white",
    paper_bgcolor = "white",
    margin = list(t = 40, b = 40, l = 40, r = 40)
  )

fig

saveWidget(config(fig, displayModeBar = FALSE), "gs/grafico_omie_plotly.html", selfcontained = TRUE)



# 1. Criar um dataframe com todos os dias de 2025 e, para cada dia,
#    gerar as horas de 1 até o número indicado em df_final$Horas.
#    Em seguida, para cada combinação de Data e HoraD, replicar para Quarto de 1 a 4.

# Supondo que df_final possua uma linha por Data de 2025 e a coluna Horas indica quantas horas há naquele dia.
calendario <- df_final %>%
  filter(year(Data) == 2025) %>%
  select(Data, Horas)

dados_temp <- calendario %>%
  # Cria para cada Data uma lista com seq(1, Horas)
  mutate(HoraD = map(Horas, ~ seq(1, .x))) %>%
  unnest(HoraD) %>%
  # Para cada Data e HoraD, replicar para Quarto de 1 a 4
  crossing(Quarto = 1:4)

# 2. Separar as datas em duas partes, de acordo com o critério:
#    - Para datas anteriores ou iguaia à data máxima de dados_csv, usar o valor de Preço_Posterior.
#    - Para as demais datas, usar o valor de Dia do dataframe dados_d.
max_data_csv <- max(dados_csv$Data)

# Para as datas anteriores (inclusivo) à data máxima de dados_csv:
dados_pre <- dados_temp %>%
  filter(Data <= max_data_csv) %>%
  left_join(dados_csv %>% select(Data, HoraD, Preço_Posterior),
            by = c("Data", "HoraD")) %>%
  mutate(Preço = Preço_Posterior) %>%
  select(Data, Quarto, HoraD, Preço)

# Para as demais datas (Data > max_data_csv):
dados_pos <- dados_temp %>%
  filter(Data > max_data_csv) %>%
  left_join(dados, by = "Data") %>%  # dados contém as colunas Data e Dia
  mutate(Preço = Dia) %>%
  select(Data, Quarto, HoraD, Preço)

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
