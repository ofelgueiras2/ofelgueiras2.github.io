import requests
import re
import os

# Página do simulador
URL = "https://simuladorprecos.erse.pt/"
PASTA_DESTINO = "ERSE"

def obter_url_zip():
    try:
        res = requests.get(URL, timeout=10)
        res.raise_for_status()
    except Exception as e:
        print(f"❌ Erro ao aceder à página da ERSE: {e}")
        return None

    # Procura padrão exato de URL ZIP
    padrao = r'https://simuladorprecos\.erse\.pt/Admin/csvs/\d{8}%20\d{6}%20CSV\.zip'
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
        conteudo = requests.get(url_zip).content
        os.makedirs(PASTA_DESTINO, exist_ok=True)
        with open(caminho_ficheiro, "wb") as f:
            f.write(conteudo)
        print(f"✅ Guardado em {caminho_ficheiro}")
    except Exception as e:
        print(f"❌ Erro ao transferir o ficheiro: {e}")

if __name__ == "__main__":
    main()

