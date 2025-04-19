from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
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

    # Esperar até que o href do elemento csvPath contenha "CSV.zip"
    wait = WebDriverWait(driver, 20)
    element = wait.until(
        EC.presence_of_element_located((By.CLASS_NAME, "csvPath"))
    )

    url_zip = element.get_attribute("href")

    # Repetir espera até o href mudar de "#" para algo útil
    for _ in range(10):
        if url_zip and "CSV.zip" in url_zip:
            break
        driver.implicitly_wait(1)
        url_zip = element.get_attribute("href")

    if not url_zip or "CSV.zip" not in url_zip:
        print(f"❌ Link inválido ou ausente: {url_zip}")
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
