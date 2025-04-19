from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from urllib.parse import unquote
import os
import requests

URL = "https://simuladorprecos.erse.pt/"
PASTA_DESTINO = "ERSE"

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')

driver = webdriver.Chrome(options=options)

try:
    driver.get(URL)
    driver.implicitly_wait(10)

    links = driver.find_elements(By.CLASS_NAME, 'csvPath')
    url_zip = None
    for link in links:
        href = link.get_attribute("href")
        if href and "CSV.zip" in href:
            url_zip = href
            break

    if not url_zip:
        print("❌ Link ZIP válido não encontrado.")
    else:
        nome_ficheiro = unquote(url_zip.split("/")[-1]).replace(" ", "_")
        caminho_ficheiro = os.path.join(PASTA_DESTINO, nome_ficheiro)

        if os.path.exists(caminho_ficheiro):
            print(f"✔ Já existe localmente: {nome_ficheiro}")
        else:
            conteudo = requests.get(url_zip).content
            os.makedirs(PASTA_DESTINO, exist_ok=True)
            with open(caminho_ficheiro, "wb") as f:
                f.write(conteudo)
            print(f"✅ Guardado em {caminho_ficheiro}")

finally:
    driver.quit()


finally:
    driver.quit()

