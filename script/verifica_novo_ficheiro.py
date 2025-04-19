import requests
import re
import os

URL = "https://simuladorprecos.erse.pt/"
PASTA_DESTINO = "ERSE"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
}

def obter_url_zip():
    try:
        res = requests.get(URL, headers=headers, timeout=10)
        res.raise_for_status()
    except Exception as e:
        print(f"❌ Erro ao aceder à página da ERSE: {e}")
        return None

    padrao = r'https://simuladorprecos\.erse\.pt/Admin/csvs/\d{8} \d{6} CSV\.zip'
    zip_links = re.findall(padrao, res.text)

    if zip_links:
        return zip_links[0]
    else:
        print("❌ Nenhum link ZIP encontrado no HTML.")
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
    try:
        conteudo = requests.get(url_zip, headers=headers).content
        os.makedirs(PASTA_DESTINO, exist_ok=True)
        with open(caminho_ficheiro, "wb") as f:
            f.write(conteudo)
        print(f"✅ Guardado em {caminho_ficheiro}")
    except Exception as e:
        print(f"❌ Erro ao transferir o ficheiro: {e}")

if __name__ == "__main__":
    main()
