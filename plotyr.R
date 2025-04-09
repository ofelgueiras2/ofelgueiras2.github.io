# Versão com Plotly em R
library(plotly)
library(readr)
library(dplyr)

# Carregar os dados
df <- read_csv("data.csv") %>%
  mutate(Data = as.Date(Data)) %>%
  mutate(Projecao = ifelse(!is.na(OMIE) & !is.na(Projeção), NA, Projeção))

# Adicionar espaço antes e depois
df_pad <- tibble(
  Data = seq(min(df$Data) - 7, max(df$Data) + 7, by = "1 day")
) %>%
  left_join(df, by = "Data")

# Criar o gráfico
fig <- plot_ly(df_pad, x = ~Data)
fig <- fig %>% add_lines(y = ~OMIE, name = "OMIE",
                         line = list(color = '#118DFF', width = 3),
                         hovertemplate = 'Data: %{x|%d-%m-%Y}<br>OMIE: %{y:.2f}<extra></extra>')
fig <- fig %>% add_lines(y = ~Projeção, name = "Projeção",
                         line = list(color = '#E81123', width = 3, dash = 'dot'),
                         hovertemplate = 'Data: %{x|%d-%m-%Y}<br>Projeção: %{y:.2f}<extra></extra>')

# Linhas verticais
fig <- fig %>% layout(
  shapes = list(
    list(type = "line", x0 = as.Date("2023-07-01"), x1 = as.Date("2023-07-01"),
         yref = "paper", y0 = 0, y1 = 1, line = list(color = 'rgba(220,220,220,0.5)', width = 1)),
    list(type = "line", x0 = as.Date("2026-01-01"), x1 = as.Date("2026-01-01"),
         yref = "paper", y0 = 0, y1 = 1, line = list(color = 'rgba(220,220,220,0.5)', width = 1))
  ),
  xaxis = list(title = "Data", showgrid = TRUE, gridcolor = 'rgba(220,220,220,0.5)'),
  yaxis = list(title = "", showgrid = TRUE, gridcolor = 'rgba(220,220,220,0.5)', zeroline = FALSE),
  legend = list(orientation = 'h', x = 0.5, xanchor = 'center', y = 1.05),
  hovermode = 'closest',
  plot_bgcolor = 'white',
  paper_bgcolor = 'white',
  margin = list(t = 40, b = 40, l = 70, r = 40)
)

# Mostrar
fig
