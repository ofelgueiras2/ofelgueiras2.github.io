#!/usr/bin/env Rscript

# Caminho para o arquivo CSV
csv_path <- "gs/SimuladorEletricidade_OF_MN_2025_2.csv"
csv_path2 <- "gs/SimuladorEletricidade_OF_MN_2025_3.csv"

# Obtém a data do último commit que alterou o arquivo
commit_date <- system(paste("git log -1 --format=%cd --", csv_path), intern = TRUE)

if (length(commit_date) == 0 || commit_date == "") {
  message("Nenhum commit encontrado para o arquivo. Nada a atualizar.")
  quit(status = 0)
}

# Opcional: formata a data para um padrão desejado (ex: "YYYY-MM-DD HH:MM:SS")
# Dependendo do formato padrão do git, ajuste o formato abaixo se necessário.
commit_date_formatted <- as.character(as.POSIXct(commit_date, format = "%a %b %d %H:%M:%S %Y", tz = "UTC"))
if (is.na(commit_date_formatted)) {
  # Se a conversão falhar, utiliza a string original
  commit_date_formatted <- commit_date
}

# Lê o arquivo CSV
# OBS: Se seu CSV possui cabeçalho, a leitura já ignora a primeira linha como dado
df <- read.csv(csv_path, stringsAsFactors = FALSE)

# Determina a linha a ser atualizada:
# Se o CSV possui cabeçalho, a "linha 4" do arquivo corresponde à linha 3 do data frame
row_to_update <- 3  # ajuste se necessário

# Verifica se o CSV possui pelo menos 42 colunas (coluna AP)
if (ncol(df) < 42) {
  stop("O arquivo CSV não possui 42 colunas.")
}

# Verifica o valor atual da célula (linha definida, coluna 42)
current_date <- as.character(df[row_to_update, 42])

if (current_date == commit_date_formatted) {
  message("A data do commit já está atualizada. Nenhuma alteração necessária.")
  quit(status = 0)
} else {
  message("Atualizando a data do commit na célula AP4...")
  df[row_to_update, 42] <- commit_date_formatted
  # Escreve novamente o CSV (sem incluir números das linhas)
  write.csv(df, csv_path2, row.names = FALSE)
  message("Arquivo CSV atualizado com sucesso!")
}
