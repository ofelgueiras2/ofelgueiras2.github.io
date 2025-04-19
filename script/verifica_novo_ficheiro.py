import requests
from bs4 import BeautifulSoup
import os

# Página principal do simulador ERSE
URL = "https://simuladorprecos.erse.pt/"
PASTA_DESTINO = "ERSE"

def obter_url_zip():
    res = requests.get(URL, timeout=10)
    soup = BeautifulSoup(res.text, 'html.parser')

    for link in soup.find_all("a", href=True):
        href = link["href"]
        if href.endswith("CSV.zip"):
            return href if href.startswith("http") else URL + href
    return None

def main():
    url_zip = obter_url_zip()
    if not url_zip:
        print("❌ Nenhum ficheiro ZIP encontrado na página.")
        return

    nome_ficheiro = url_zip.split("/")[-1].replace(" ", "_")
    caminho_ficheiro = os.path.join(PASTA_DESTINO, nome_ficheiro)

    if os.path.exists(caminho_ficheiro):
        print(f"✔ Já existe localmente: {nome_ficheiro}")
        return

    print(f"🆕 Novo ficheiro encontrado: {nome_ficheiro}")
    conteudo = requests.get(url_zip).content
    with open(caminho_ficheiro, "wb") as f:
        f.write(conteudo)
    print(f"✅ Guardado em {caminho_ficheiro}")

if __name__ == "__main__":
    main()
