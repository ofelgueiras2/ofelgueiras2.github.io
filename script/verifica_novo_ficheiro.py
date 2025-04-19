import requests
from bs4 import BeautifulSoup
import os

URL = "https://simuladorprecos.erse.pt/"
PASTA_DESTINO = "ERSE"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

def obter_url_zip():
    res = requests.get(URL, headers=headers)
    soup = BeautifulSoup(res.text, "html.parser")
    link = soup.find('a', class_='csvPath')
    if link:
        return link['href']
    else:
        print("❌ Link ZIP não encontrado no HTML.")
        return None

def main():
    url_zip = obter_url_zip()
    if not url_zip:
        return

    nome_ficheiro = url_zip.split("/")[-1].replace(" ", "_")
    caminho_ficheiro = os.path.join(PASTA_DESTINO, nome_ficheiro)

    if os.path.exists(caminho_ficheiro):
        print(f"✔ Já existe localmente: {nome_ficheiro}")
        return

    print(f"🆕 Novo ficheiro encontrado: {nome_ficheiro}")
    conteudo = requests.get(url_zip, headers=headers).content
    os.makedirs(PASTA_DESTINO, exist_ok=True)
    with open(caminho_ficheiro, "wb") as f:
        f.write(conteudo)
    print(f"✅ Guardado em {caminho_ficheiro}")

if __name__ == "__main__":
    main()

