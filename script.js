// ✅ NOVO: caminhos para os dois ficheiros separados
const urlCSV_basico = "gs/Simulador_basico.csv";
const urlCSV_grande = "gs/Simulador_grande.csv";

let dadosCSV_basico = [];
let dadosCSV_grande = [];

// ✅ NOVO: estrutura adaptada às novas localizações
const tabelasBasicas = {
    Meses: { inicio: "AB6", fim: "AB24" },
    Perdas: { inicio: "AC6", fim: "AC24" },
    OMIE: { inicio: "AD6", fim: "AD24" },
    descSocial: { inicio: "AQ12", fim: "AQ15" },
    Indexados: { inicio: "AS3", fim: "AS9" },
    diasMeses: { inicio: "AT14", fim: "AT32" },
    indexBase: { inicio: "AT3", fim: "AT9" },
    strDias: { inicio: "AU14", fim: "AU32" },
    Ciclos: { inicio: "AV5", fim: "BC1" },
    intDatas: { inicio: "BE2", fim: "BE368" },
    empresasBiHorario: { inicio: "C41", fim: "C61" },
    empresasSimples: { inicio: "C5", fim: "C25" },
    preçosSimples: { inicio: "D5", fim: "W25" },
    preçosBiHorario: { inicio: "D41", fim: "AG61" },
    tabelasKVA: { inicio: "D2", fim: "W2" },
    tabelasKVABi: { inicio: "D38", fim: "AG38" },
    kVAsExtraTarSocial: { inicio: "U30", fim: "U32" },
    kVAsTarSocial: { inicio: "U30", fim: "U35" },
    descKVAsExtraTarSocial: { inicio: "V30", fim: "V32" },
    descKVAsTarSocial: { inicio: "V30", fim: "V35" },
    kVAs: { inicio: "Y6", fim: "Y15" },
    LuzigazFee: { inicio: "Z27", fim: "Z36" },
    TARPotencias: { inicio: "Z6", fim: "Z15" },
    detalheTarifarios: { inicio: "AM5", fim: "AM25" },
    tarifariosExtra: { inicio: "C68", fim: "C79" },
    detalheTarifariosExtra: { inicio: "B68", fim: "B79" },
    preçosSimplesExtra: { inicio: "D68", fim: "W79" },
};

const tabelasGrandes = {
    TData: { inicio: "A2", fim: "A35041" },
    TBTN_A: { inicio: "E2", fim: "E35041" },
    TBTN_B: { inicio: "F2", fim: "F35041" },
    TBTN_C: { inicio: "G2", fim: "G35041" },
    TPreco: { inicio: "H2", fim: "H35041" },
    TBD: { inicio: "B2", fim: "B35041" },
    TBS: { inicio: "B2", fim: "H35041" },
    TPT: { inicio: "D2", fim: "D35041" }
};

let adiarGrandes = false;

const variaveis = {
    perdas2024: "AC18",
    aano: "AP5",
    adata: "AP4",
    diasAno: "AP6",
    pdata: "AQ5",
    pdatam7: "AQ6",
    Medio: "AT26",
    luzboaCGS: "H29",
    luzboaFA: "H30",
    luzboaK: "H31",
    repsolQTarifa: "H33",
    repsolFA: "H34",
    coopernicoCGS: "J29",
    coopernicoK: "J30",
    luzigasCS: "J32",
    luzigasK: "J33",
    ibelectraCS: "J35",
    ibelectraK: "J36",
    plenitudeCGS: "L29",
    plenitudeGDOS: "L30",
    plenitudeFee: "L31",
    EDPK1: "L33",
    EDPK2: "L34",
    EDPK3: "L35",
    FTS: "N30",
    Audiovisual: "R29",
    DGEG: "R30",
    IES: "R31",
    kWhIVAPromocional: "R34",
    IVA_Audiovisual: "S29",
    IVA_DGEG: "S30",
    IVA_IES: "S31",
    IVAPromocional: "S34",
    IVABase: "S35",
    precoACP: "S36",
    descKWhTarSocial: "V36",
    TARSimples: "Z17",
    TARVazio: "Z18",
    TARNaoVazio: "Z19"
};

let sortField = "price";   // Valores possíveis: "default", "price", "tariff", "power", "simple"
let sortDirection = "asc";     // "asc" ou "desc"

// Armazena estado dos paineis
let estadoOmieAberto = false;
let estadoCalendarioAberto = false;
let estadoTsAberto = false;
  
// Nova variável DataS
let DataS = false;

const esquemas = ["azul-vermelho-claro", "azul-vermelho", "azul-creme-vermelho"];

// 1) Defina no topo do seu .js, junto aos outros mapas:
const rowBgVariants = {
  "azul-vermelho-claro": {
    quenteClaro: "#FFF7D0",
    quenteEscuro: "#F0E1BA",
    neutroClaro: "#F6F6F6",
    neutroEscuro: "#E2E2E2"
  },
  "azul-vermelho": {
    quenteClaro: "#FFF7D0",
    quenteEscuro: "#EAD8B1",
    neutroClaro: "#F6F6F6",
    neutroEscuro: "#D9D9D9"
  },
  "azul-creme-vermelho": {
    quenteClaro: "#FFF7D0",
    quenteEscuro: "#EAD8B1",
    neutroClaro: "#F6F6F6",
    neutroEscuro: "#D9D9D9"
  }
};

// mapa de cores de ícone para cada esquema
const coresIcone = {
  "azul-vermelho-claro": "#77D99A",
  "azul-vermelho":       "#FFFFFF",
  "azul-creme-vermelho": "#FFF6E5"
};

// mapeamento de cores para o header, um entry pra cada esquema
const headerColors = {
  "azul-vermelho-claro":  "#77D99A",   // #B3FFC9 #9DF2B9 #6EC270 #78d979 #7dd97e #6ECF8F #80E0AA #72D09A #77D99A
  "azul-vermelho":        "#00853c",   // #00853c
  "azul-creme-vermelho":  "#003D77"    // #003D77
};

const headerFtColors = {
  "azul-vermelho-claro":  "#000000",   // #B3FFC9 #9DF2B9 #6EC270 #78d979 #7dd97e
  "azul-vermelho":        "#ffffff",   // #00853c
  "azul-creme-vermelho":  "#ffffff"    // #003D77 #ffffff
};

// no topo do seu .js
const headerSecondaryColors = {
  "azul-vermelho-claro": "#375623",    // mantém o original
  "azul-vermelho":       "#375623",    // mantém o original
  "azul-creme-vermelho": "#007A1E"     // tom de verde pra esse esquema
};

const consumoBgColors = {
  "azul-vermelho-claro": "#FFC000",    // amarelo suave
  "azul-vermelho":       "#FFC000",    // laranja original
  "azul-creme-vermelho": "#F0B000"     // amarelo-queimado pro creme
};

// paletas de cores para cada esquema
const paletas = {
  "azul-vermelho-claro": {
    corMin: [158, 200, 255],
    corMed: [252, 252, 255],
    corMax: [255, 179, 179]
  },
  "azul-vermelho": {
    corMin: [90, 138, 198],
    corMed: [252, 252, 255],
    corMax: [248, 106, 108]
  },
  "azul-creme-vermelho": {
    corMin: [90, 138, 198],
    corMed: [255, 246, 229],
    corMax: [248, 106, 108]
  }
};

const potStyles = {
  "azul-vermelho-claro": { bg: "#375623", color: "#FFFFFF" },
  "azul-vermelho":       { bg: "#375623", color: "#FFFFFF" },
  "azul-creme-vermelho": { bg: "#007A1E", color: "#FFFFFF" }
};

const conStyles = {
  "azul-vermelho-claro": { bg: "#FFC000", color: "#000000" },
  "azul-vermelho":       { bg: "#FFC000", color: "#000000" },
  "azul-creme-vermelho": { bg: "#F0B000", color: "#000000" }
};

// valores de fallback, caso esquemaAtual não exista no objeto
const paletaDefault = paletas["azul-vermelho"];

// no topo do seu .js
const nomeStyles = {
  "azul-vermelho-claro":   "background-color:#FFC000; font-weight:bold; color:black;",
  "azul-vermelho":         "background-color:#FFC000; font-weight:bold; color:black;",
  "azul-creme-vermelho":   "background-color:#F0B000; font-weight:bold; color:black;"
};



let indiceEsquema = 0;  // começa no primeiro
// 3) Defina esquemaAtual a partir do índice
let esquemaAtual = esquemas[indiceEsquema];
// let esquemaAtual = "azul-vermelho-claro"; // pode ser "azul-vermelho" ou "azul-creme-vermelho"
let cornersRounded = false;



// 1) Função utilitária para converter "0,0323 €" em número
function parseEuro(str) {
    return parseFloat(
      str
        .replace("€", "")
        .replace(",", ".")
        .trim()
    ) || 0;
  }

// utilitária para percentagens “23%” → 0.23
function parsePercent(str) {
    return (parseFloat(str.replace("%", "").trim()) || 0) / 100;
  }
  
function setSort(field, direction) {
    sortField = field;
    sortDirection = direction;
    atualizarResultados();
}


// 🔹 Função para converter referência A1 para índices numéricos (linha e coluna)
function converterReferencia(ref) {
    const match = ref.match(/^([A-Z]+)(\d+)$/);
    if (!match) {
        console.error(`❌ Erro ao processar referência: ${ref}`);
        return null;
    }

    let [, col, row] = match;
    row = parseInt(row, 10) - 1; // Ajustar para índice zero-based

    let colIndex = 0;
    for (let i = 0; i < col.length; i++) {
        colIndex = colIndex * 26 + (col.charCodeAt(i) - 64);
    }

    colIndex -= 1; // Ajuste para índice zero-based

    console.log(`🔍 Conversão: ${ref} → Linha ${row}, Coluna ${colIndex}`);
    return { col: colIndex, row };
}

function extrair(matriz, { inicio, fim }) {
    const { col: c0, row: r0 } = converterReferencia(inicio);
    const { col: c1, row: r1 } = converterReferencia(fim);
    const tabela = [];
    for (let i = r0; i <= r1; i++) {
        if (matriz[i]) tabela.push(matriz[i].slice(c0, c1 + 1));
    }
    return tabela;
}


// 🔹 Função para obter uma tabela pelo nome
function obterTabela(nome) {
    if (tabelasBasicas[nome]) {
        return extrair(dadosCSV_basico, tabelasBasicas[nome]);
    } else if (tabelasGrandes[nome]) {
        if (adiarGrandes) {
            console.log(`⏳ Tabela grande '${nome}' ainda não carregada.`);
            return "⌛ Adiado";
        }
        return extrair(dadosCSV_grande, tabelasGrandes[nome]);
    } else {
        return `❌ Tabela '${nome}' não encontrada.`;
    }
}



// Função para obter variável pelo nome e mostrar a linha e coluna usadas
function obterVariavel(nome) {
    if (!dadosCSV_basico.length || !variaveis[nome]) {
        console.error(`❌ Variável "${nome}" não encontrada.`);
        return "Variável não encontrada";
    }

    const { col, row } = converterReferencia(variaveis[nome]);
    const valor = dadosCSV_basico[row]?.[col] || "Indefinido";

    console.log(`🔎 Teste variável ${nome}:`, valor);
    return valor;
}


async function carregarCSV(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Erro ${resp.status}`);
    const txt = await resp.text();
    return txt.split("\n").map(l =>
        l.split(";").map(v => {
            v = v.trim();
            if (v.match(/^-?\d+,\d+$/)) return parseFloat(v.replace(",", "."));
            if (v.match(/^-?\d+$/)) return parseInt(v);
            return v;
        })
    );
}

function trimZeros(value, decimals = 2) {
    // fixa decimals casas, converte para float (corta zeros) e volta a string
    return parseFloat(value.toFixed(decimals)).toString();
  }
  

console.log("🔍 Testando extração de tabelas...");
console.log("📌 Tabela kVAs:", obterTabela("kVAs"));

function preencherSelecaoMeses() {
    const meses = obterTabela("Meses")?.flat() || [];
    const selectMes = document.getElementById("mesSelecionado");
    selectMes.innerHTML = "";
    meses.forEach((mes, index) => {
        let option = document.createElement("option");
        option.value = index;
        option.textContent = mes;
        selectMes.appendChild(option);
    });
    const mesAtualIndex = new Date().getMonth();
    if (meses[mesAtualIndex]) {
        selectMes.value = mesAtualIndex;
    }
    console.log(`🔎 Mês atual selecionado: ${meses[mesAtualIndex]}`);
}

function atualizarResultados() {
    let consumo = parseFloat(document.getElementById("consumo").value);
    const raw = document.getElementById("potenciac").value;        // ex: "6.9"
    const potenciaSelecionada2 = raw + " kVA";                // → "6.9 kVA"
    const withComma = raw.replace('.', ',');                       // → "6,9"
    const potenciaSelecionada = withComma + ' kVA';                // → "6,9 kVA"
    //const idx = potenciasArray.indexOf(potenciaNum);
    console.log("📌 Potência selecionada:",potenciaSelecionada);

    if (isNaN(consumo)) consumo = 0;
    if (!potenciaSelecionada) potenciaSelecionada = "6,9 kVA";
    let mostrarNomesAlternativos = document.getElementById("mostrarNomes").checked;
    let incluirACP = document.getElementById("incluirACP").checked;
    let incluirContinente = document.getElementById("incluirContinente").checked;
    let incluirMeo = document.getElementById("incluirMeo").checked;
    let restringir = document.getElementById("restringir").checked;
    let incluirEDP = document.getElementById("incluirEDP").checked;

    const potencias = obterTabela("kVAs")?.map(row => row[0]) || [];
    // idx definido apóes conta potencias em atualizarResultados
    const idx = potencias.indexOf(potenciaSelecionada);
    const tarPot = obterTabela("TARPotencias")?.map(row => row[0]) || [];
    const tarPotSraw = tarPot[idx];            // ex: "0,3174 €"
    const tarPotSnum = parseEuro(tarPotSraw);

    console.log("📌 Potência selecionada, idx:",potenciaSelecionada,idx,raw);
    console.log("🔍 Conteúdo de potencias:", potencias);   
    console.log("🔍 Conteúdo de TARpotencias:", tarPot,tarPotSnum);
    
    // lê as duas tabelas (coluna única com strings “X,XXXX €”)
    const rawPotTS = obterTabela("descKVAsTarSocial")?.map(r => r[0]) || [];
    // seleciona o valor correspondente à potência escolhida
    const rawDescontoPotTS = rawPotTS[idx] || "0";
    // 2) desconto no kWh: vem da variável descKWhTarSocial (célula V36)
    const rawDescontoKwh = obterVariavel("descKWhTarSocial") || "0,00 €";

    // converte em número
    const descontoPotTS = parseEuro(rawDescontoPotTS);  // €/dia de potência
    const descontoKwhTS  = parseEuro(rawDescontoKwh);  // €/kWh de consumo

    console.log("Desconto potência TS:", descontoPotTS);
    console.log("Desconto kWh TS:", descontoKwhTS);


    const nomesTarifarios = obterTabela("empresasSimples")?.flat().map(nome => nome.replace(/\*+$/, "").trim()) || [];
    const nomesTarifariosDetalhados = obterTabela("detalheTarifarios")?.flat().map(nome => nome.replace(/\*+$/, "").trim()) || [];
    console.log("Tabela detalheTarifarios:", nomesTarifariosDetalhados);
    const tarifariosDados = obterTabela("preçosSimples");
    const OMIES = obterTabela("OMIE");
    const PerdasS = obterTabela("Perdas");
    const kVAsTarSocialS = obterTabela("kVAsTarSocial")?.map(row => row[0]) || [];
    console.log("🔎 OMIES:", OMIES);
    
    if (!potencias.length || !nomesTarifarios.length || !tarifariosDados.length) {
        console.error("Erro ao carregar tarifários.");
        return;
    }
    // extrai número da string "X,XX kVA"
    const potenciaNum = parseFloat(
        potenciaSelecionada
         .replace(" kVA", "")
         .replace(",", ".")
        );
    
    const famCheckbox = document.querySelector('#tsField input[type="checkbox"]#familiasNumerosas');
    famCheckbox.disabled = potenciaNum > 6.9;
        

    // desativa todos os radios se potência > 6.9 kVA
    document
        .querySelectorAll('input[name="tsType"]')
        .forEach(r => r.disabled = potenciaNum > 6.9);

    // (opcional) desativa também o checkbox de famílias numerosas se não houver TS
    const tsType = document.querySelector('input[name="tsType"]:checked').value;
    const hasTspartial = tsType === "ts-partial";

    // agora o tsFlag = 1 se for Tarifa Social OU Tarifa Social + isenção
    const tsFlag = (['ts', 'ts-partial'].includes(tsType) && potenciaNum <= 6.9)
        ? 1
        : 0;
    // agora o famFlag
    // só vale 1 se o checkbox estiver marcado e a potência for ≤ 6.9
    const famFlag = (famCheckbox.checked && potenciaNum <= 6.9) ? 1 : 0;

    console.log("Aplicar desconto tarifa social?", tsFlag);
    console.log("Aplicar desconto famílias numerosas?", famFlag);

    const diasMesesTabela = obterTabela("diasMeses")?.flat() || [];
    const strDiasTabela = obterTabela("strDias")?.flat() || [];

    const mesSelecionadoIndex = document.getElementById("mesSelecionado").selectedIndex;

    let diasS;
    let strDiasSimples;

    if (DataS) {
        const dataInicio = new Date(startDate.value);
        const dataFim = new Date(endDate.value);

        if (!isNaN(dataInicio) && !isNaN(dataFim)) {
            const diffMs = dataFim - dataInicio;
            diasS = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
            strDiasSimples = `${diasS}`;
            console.log(`🔎 DataS = true: diasS calculado = ${diasS}`);
        } else {
            console.warn("❗ Datas inválidas mesmo com DataS true — fallback para mês selecionado.");
            diasS = parseFloat(diasMesesTabela[mesSelecionadoIndex]) || 30;
            strDiasSimples = strDiasTabela[mesSelecionadoIndex] || "30";
        }
    } else {
        let diasInput = document.getElementById("dias").value.trim();
        diasInput = diasInput === "" ? NaN : parseFloat(diasInput.replace(",", "."));

        if (!isNaN(diasInput)) {
            diasS = diasInput;
            strDiasSimples = String(diasS);
        } else {
            diasS = parseFloat(diasMesesTabela[mesSelecionadoIndex]) || 30;
            strDiasSimples = strDiasTabela[mesSelecionadoIndex] || "30";
        }       

        console.log(`🔎 DataS = false: diasS = ${diasS}`);
    }

    console.log(`✅ diasS final: ${diasS}, strDiasSimples: ${strDiasSimples}`);

    
    let IVABaseSimples = parsePercent(obterVariavel("IVABase"));
    let AudiovisualS = parseEuro(obterVariavel("Audiovisual"));
    if (hasTspartial){
        AudiovisualS -=1.85;
    }
    let DGEGS = parseEuro(obterVariavel("DGEG"));
    let IESS = parseEuro(obterVariavel("IES")) * (1 - tsFlag);

    console.log(`✅ IEC: ${IESS}`);
    let IVA_AudiovisualSimples = parsePercent(obterVariavel("IVA_Audiovisual"));
    let IVA_DGEGSimples        = parsePercent(obterVariavel("IVA_DGEG"));
    let IVA_IESS               = parsePercent(obterVariavel("IVA_IES"));
    let kWhIVAPromocionalS = parseFloat(obterVariavel("kWhIVAPromocional")) || 0;
    if (famFlag){
        kWhIVAPromocionalS +=100;
    }
    kWhIVAPromocionalS = Math.round((kWhIVAPromocionalS * diasS) / 30);
    let IVAPromocionalS = parsePercent(obterVariavel("IVAPromocional"));
    let FTSS = parseEuro(obterVariavel("FTS"));
    let TARSimplesS = parseEuro(obterVariavel("TARSimples"));
    let MedioS = parseFloat(obterVariavel("Medio")) || 0;
    let luzboaCGSS = parseFloat(obterVariavel("luzboaCGS")) || 0;
    let luzboaFAS = parseFloat(obterVariavel("luzboaFA")) || 0;
    let luzboaKS = parseFloat(obterVariavel("luzboaK")) || 0;
    let ibelectraCSS = parseFloat(obterVariavel("ibelectraCS")) || 0;
    let ibelectraKS = parseFloat(obterVariavel("ibelectraK")) || 0;
    let perdas2024S = parseFloat(obterVariavel("perdas2024")) || 0;
    let precoACPS = parseEuro(obterVariavel("precoACP"));
    if (!incluirACP) {
        precoACPS = 0;
    }
    let luzigasCSS = parseFloat(obterVariavel("luzigasCS")) || 0;
    let luzigasKS = parseFloat(obterVariavel("luzigasK")) || 0;
    let repsolQTarifaS = parseFloat(obterVariavel("repsolQTarifa")) || 0;
    let repsolFAS = parseFloat(obterVariavel("repsolFA")) || 0;
    let coopernicoCGSS = parseFloat(obterVariavel("coopernicoCGS")) || 0;
    let coopernicoKS = parseFloat(obterVariavel("coopernicoK")) || 0;
    let plenitudeCGSS = parseFloat(obterVariavel("plenitudeCGS")) || 0;
    let plenitudeGDOSS = parseFloat(obterVariavel("plenitudeGDOS")) || 0;
    let plenitudeFeeS = parseFloat(obterVariavel("plenitudeFee")) || 0;
    let EDPK1S = parseFloat(obterVariavel("EDPK1")) || 0;
    let EDPK2S = parseFloat(obterVariavel("EDPK2")) || 0;
    
    // já tens as variáveis mesSelecionadoIndex, OMIES, DataS, startDate, endDate disponíveis dentro de atualizarResultados()

    

    let OMIESSelecionadoS;
    let PerdasSelecionadoS;
    let dataInicio, dataFim;
    let tudoTabela, tudoTPT, tDataTabela;
    let tBtnA, tBtnB, tBtnC;

    if (!DataS) {
        OMIESSelecionadoS  = OMIES[mesSelecionadoIndex]?.[0]  || 0;
        PerdasSelecionadoS = PerdasS[mesSelecionadoIndex]?.[0] || 0;
      } else {
        dataInicio   = new Date(startDate.value);
        dataFim      = new Date(endDate.value);
        tudoTabela   = obterTabela("TPreco").map(r => parseFloat(r[0]));
        tudoTPT      = obterTabela("TPT").map(r => parseFloat(r[0]));
        tDataTabela  = obterTabela("TData").map(raw => {
          if (!raw[0]) return new Date("Invalid Date");
          const [d, m, a] = raw[0].split('/');
          return new Date(`${a}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`);
        });

        // Acumuladores para OMIES
        let somaOMIES = 0, contaOMIES = 0;
        // Acumuladores para Perdas
        let somaPerdas = 0, contaPerdas = 0;

        for (let i = 0; i < tDataTabela.length; i++) {
            if (tDataTabela[i] >= dataInicio && tDataTabela[i] <= dataFim) {
                somaOMIES += tudoTabela[i];
                contaOMIES++;
                somaPerdas += tudoTPT[i];
                contaPerdas++;
            }
        }

        // Média e tratamento de divisão por zero — espelhando o /1000 e toFixed(5)
        OMIESSelecionadoS = contaOMIES > 0
            ? +(somaOMIES / contaOMIES / 1000).toFixed(5)
            : (OMIES[mesSelecionadoIndex]?.[0] || 0);

        PerdasSelecionadoS = contaPerdas > 0
            ? +(somaPerdas / contaPerdas).toFixed(5)
            : (PerdasS[mesSelecionadoIndex]?.[0] || 0);
    }

    console.log("🔎 OMIESSelecionadoS atualizado:", OMIESSelecionadoS);
    console.log("🔎 PerdasSelecionadoS atualizado:", PerdasSelecionadoS);

    let U3;
    let PerfilS = "";
    let PerfilM_S = "";

    if (DataS) {
        // 1) Carrega todas as colunas de uma só vez
        tBtnA = obterTabela("TBTN_A").map(r => parseFloat(r[0])) || [];
        tBtnB = obterTabela("TBTN_B").map(r => parseFloat(r[0])) || [];
        tBtnC = obterTabela("TBTN_C").map(r => parseFloat(r[0])) || [];
    
        // 2) Calcula U3
        let somaBtnC = 0, cntBtnC = 0;
        for (let i = 0; i < tDataTabela.length; i++) {
            if (tDataTabela[i] >= dataInicio && tDataTabela[i] <= dataFim) {
                somaBtnC += tBtnC[i];
                cntBtnC++;
            }
        }
        U3 = cntBtnC > 0 ? consumo / somaBtnC * 1000 : 0;
    
        // 3) Decide o Perfil (BTN A, B ou C)
        if (potenciaNum > 13.8) {
            PerfilS = "BTN A";
        } else if (U3 >= 7140) {
            PerfilS = "BTN B";
        } else {
            PerfilS = "BTN C";
        }
    
        // 4) Calcula a média do perfil
        let somaBtns = 0, contaBtns = 0;
        for (let i = 0; i < tDataTabela.length; i++) {
            if (tDataTabela[i] >= dataInicio && tDataTabela[i] <= dataFim) {
                const btnVal =
                    PerfilS === "BTN A" ? tBtnA[i] :
                    PerfilS === "BTN B" ? tBtnB[i] :
                                         tBtnC[i];
                somaBtns += btnVal;
                contaBtns++;
            }
        }
        PerfilM_S = contaBtns > 0 ? somaBtns / contaBtns : "";
    } else {
        U3 = "";
        PerfilS = (potenciaNum > 13.8) ? "BTN A" : "BTN C"; // mantém lógica de fallback
        PerfilM_S = "";
    }

    console.log("🔎 PerfilM_S:", PerfilM_S);


    const colIndex = potencias.indexOf(potenciaSelecionada);
    if (colIndex === -1) {
        throw new Error("Potência selecionada inválida.");
    }
    const colPotencia = colIndex * 2;
    const colSimples = colPotencia + 1;

    const luzigasFeeTabela = obterTabela("LuzigazFee")?.flat() || [];
    let luzigasFeeS = luzigasFeeTabela[colIndex] || "0";
    luzigasFeeS = parseFloat(luzigasFeeS.replace("€", "").replace(",", ".").trim()) || 0;
    const multiplicador = DataS === true
    ? diasS / MedioS // SE(DataS=true; diasS/MedioS; 1)
    : 1;
    let luzigasFee0 = luzigasFeeS
    luzigasFeeS = parseFloat(
        (
          luzigasFeeS
          * multiplicador
          * (1 + IVABaseSimples)
        )
      );
    
    let IVAFixoS;
    console.log("Potência, IVA, TS:", potenciaSelecionada, IVAFixoS, kVAsTarSocialS)
    if (kVAsTarSocialS.includes(potenciaSelecionada)) {
        IVAFixoS = IVAPromocionalS;
    } else {
        IVAFixoS = IVABaseSimples;
    }
    console.log("IVAFixoS:", IVAFixoS)

    console.log("OMIE:", OMIESSelecionadoS)
    const omieInputValue = parseFloat(document.getElementById('omieInput')?.value);
    if (!isNaN(omieInputValue)) {
    OMIESSelecionadoS = omieInputValue;
    }
    console.log("OMIE:", OMIESSelecionadoS, omieInputValue, DataS)
    console.log("potenciaNum:", potenciaNum)

    // --- Criação do array de tarifários a partir dos dados CSV ---
    // MODIFICAÇÃO 1: Marcação dos tarifários indexados (empresas entre C19 e C25)
    let tarifarios = nomesTarifarios
    .map((nome, i) => {
    // --- filtrar potências não numéricas ---
    const rawPot = tarifariosDados[i]?.[colPotencia];
    const parsedPot = parseFloat(String(rawPot).replace(",", "."));
    if (isNaN(parsedPot)) return null;
    let potencia = parsedPot;
    
    // --- determinar se é indexado (está entre as linhas C19 a C25) ---
    // como há offset de 5 (a tabela começa em C5), a condição é i+5 ∈ [19,25]
    let isIndexado = (i + 5 >= 19 && i + 5 <= 25);

        
    let simples;

        if (nome === "Luzboa indexado") {
            if (DataS) {
                // Média do intervalo (com TPreço/tudoTabel a, TPT/tudoTPT, etc.)
                let soma = 0, conta = 0;
                for (let i = 0; i < tDataTabela.length; i++) {
                    if (tDataTabela[i] >= dataInicio && tDataTabela[i] <= dataFim) {
                        soma += (tudoTabela[i] / 1000 + luzboaCGSS)
                              * luzboaFAS
                              * (1 + tudoTPT[i])
                              + luzboaKS;
                        conta++;
                    }
                }
        
                if (conta > 0) {
                    const media = soma / conta;
                    simples = parseFloat((media + TARSimplesS).toFixed(4));
                } else {
                    // fallback para simples padrão
                    const base = (OMIESSelecionadoS + luzboaCGSS)
                               * (1 + PerdasSelecionadoS)
                               * luzboaFAS
                               + luzboaKS
                               + TARSimplesS;
                    simples = parseFloat(base.toFixed(4));
                }
        
            } else {
                // DataS === false: apenas o cálculo simples
                const base = (OMIESSelecionadoS + luzboaCGSS)
                           * (1 + PerdasSelecionadoS)
                           * luzboaFAS
                           + luzboaKS
                           + TARSimplesS;
                simples = parseFloat(base.toFixed(4));
            }   
        } else if (nome === "Ibelectra indexado") {
            simples = parseFloat(((OMIESSelecionadoS + ibelectraCSS) * (1 + perdas2024S) + ibelectraKS + TARSimplesS).toFixed(5));
        } else if (nome.startsWith("Luzigás Energy 8.8")) {
            simples = parseFloat(((OMIESSelecionadoS + luzigasCSS) * (1 + PerdasSelecionadoS) + luzigasKS + TARSimplesS).toFixed(4));
        } else if (nome === "EDP indexado") {
            simples = parseFloat((OMIESSelecionadoS * EDPK1S + EDPK2S + TARSimplesS).toFixed(4));
        } else if (nome === "Repsol indexado") {
            if (DataS) {
              // 1) soma os valores só no intervalo
              let soma = 0, conta = 0;
              for (let i = 0; i < tDataTabela.length; i++) {
                if (tDataTabela[i] >= dataInicio && tDataTabela[i] <= dataFim) {
                  // escolhe o TBTN_X correto conforme PerfilS
                  const fatorBtn = 
                    PerfilS === "BTN A" ? tBtnA[i] :
                    PerfilS === "BTN B" ? tBtnB[i] :
                                         tBtnC[i];
          
                  // (TPreço/1000*(1+TPT)*RepsolFA + RepsolQTarifa) * fatorBtn
                  const valor = 
                    (tudoTabela[i] / 1000 * (1 + tudoTPT[i]) * repsolFAS
                      + repsolQTarifaS)
                    * fatorBtn;
          
                  soma += valor;
                  conta++;
                }
              }
          
              if (conta > 0) {
                // 2) calcula a média e divide por PerfilM_S
                const media = soma / conta / PerfilM_S;
                // 3) arredonda a 6 casas e adiciona TARSimplesS
                simples = parseFloat((media + TARSimplesS).toFixed(6));
              } else {
                // fallback idêntico ao “simples” quando não há dados no intervalo
                const base = 
                  OMIESSelecionadoS * (1 + PerdasSelecionadoS) * repsolFAS
                  + repsolQTarifaS
                  + TARSimplesS;
                simples = parseFloat(base.toFixed(6));
              }
          
            } else {
              // DataS === false → sempre o cálculo simples
              const base =
                OMIESSelecionadoS * (1 + PerdasSelecionadoS) * repsolFAS
                + repsolQTarifaS
                + TARSimplesS;
              simples = parseFloat(base.toFixed(6));
            }
        } else if (nome === "Coopérnico") {
            if (DataS) {
              // 1) Calcula soma e conta dos valores no intervalo
              let soma = 0, conta = 0;
              for (let i = 0; i < tDataTabela.length; i++) {
                if (tDataTabela[i] >= dataInicio && tDataTabela[i] <= dataFim) {
                  // escolhe o TBTN_X correto segundo o PerfilS
                  const fatorBtn =
                    PerfilS === "BTN A" ? tBtnA[i] :
                    PerfilS === "BTN B" ? tBtnB[i] :
                                          tBtnC[i];
          
                  // ((TPreço/1000 + CoopernicoCGS + CoopernicoK) * (1+TPT)) * fatorBtn
                  const valor =
                    (tudoTabela[i] / 1000
                     + coopernicoCGSS
                     + coopernicoKS)
                    * (1 + tudoTPT[i])
                    * fatorBtn;
          
                  soma += valor;
                  conta++;
                }
              }
          
              if (conta > 0) {
                // 2) média normalizada por PerfilM_S
                const media = soma / conta / PerfilM_S;
                // 3) arredonda a 6 casas, soma TARSimplesS antes do .toFixed
                simples = parseFloat((media + TARSimplesS).toFixed(6));
              } else {
                // fallback “simples” quando não houver dados no intervalo
                simples = parseFloat(
                  (
                    (OMIESSelecionadoS + coopernicoCGSS + coopernicoKS)
                    * (1 + PerdasSelecionadoS)
                    + TARSimplesS
                  ).toFixed(6)
                );
              }
          
            } else {
              // DataS = false → sempre o cálculo simples de fallback
              simples = parseFloat(
                (
                  (OMIESSelecionadoS + coopernicoCGSS + coopernicoKS)
                  * (1 + PerdasSelecionadoS)
                  + TARSimplesS
                ).toFixed(6)
              );
            }
        } else if (nome === "Plenitude indexado") {
            if (DataS) {
              // 1) calculo da soma ponderada no intervalo
              let soma = 0, conta = 0;
              for (let i = 0; i < tDataTabela.length; i++) {
                if (tDataTabela[i] >= dataInicio && tDataTabela[i] <= dataFim) {
                  // escolhe o TBTN_X consoante o Perfil
                  const fatorBtn =
                    PerfilS === "BTN A" ? tBtnA[i] :
                    PerfilS === "BTN B" ? tBtnB[i] :
                                          tBtnC[i];
          
                  // ((TPreço/1000 + CGS + GDOs) * (1+TPT) + Fee)
                  const componente =
                    (tudoTabela[i] / 1000
                      + plenitudeCGSS
                      + plenitudeGDOSS)
                    * (1 + tudoTPT[i])
                    + plenitudeFeeS;
          
                  soma += componente * fatorBtn;
                  conta++;
                }
              }
          
              if (conta > 0) {
                // 2) média normalizada por PerfilM_S
                const media = soma / conta / PerfilM_S;
                // 3) arredonda a 4 decimais e soma TARSimplesS
                simples = parseFloat((media + TARSimplesS).toFixed(4));
              } else {
                // fallback: cálculo simples igual ao Excel + TARSimplesS
                const base =
                  (OMIESSelecionadoS + plenitudeCGSS + plenitudeGDOSS)
                  * (1 + PerdasSelecionadoS)
                  + plenitudeFeeS;
                simples = parseFloat((base + TARSimplesS).toFixed(4));
              }
          
            } else {
              // DataS = false → sempre o simples de fallback + TARSimplesS
              const base =
                (OMIESSelecionadoS + plenitudeCGSS + plenitudeGDOSS)
                * (1 + PerdasSelecionadoS)
                + plenitudeFeeS;
              simples = parseFloat((base + TARSimplesS).toFixed(4));
            }
          
            console.log("Plenitude indexado:", simples);
        } else {                            
            simples = parseFloat(tarifariosDados[i]?.[colSimples]) || 0;
        }

        if (nome === "Meo" && incluirMeo) {
            simples -= 0.01;
        }

        // —> só aplica desconto se o usuário marcou EDP e potência ≥ 3,45 kVA
        let descontoEDP = 0;
        if (incluirEDP) {
        if (potenciaNum >= 3.45) {
        descontoEDP = -10;  // valor original do desconto
        }
   }

        const nomeExibido = mostrarNomesAlternativos && nomesTarifariosDetalhados[i] ? nomesTarifariosDetalhados[i] : nome;
        console.log("Potência, IVA, TS:", potenciaSelecionada, IVAFixoS, kVAsTarSocialS)
        console.log("Potência, IVA, TS:", potenciaSelecionada, potenciaSelecionada2, potenciaNum)

        // —> IVA de 6% para potência <= 3,45 kVA
        //if (potenciaNum <= 3.45) {
        //IVABaseSimples = 0.06;  // valor original do desconto
        //}
        potencia -= tsFlag * descontoPotTS;
        simples -= tsFlag * descontoKwhTS;   

        
        let custo6 =
            simples * Math.min(consumo, kWhIVAPromocionalS)
            + AudiovisualS
            + (potenciaNum <= 3.45 ? tarPotSnum : 0) * diasS
            - tsFlag * (potenciaNum <= 3.45 ? descontoPotTS : 0) * diasS;
        let custo23 = (potencia - (potenciaNum <= 3.45 ? tarPotSnum - tsFlag * descontoPotTS : 0)) * diasS 
            + simples * Math.max(consumo - kWhIVAPromocionalS, 0) + DGEGS + consumo * IESS;
        let custo = (potencia * diasS * (1 + IVABaseSimples)) +
                    simples * (Math.max(consumo - kWhIVAPromocionalS, 0) * (1 + IVABaseSimples) +
                               Math.min(consumo, kWhIVAPromocionalS) * (1 + IVAFixoS)) +
                    (AudiovisualS * (1 + IVA_AudiovisualSimples)) +
                    (DGEGS * (1 + IVA_DGEGSimples)) +
                    consumo * (IESS * (1 + IVA_IESS));
        //Desconto de baixas potências
        if (potenciaNum <= 3.45) {
            custo -= (tarPotSnum - tsFlag * descontoPotTS) * diasS * (IVABaseSimples - IVAFixoS);
        }

        if (nome.startsWith("Luzigás Energy 8.8") && diasS > 0) {
            potencia += luzigasFeeS / diasS / (1 + IVABaseSimples);
            custo += parseFloat(luzigasFeeS.toFixed(2));
        }
    
        if (nome.startsWith("Goldenergy ACP")) {
            custo += precoACPS;
        }

        if (nome.startsWith("Goldenergy")) {
            custo += consumo * FTSS * (1 + IVABaseSimples);
        }

        if (nome.startsWith("Repsol") || nome === "G9" || nome.startsWith("Luzboa") || nome === "Ibelectra indexado" || nome.startsWith("Luzigás Energy 8.8") ||
            nome === "Coopérnico") {
            custo += (Math.max(consumo - kWhIVAPromocionalS, 0) * (1 + IVABaseSimples) +
            Math.min(consumo, kWhIVAPromocionalS) * (1 + IVAFixoS)) * FTSS;
        }

        if (nome.startsWith("EDP indexado")) {
            custo += descontoEDP;
        }
    
        return {
            nome: nomeExibido,
            potencia,
            simples,
            custo: parseFloat(custo.toFixed(2)),
            isIndexado // Propriedade adicionada para identificar tarifários indexados
        };
    })
    // remove os nulos gerados acima
   .filter(t => t !== null);
    
    if (!restringir) {
        const nomesTarifariosExtra = obterTabela("tarifariosExtra")?.flat() || [];
        const nomesTarifariosDetalhadosExtra = obterTabela("detalheTarifariosExtra")?.flat() || [];
        const tarifariosDadosExtra = obterTabela("preçosSimplesExtra");

        nomesTarifariosExtra.forEach((nome, i) => {
        // 1) lemos raw, convertendo em string
        const rawPot = tarifariosDadosExtra[i]?.[colPotencia];
        const parsedPot = parseFloat(String(rawPot).replace(",", "."));
        // 2) se não for número, saltamos este tarifário
        if (isNaN(parsedPot)) return;
        // 3) caso OK, usamos parsedPot
        let potencia = parsedPot;
        let simples = parseFloat(
          String(tarifariosDadosExtra[i]?.[colSimples])
            .replace(",", ".")
        ) || 0;
        
        if (nome === "Galp Continente" && incluirContinente) {
            potencia *= 0.9;
            simples *= 0.9;
        }

            
            const nomeExibido = mostrarNomesAlternativos && nomesTarifariosDetalhadosExtra[i] ? nomesTarifariosDetalhadosExtra[i] : nome;
            potencia -= tsFlag * descontoPotTS;
            simples -= tsFlag * descontoKwhTS;  
            
            let custo = (potencia * diasS * (1 + IVABaseSimples)) +
                    simples * (Math.max(consumo - kWhIVAPromocionalS, 0) * (1 + IVABaseSimples) +
                               Math.min(consumo, kWhIVAPromocionalS) * (1 + IVAFixoS)) +
                    (AudiovisualS * (1 + IVA_AudiovisualSimples)) +
                    (DGEGS * (1 + IVA_DGEGSimples)) +
                    consumo * (IESS * (1 + IVA_IESS));
                    
                    //Desconto de baixas potências
                    if (potenciaNum <= 3.45) {
                        custo -= (tarPotSnum - tsFlag * descontoPotTS) * diasS * (IVABaseSimples - IVAFixoS);
                    }

           
            
            tarifarios.push({
                nome: nomeExibido,
                potencia,
                simples,
                custo: parseFloat(custo.toFixed(2))
            });
        });
    }
    
    const inputFixoVal = document.getElementById("fixo").value.trim();
    const inputVariavelVal = document.getElementById("variavel").value.trim();

    if (inputFixoVal !== "" && inputVariavelVal !== "") {
        const potenciaMeu = parseFloat(inputFixoVal.replace(",", "."));
        const simplesMeu = parseFloat(inputVariavelVal.replace(",", "."));
        
        if (!isNaN(potenciaMeu) && !isNaN(simplesMeu)) {
            const custoMeu = (potenciaMeu * diasS * (1 + IVABaseSimples)) +
                             (simplesMeu * (Math.max(consumo - kWhIVAPromocionalS, 0) * (1 + IVABaseSimples) +
                                            Math.min(consumo, kWhIVAPromocionalS) * (1 + IVAFixoS))) +
                             (AudiovisualS * (1 + IVA_AudiovisualSimples)) +
                             (DGEGS * (1 + IVA_DGEGSimples)) +
                             (consumo * (IESS * (1 + IVA_IESS)));
                             
            const meuTarifario = {
                nome: "Meu tarifário",
                potencia: potenciaMeu,
                simples: simplesMeu,
                custo: parseFloat(custoMeu.toFixed(2))
            };
            console.log("Inserindo Meu tarifário:", meuTarifario);
            tarifarios.push(meuTarifario);
        } else {
            console.error("Erro ao converter os valores dos inputs de 'Meu tarifário' para número.");
        }
    } else {
        console.log("Inputs de 'Meu tarifário' não preenchidos.");
    }

   
    if (sortField === "default") {
        // A ordem padrão é a ordem de criação; se 'desc', inverte o array
        if (sortDirection === "desc") {
            tarifarios.reverse();
        }
    } else if (sortField === "price") {
        tarifarios.sort((a, b) => sortDirection === "asc" ? a.custo - b.custo : b.custo - a.custo);
    } else if (sortField === "tariff") {
        tarifarios.sort((a, b) => sortDirection === "asc" ? a.nome.localeCompare(b.nome) : b.nome.localeCompare(a.nome));
    } else if (sortField === "power") {
        tarifarios.sort((a, b) => sortDirection === "asc" ? a.potencia - b.potencia : b.potencia - a.potencia);
    } else if (sortField === "simple") {
        tarifarios.sort((a, b) => sortDirection === "asc" ? a.simples - b.simples : b.simples - a.simples);
    }
    

    const indexMeu = tarifarios.findIndex(t => t.nome === "Meu tarifário");
    if (indexMeu > 0) {
        const [meu] = tarifarios.splice(indexMeu, 1);
        tarifarios.unshift(meu);
    }
    
    preencherLista(tarifarios);
    calcularPreco(tarifarios, consumo, potenciaSelecionada);
    
    function preencherLista(tarifarios) {
        const lista = document.getElementById("listaTarifarios");
        lista.innerHTML = "";
    }
    
    // MODIFICAÇÃO 2: Aplicar fundo amarelo (mesmo do "Meu tarifário") para tarifários indexados
    function calcularPreco(tarifarios, consumo, potenciaSelecionada) {
        const minPotencia = Math.min(...tarifarios.map(t => t.potencia));
        const maxPotencia = Math.max(...tarifarios.map(t => t.potencia));
        const minSimples = Math.min(...tarifarios.map(t => t.simples));
        const maxSimples = Math.max(...tarifarios.map(t => t.simples));
        const minCusto = Math.min(...tarifarios.map(t => t.custo));
        const maxCusto = Math.max(...tarifarios.map(t => t.custo));

        // busca a cor correta pro ícone (fallback para "#FFF" se algo der errado)
        const iconColor = coresIcone[esquemaAtual] || "#FFF";
        

        // LOGO NO INÍCIO DE calcularPreco, antes de montar tabelaResultados: 00853c
        // const headerPrimary = esquemaAtual === "azul-creme-vermelho" ? "#003D77" : "#6EC270";
        // — o “verde de cima” passa a azul escuro ou fica o verde original
        const headerPrimary = headerColors[esquemaAtual] || "#000";
        const headerFtPrimary = headerFtColors[esquemaAtual] || "#ffffff";
        document.documentElement.style.setProperty(
          "--header-ft-primary",
          headerFtPrimary
        );

        // const headerSecondary = esquemaAtual === "azul-creme-vermelho" ? "#007A1E" : "#375623";
        // — a linha que era escura (o fundo do botão + Consumo) passa a este tom de azul ou ao original

        // const consumoBg = esquemaAtual === "azul-creme-vermelho" ? "#F0B000" : "#FFC000";
        // — o laranja original (FFC000) passa a amarelo suave (FFFF66)

        // escolhe as cores a partir do esquemaAtual
        const headerSecondary = headerSecondaryColors[esquemaAtual] || "#375623";  // fallback
        const consumoBg      = consumoBgColors[esquemaAtual] || "#FFC000";  // fallback


        // Funções auxiliares
        function calcularCor(valor, min, max) {
            if (min === max) {
                return "rgb(255, 255, 255)"; // evita divisões por zero
            }
        
            let t = (valor - min) / (max - min); // normalizar para [0,1]
        
            // let corMin, corMed, corMax;
        
            const { corMin, corMed, corMax } = paletas[esquemaAtual] || paletaDefault;
        
            let corFinal;
            if (t <= 0.5) {
                let percent = t * 2;
                corFinal = corMin.map((c, i) => Math.round(c + percent * (corMed[i] - c)));
            } else {
                let percent = (t - 0.5) * 2;
                corFinal = corMed.map((c, i) => Math.round(c + percent * (corMax[i] - c)));
            }
        
            return `rgb(${corFinal[0]}, ${corFinal[1]}, ${corFinal[2]})`;
        }
        
        

        const toggleIcon = cornersRounded ? "\u25A1" /* □ */ : "\u25CB" /* ○ */;
        
        let tabelaResultados = `<table style="border-spacing: 1px 1px; border-collapse: separate;">

    
        <tr> 
          <th colspan="3" rowspan="2" 
                class="interno fixed-tlr" style="background-color:${headerSecondary}; color:white; text-align:center; vertical-align:middle; position:relative;
          font-weight: normal;line-height:1;">
            <button id="btnEsquema" title="Alterar cores" style="position:absolute;top:5px;left:5px;
            width: 30px;      /* nova largura */    
            height: 30px;     /* altura igual */
            padding: 0;       /* sem espaço interior */
            text-align:center;background:none;border:none;cursor:pointer;color: ${iconColor};transition: color .3s;">
            
            <svg aria-hidden="true"
               class="zap-logo"
                 viewBox="-2 -2 28 28"
              width="30" height="30"
              fill="currentColor"
            >
            <use href="icons.svg#zap-logo"></use>
            </svg>

            </button>

            <button id="btnToggleCorners" title="Alternar cantos">
            <span id="shapeToggle">${toggleIcon}</span>
            </button>

            <div style="font-weight: bold;margin-top: 15px;margin-bottom: 10px;">Potência contratada ${potenciaSelecionada2}</div>
            <br>
            <div style="font-size: 14px;margin-bottom: -10px;">${strDiasSimples} dia${(typeof diasS === 'number' && diasS !== 1 ? 's' : '')}</div>
            <br>
            <div style="font-size: 14px;">OMIE = ${OMIESSelecionadoS} €/kWh</div>            
            <span class="sort-container">
              <span class="sort-arrow0 ${sortField==='default' && sortDirection==='asc' ? 'selected' : ''}" onclick="setSort('default','asc')" title="Ordenar conforme a ordem no Excel">&#9650;</span>
              <span class="sort-arrow0 ${sortField==='default' && sortDirection==='desc' ? 'selected' : ''}" onclick="setSort('default','desc')" title="Ordenar conforme a ordem inversa no Excel">&#9660;</span>
            </span>
          </th>
          <th class="interno fixed-trr" style="background-color:${headerSecondary};color:white; text-align:center;">
            Consumo (kWh)
          </th>
        </tr>
        
        <tr>
          <td class="interno" style="background-color:${consumoBg}; font-weight:bold; color:black; text-align:center;">
            ${consumo || 0}
          </td>
        </tr>
        <tr>
          <th class="interno" style="background-color:${headerPrimary}; font-weight:bold; border-radius: 10px;color:${headerFtPrimary}; text-align:center; position:relative;">
            Tarifário
            <span class="sort-container">
              <span class="sort-arrow ${sortField==='tariff' && sortDirection==='asc' ? 'selected' : ''}" onclick="setSort('tariff','asc')" title="Ordenar alfabeticamente (A → Z)">&#9650;</span>
              <span class="sort-arrow ${sortField==='tariff' && sortDirection==='desc' ? 'selected' : ''}" onclick="setSort('tariff','desc')" title="Ordenar alfabeticamente (Z → A)">&#9660;</span>
            </span>
          </th>
          <th class="interno" style="background-color:${headerPrimary}; font-weight:bold; border-radius: 10px;color:${headerFtPrimary}; text-align:center; position:relative;" class="has-tooltip" title="Custo diário sem IVA">
            Potência (€/dia)
            <span class="sort-container">
              <span class="sort-arrow ${sortField==='power' && sortDirection==='asc' ? 'selected' : ''}" onclick="event.stopPropagation();setSort('power','asc')" title="Ordenar do menor para o maior">&#9650;</span>
              <span class="sort-arrow ${sortField==='power' && sortDirection==='desc' ? 'selected' : ''}" onclick="event.stopPropagation();setSort('power','desc')" title="Ordenar do maior para o menor">&#9660;</span>
            </span>
          </th>
          <th class="interno" style="background-color:${headerPrimary}; font-weight:bold; border-radius: 10px;color:${headerFtPrimary}; text-align:center; position:relative;" class="has-tooltip" title="Custo por kWh sem IVA">
            Energia (€/kWh)
            <span class="sort-container">
              <span class="sort-arrow ${sortField==='simple' && sortDirection==='asc' ? 'selected' : ''}" onclick="event.stopPropagation();setSort('simple','asc')" title="Ordenar do menor para o maior">&#9650;</span>
              <span class="sort-arrow ${sortField==='simple' && sortDirection==='desc' ? 'selected' : ''}" onclick="event.stopPropagation();setSort('simple','desc')" title="Ordenar do maior para o menor">&#9660;</span>
            </span>
          </th>
          <th class="interno" style="background-color:${headerPrimary}; font-weight:bold; border-radius: 10px;color:${headerFtPrimary}; text-align:center; position:relative;" class="has-tooltip" title="Preço final da fatura (com taxas e impostos)">
            Preço (€)
            <span class="sort-container">
              <span class="sort-arrow ${sortField==='price' && sortDirection==='asc' ? 'selected' : ''}" onclick="event.stopPropagation();setSort('price','asc')" title="Ordenar do menor para o maior">&#9650;</span>
              <span class="sort-arrow ${sortField==='price' && sortDirection==='desc' ? 'selected' : ''}" onclick="event.stopPropagation();setSort('price','desc')" title="Ordenar do maior para o menor">&#9660;</span>
            </span>
          </th>
        </tr>`;
      



    
      tarifarios.forEach((tarifa, index) => {
        const corPotencia = calcularCor(tarifa.potencia, minPotencia, maxPotencia);
        const corSimples = calcularCor(tarifa.simples, minSimples, maxSimples);
        const corCusto = calcularCor(tarifa.custo, minCusto, maxCusto);

        const isMinPotencia = tarifa.potencia === minPotencia ? "font-weight:bold;" : "";
        const isMinSimples = tarifa.simples === minSimples ? "font-weight:bold;" : "";
        const isMinCusto = tarifa.custo === minCusto ? "font-weight:bold;" : "";

        // MODIFICAÇÃO 2: Se for "Meu tarifário" ou tarifário indexado, aplicar fundo amarelo
        // antes de entrar no tarifarios.forEach:
        const {
          quenteClaro,
          quenteEscuro,
          neutroClaro,
          neutroEscuro
        } = rowBgVariants[esquemaAtual] || rowBgVariants["azul-vermelho-claro"];

        let nomeStyle = "";

        const radius = cornersRounded ? "6px" : "0px";

        // Definir cor de fundo consoante indexado e paridade da linha
        const isPar = index % 2 === 1;

        if (tarifa.isIndexado) {
          nomeStyle += `background-color: ${isPar ? quenteClaro : quenteEscuro};`;

          // Cor do texto especial para alguns nomes
          if (
            tarifa.nome === "Repsol indexado" || tarifa.nome === "Coopérnico" ||
            tarifa.nome === "Plenitude indexado" || tarifa.nome === "Coopérnico: Base 2.0" ||
            tarifa.nome === "Repsol: Tarifa Leve Sem Mais" || tarifa.nome === "Plenitude: Tarifa Tendência"
          ) {
            nomeStyle += "color: #005FA8;";
          } else {
            nomeStyle += "color: black;";
          }

        } else {
          nomeStyle += `background-color: ${isPar ? neutroClaro : neutroEscuro};`;
          nomeStyle += "color: black;";
        }


            if (tarifa.nome === "Meu tarifário") {
              nomeStyle = nomeStyles[esquemaAtual] || nomeStyles["azul-vermelho"]; // fallback caso necessário
            }
            nomeStyle += `border-radius:${radius};`;

    

            // Apenas para “EDP indexado” criamos a tooltipText e a classe
            let cellAttrs = ' class="internop"';
            if ((tarifa.nome === "EDP indexado" || tarifa.nome.startsWith("EDP: Eletricidade Indexada")) && incluirEDP && potenciaNum >=3.45) {
                const descontoMsg = "Valor apresentado inclui desconto mensal de 10€ válido nos primeiros 10 meses, para adesões até 30/5/2025";
                const tooltipText = descontoMsg;
                cellAttrs = ` class="internop has-tooltip mais-indicator" title="${tooltipText}"`;        
            }
            if ((tarifa.nome === "Galp Continente" || tarifa.nome.startsWith("Galp: Plano Galp")) && incluirContinente) {
                const descontoMsg = "Valor apresentado assume desconto de 10% na potência e energia em Cartão Continente";
                const tooltipText = descontoMsg;
                cellAttrs = ` class="internop has-tooltip mais-indicator" title="${tooltipText}"`;        
            }
            if (tarifa.nome.startsWith("Meo") && incluirMeo) {
                const descontoMsg = "Valor apresentado inclui desconto de 0.01€ na energia válido para clientes Meo";
                const tooltipText = descontoMsg;
                cellAttrs = ` class="internop has-tooltip mais-indicator" title="${tooltipText}"`;  
            }
            if ((tarifa.nome === "Goldenergy ACP" || tarifa.nome.startsWith("Goldenergy: Tarifário Parceria ACP")) && !incluirACP) {
                const descontoMsg = "Valor apresentado não inclui quota mensal ACP de 4.80€";
                const tooltipText = descontoMsg;
                cellAttrs = ` class="internop has-tooltip mais-indicator" title="${tooltipText}"`;  
            }
            

            

            // decide se sinalizamos este tarifário “Meo”

            // 1) Prepara o HTML do tooltip “matriz” só para a célula de Potência
            // 1) Monta o HTML da tabela com <thead>, <tbody> e <tfoot>

            // antes de montar o tooltip:
            const descontoRow = tsFlag === 1
                ? `<tr>
     <td>Desconto da tarifa social</td>
     <td style="padding-left:6px;">- ${(descontoPotTS).toFixed(4)}</td>
   </tr>`
                : ``;   
                
            // dentro do teu loop, logo antes de montar o potenciaTooltip:
            let feeRow = '';
            let dias =1;
            let luzigasFee1 = 0;
            if (tarifa.nome.startsWith("Luzigás Energy 8.8") && diasS!==0) {
                // decides quantos dias usar
                let diasLabel;
                if (DataS) {
                    dias *= 365 /12
                    diasLabel = `(365/12) dias`;
                } else {
                    dias *= diasS;
                    diasLabel = `${diasS} dia${diasS === 1 ? '' : 's'}`;
                }
                luzigasFee1 += parseFloat((luzigasFee0/dias).toFixed(4));
                feeRow = `
    <tr>
      <td>Fee ${(luzigasFee0)}  € / ${diasLabel}</td>
      <td style="padding-left:6px; text-align:right;">
        ${luzigasFee1.toFixed(4)}
      </td>
    </tr>
  `;
            }

            let valor = tarifa.potencia
                - tarPotSnum
                + tsFlag * descontoPotTS
                - luzigasFee1;

            let str = valor.toFixed(4);
            if (str === "-0.0000") {
                str = "0.0000";
            }



            const potenciaTooltip = `
<table class="tooltip-matrix">
  <thead>
    <tr>
      <th style="background-color: ${headerPrimary}; color: ${headerFtPrimary};"> Designação</th>
      <th style="background-color: ${headerPrimary}; color: ${headerFtPrimary};">Preço s/ IVA (€/dia)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Potência (comercializador) - ${potenciaSelecionada2}</td>
      <td>${str}</td>
    </tr>
    <tr>
      <td>Potência (acesso às redes) - ${potenciaSelecionada2}</td>
      <td>${tarPotSnum.toFixed(4)}</td>
    </tr>
    ${descontoRow}
    ${feeRow}
  </tbody>
  <tfoot>
    <tr>
      <td>Total</td>
      <td>${tarifa.potencia.toFixed(4)}</td>
    </tr>
  </tfoot>
</table>
`.trim().replace(/\n\s*/g, '');

            // 1) Constroi a string HTML do tooltip de Energia
            const energiaTooltip = `
<table class="tooltip-matrix">
  <thead>
    <tr>
      <th style="background-color: ${headerPrimary}; color: ${headerFtPrimary};">Designação</th>
      <th style="background-color: ${headerPrimary}; color: ${headerFtPrimary};">Preço s/ IVA (€/kWh)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Energia (comercializador)</td>
      <td style="text-align:right;">${(tarifa.simples-TARSimplesS+tsFlag*descontoKwhTS).toFixed(4)}</td>
    </tr>
    <tr>
      <td>Energia (acesso às redes)</td>
      <td style="text-align:right;">${(TARSimplesS).toFixed(4)}</td>
    </tr>
    ${ tsFlag === 1 
      ? `<tr>
           <td>Desconto da tarifa social</td>
           <td style="text-align:right;">- ${descontoKwhTS.toFixed(4)}</td>
         </tr>` 
      : `` }
  </tbody>
  <tfoot>
    <tr>
      <td>Total</td>
      <td style="text-align:right;">${tarifa.simples.toFixed(4)}</td>
    </tr>
  </tfoot>
</table>
`.trim().replace(/\n\s*/g, '');


const nomePotBase = `Potência contratada - ${potenciaSelecionada2}`;
const nomePotRedes = `Potência contratada - ${potenciaSelecionada2}`;
const nomePotDesconto = `Desconto da tarifa social - ${potenciaSelecionada2}`;

const temParcelaRedes = potenciaNum <= 3.45;
const temParcelaDesconto = tsFlag === 1 && descontoPotTS > 0;

// 1. Potência (comercializador)
const precoBase = tarifa.potencia - (temParcelaRedes ? tarPotSnum : 0) + tsFlag * descontoPotTS;
const valorPotBase = precoBase * diasS;

// 2. Potência (redes)
const valorPotRedes = tarPotSnum * diasS;

// 3. Desconto TS
const valorPotDesconto = -descontoPotTS * diasS;
const ivaDescontoTS = potenciaNum <= 3.45 ? 0.06 : 0.23;

// Construção das linhas
const linhasPotencia = [
  {
    nome: nomePotBase,
    quantidade: `${diasS} dia${diasS > 1 ? 's' : ''}`,
    preco: precoBase.toFixed(4),
    valor: valorPotBase.toFixed(2),
    ivaPct: "23"
  }
];

if (temParcelaRedes) {
  linhasPotencia.push({
    nome: nomePotRedes,
    quantidade: `${diasS} dia${diasS > 1 ? 's' : ''}`,
    preco: tarPotSnum.toFixed(4),
    valor: valorPotRedes.toFixed(2),
    ivaPct: "6"
  });
}

if (temParcelaDesconto) {
  linhasPotencia.push({
    nome: nomePotDesconto,
    quantidade: `${diasS} dia${diasS > 1 ? 's' : ''}`,
    preco: (-descontoPotTS).toFixed(4),
    valor: valorPotDesconto.toFixed(2),
    ivaPct: (ivaDescontoTS * 100).toFixed(0)
  });
}

const energia6kWh = potenciaNum <= 6.9
  ? Math.min(consumo, kWhIVAPromocionalS)
  : 0;

const energia23kWh = consumo - energia6kWh;

// Só há desconto se potência ≤ 6.9 e TS estiver ativa
const temDescontoTS = tsFlag === 1 && potenciaNum <= 6.9;

const desconto6kWh = temDescontoTS ? energia6kWh : 0;
const desconto23kWh = temDescontoTS ? energia23kWh : 0;

const precoEnergia = tarifa.simples;
const valorEnergia6 = energia6kWh * precoEnergia;
const valorEnergia23 = energia23kWh * precoEnergia;

const valorDesconto6 = -desconto6kWh * descontoKwhTS;
const valorDesconto23 = -desconto23kWh * descontoKwhTS;

const linhasEnergia = [];

if (energia23kWh > 0) {
  linhasEnergia.push({
    nome: "Consumo Simples",
    quantidade: `${energia23kWh} kWh`,
    preco: precoEnergia.toFixed(4),
    valor: valorEnergia23.toFixed(2),
    ivaPct: "23"
  });
}

if (energia6kWh > 0) {
  linhasEnergia.push({
    nome: "Consumo Simples",
    quantidade: `${energia6kWh} kWh`,
    preco: precoEnergia.toFixed(4),
    valor: valorEnergia6.toFixed(2),
    ivaPct: "6"
  });
}

if (desconto23kWh > 0) {
  linhasEnergia.push({
    nome: "Desconto da tarifa social",
    quantidade: `${desconto23kWh} kWh`,
    preco: `-${descontoKwhTS.toFixed(4)}`,
    valor: valorDesconto23.toFixed(2),
    ivaPct: "23"
  });
}

if (desconto6kWh > 0) {
  linhasEnergia.push({
    nome: "Desconto da tarifa social",
    quantidade: `${desconto6kWh} kWh`,
    preco: `-${descontoKwhTS.toFixed(4)}`,
    valor: valorDesconto6.toFixed(2),
    ivaPct: "6"
  });
}





// 1) Calcular como número
const custoPotenciaNum = tarifa.potencia * diasS * (1 + IVABaseSimples);
const custoEnergiaNum  = tarifa.simples   * consumo * (1 + IVABaseSimples);

// 2) Somar e só aí aplicar toFixed
const custoEletricidade = (custoPotenciaNum + custoEnergiaNum).toFixed(2);

// 3) Calcular taxas (exemplo genérico)
const custoTaxesNum = 
    AudiovisualS * (1 + IVA_AudiovisualSimples) +
    DGEGS       * (1 + IVA_DGEGSimples) +
    consumo     * (IESS * (1 + IVA_IESS));

// 4) Formatar o resultado final
const custoTaxes = custoTaxesNum.toFixed(2);

// Agora você pode usar `custoEletricidade` e `custoTaxes` (strings formatadas com 4 casas)
console.log(custoEletricidade, custoTaxes);

const totalFatura = (
    parseFloat(custoEletricidade) +
    parseFloat(custoTaxes)
  ).toFixed(2);
  

// dentro do loop de cada tarifa:
const custoPotencia   = (tarifa.potencia * diasS * (1 + IVABaseSimples)).toFixed(2);
const custoEnergia    = (tarifa.simples   * consumo  * (1 + IVABaseSimples)).toFixed(2);
const totalEletric    = (parseFloat(custoPotencia) + parseFloat(custoEnergia)).toFixed(2);

// imagina que tens também taxaS e valorS para cada imposto…


// 1) Define o array com as tuas taxas/impostos
const taxItems = [];

// Exemplo: Contribuição Audiovisual
taxItems.push({
  nome: 'Contribuição Audiovisual',
  quantidade: `1 mês`,
  preco: AudiovisualS.toFixed(2),      // ou a variável onde guardas o € por dia/mês
  valor: AudiovisualS.toFixed(2),      // valor total
  ivaPct: (IVA_AudiovisualSimples * 100).toFixed(0)
});

// Exemplo: Taxa DGEG
taxItems.push({
  nome: 'Taxa de Exploração DGEG',
  quantidade: `1 mês`,
  preco: DGEGS.toFixed(2),
  valor: DGEGS.toFixed(2),
  ivaPct: (IVA_DGEGSimples * 100).toFixed(0)
});

// E assim por diante para cada taxa/imposto...

// — calcula os totais que vais usar no título e no rodapé —
const totalEletricidade = (parseFloat(custoPotencia) + parseFloat(custoEnergia)).toFixed(2);
const totalTaxes        = taxItems
  .reduce((sum, t) => sum + parseFloat(t.valor), 0)
  .toFixed(2);

  // acrescenta isto:
const totalGeral = (parseFloat(totalEletricidade) + parseFloat(totalTaxes)).toFixed(2);

// — monta o tooltip —
const invoiceTooltip = `
<div class="tooltip-invoice">

  <details open>
    <summary>
      Eletricidade — ${totalEletricidade} €
    </summary>
    <table class="tooltip-matrix">
      <thead>
        <tr>
          <th>Descrição</th>
          <th>Qtd.</th>
          <th>Preço</th>
          <th>Valor</th>
          <th>IVA</th>
        </tr>
      </thead>
      <tbody>
        ${linhasPotencia.map(p => `
        <tr>
        <td>${p.nome}</td>
        <td>${p.quantidade}</td>
        <td>${p.preco}</td>
        <td>${p.valor}</td>
        <td>${p.ivaPct}%</td>
      </tr>
      `).join('')}
      </tbody>
      <tbody>
  ${linhasEnergia.map(e => `
    <tr>
      <td>${e.nome}</td>
      <td>${e.quantidade}</td>
      <td>${e.preco}</td>
      <td>${e.valor}</td>
      <td>${e.ivaPct}%</td>
    </tr>
  `).join('')}
</tbody>
      <tfoot>
        <tr>
          <td colspan="3"><strong>Total Eletricidade</strong></td>
          <td colspan="2"><strong>${totalEletricidade} €</strong></td>
        </tr>
      </tfoot>
    </table>
  </details>

  <details>
    <summary>
      Taxas &amp; Impostos — ${totalTaxes} €
    </summary>
    <table class="tooltip-matrix">
      <thead>
        <tr>
          <th>Descrição</th>
          <th>Qtd.</th>
          <th>Preço</th>
          <th>Valor</th>
          <th>IVA</th>
        </tr>
      </thead>
      <tbody>
        ${taxItems.map(t => `
          <tr>
            <td>${t.nome}</td>
            <td>${t.quantidade}</td>
            <td>${t.preco}</td>
            <td>${t.valor}</td>
            <td>${t.ivaPct}%</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3"><strong>Total Taxas &amp; Impostos</strong></td>
          <td colspan="2"><strong>${totalTaxes} €</strong></td>
        </tr>
      </tfoot>
    </table>
  </details>

  <div class="tooltip-grand-total">
    <strong>Total geral: ${totalGeral} €</strong>
  </div>

</div>
`.trim();






// dentro do teu loop, em vez de montar só a tabela plana, faz:
const eletricidadeChildren = `
  <table class="tooltip-matrix">
    <tbody>
      <tr>
        <td>Potência – ${diasS} dia${diasS>1?'s':''}</td>
        <td style="text-align:right">${custoPotenciaNum.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Energia – ${consumo} kWh</td>
        <td style="text-align:right">${custoEnergiaNum.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>`.trim().replace(/\n\s*/g,'');

const taxesChildren = `
  <table class="tooltip-matrix">
    <tbody>
      <tr><td>Contribuição Audiovisual</td><td style="text-align:right">${AudiovisualS.toFixed(2)}</td></tr>
      <tr><td>DGEG</td><td style="text-align:right">${DGEGS.toFixed(2)}</td></tr>
      <tr><td>IES</td><td style="text-align:right">${(IESS*consumo).toFixed(2)}</td></tr>
      <tr><td>IVA</td><td style="text-align:right">${((custoPotenciaNum + custoEnergiaNum) * IVABaseSimples).toFixed(2)}</td></tr>
    </tbody>
  </table>`.trim().replace(/\n\s*/g,'');

// monta o HTML
const hierarchicalTooltip = `
  <div class="tooltip-hierarchical">
    <details open>
      <summary>
        <span class="label">Eletricidade</span>
        <span class="value">${custoEletricidade} €</span>
      </summary>
      ${eletricidadeChildren}
    </details>
    <details>
      <summary>
        <span class="label">Taxas & Impostos</span>
        <span class="value">${custoTaxes} €</span>
      </summary>
      ${taxesChildren}
    </details>
    <div class="tooltip-total">
      <span class="label">Total fatura:</span>
      <span class="value">${totalFatura} €</span>
    </div>
  </div>
`.trim().replace(/\n\s*/g,'');



           
            // 2) Agora injeta no <td> da Potência:
            tabelaResultados += `<tr>
<td ${cellAttrs} style='${nomeStyle}'>${tarifa.nome}</td>

<td
  class="has-tooltip internop"
  data-tippy-content='${potenciaTooltip}'
  style='${isMinPotencia} background-color:${corPotencia}; color:black; border-radius: ${radius};'
>
  ${tarifa.potencia.toFixed(4)}
</td>

<td
    class="has-tooltip internop"
    data-tippy-content='${energiaTooltip}' 
    style='${isMinSimples} background-color:${corSimples}; color:black; border-radius: ${radius};'>
  ${tarifa.simples.toFixed(4)}
</td>

<td class="internop"
    style='${isMinCusto} background-color:${corCusto}; color:black; border-radius: ${radius};'>
  ${tarifa.custo.toFixed(2)}
</td>
</tr>`;
});
    
        tabelaResultados += "</table>";


        document.getElementById("resultado").innerHTML = tabelaResultados;
        // Agora que a tabela foi desenhada, o botão já existe — associar o evento!
        document.getElementById("btnEsquema")?.addEventListener("click", () => {
          // 1) avança esquema
          indiceEsquema = (indiceEsquema + 1) % esquemas.length;
          esquemaAtual = esquemas[indiceEsquema];

          // 2) atualiza o ícone
          const icone = document.getElementById("iconeRaio");
          if (icone) {
            icone.style.color = coresIcone[esquemaAtual];
            icone.classList.add("pulsar");
            setTimeout(() => icone.classList.remove("pulsar"), 600);
          }

          


            // inverte o esquema
            // esquemaAtual = (esquemaAtual === "azul-vermelho")
            //    ? "azul-creme-vermelho"
            //    : "azul-vermelho";

            // atualiza o ícone
            // const icone = document.getElementById("iconeRaio");
            // if (icone) {
            //    icone.style.color = esquemaAtual === "azul-vermelho" ? "#FFFFFF" : "#FFF6E5";
            //    icone.classList.add("pulsar");
            //    setTimeout(() => icone.classList.remove("pulsar"), 600);
            //}

            // **NOVO**: troca também as cores do select de potência e do input de consumo
            

            // 3) atualiza select de potência
          const pot = document.getElementById("potenciac");
          if (pot) {
            const { bg, color } = potStyles[esquemaAtual];
            pot.style.backgroundColor = bg;
            pot.style.color = color;
          }

          // 4) atualiza input de consumo
          const con = document.getElementById("consumo");
          if (con) {
            const { bg, color } = conStyles[esquemaAtual];
            con.style.backgroundColor = bg;
            con.style.color = color;
          }
            //if (esquemaAtual === "azul-creme-vermelho") {
            //    pot.style.backgroundColor = "#007A1E";  // azul escuro
            //    pot.style.color = "#FFFFFF";
            //    con.style.backgroundColor = "#F0B000";  // creme
            //    con.style.color = "#000000";
            //} else {
            //    pot.style.backgroundColor = "#375623";  // verde original
            //    pot.style.color = "#FFFFFF";
            //    con.style.backgroundColor = "#FFC000";  // amarelo original
            //    con.style.color = "#000000";
            //}

            // finalmente, redesenha tudo com o novo esquema de heat-map
            
            atualizarResultados();
            
        });
        
        // —— AQUI ——
        document.getElementById("btnToggleCorners")?.addEventListener("click", () => {
          // 1) alterna variável de estado
          cornersRounded = !cornersRounded;
          
          // 2) troca o conteúdo do span entre ■ e ●
          document.getElementById("shapeToggle").textContent =
            cornersRounded ? "\u25A1" : "\u25CB";
        
          // 3) adiciona/remove a classe que zera o border-radius (se estiver usando CSS)
          document.body.classList.toggle("no-rounded", !cornersRounded);


          // começo: aplica border-radius geral
    

          // 5) (opcional) redesenha resultados se realmente precisar
          // atualizarResultados();
        });


        

    };
}

// --------------------------------------------------
// 1) Funções utilitárias (suas definições anteriores seguem intactas: parseEuro, parsePercent, 
// converterReferencia, obterTabela, obterVariavel, carregarDadosCSV, preencherSelecaoMeses, atualizarResultados, calcularPreco, alternarAba, atualizarEstadoDatas)


// --------------------------------------------------
// 2) Aplica o esquema de cores ao select de potência e input de consumo
function aplicarEsquema(esquema) {
  const pot = document.getElementById("potenciac");
  const con = document.getElementById("consumo");
  if (!pot || !con) return;

  // adicione aqui o terceiro tema
  const temas = {
      "azul-vermelho-claro": {
          potBg: "#375623",  // ou outra cor que você prefira
          potFg: "#FFFFFF",
          conBg: "#FFC000",  // amarelo suave
          conFg: "#000000"
      },
      "azul-vermelho": {
          potBg: "#375623",
          potFg: "#FFFFFF",
          conBg: "#FFC000",
          conFg: "#000000"
      },
      "azul-creme-vermelho": {
          potBg: "#007A1E",
          potFg: "#FFFFFF",
          conBg: "#FFF6E5",
          conFg: "#000000"
      }
  }[esquema] || {
      // fallback genérico, caso esquema venha inválido
      potBg: "#375623", potFg: "#FFFFFF",
      conBg: "#FFC000", conFg: "#000000"
  };

  pot.style.backgroundColor = temas.potBg;
  pot.style.color           = temas.potFg;
  con.style.backgroundColor = temas.conBg;
  con.style.color           = temas.conFg;
}



// --------------------------------------------------
// 3) Cria listener de toggle entre painéis
function criarToggle(botao, painelMostrar, paineisOcultar = []) {
    botao.addEventListener("click", () => {
        const abrir = painelMostrar.classList.contains("hidden");
        // oculta todos
        paineisOcultar.concat(painelMostrar).forEach(p =>
            p.classList.toggle("hidden", !abrir || p !== painelMostrar)
        );
        atualizarResultados();
    });
}


// --------------------------------------------------
// 4) Reset dos descontos sociais
function resetDescontosSociais() {
    document.querySelector('input[name="tsType"][value="none"]').checked = true;
    document.getElementById("familiasNumerosas").checked = false;
}


// --------------------------------------------------
// 5) Agrupar listeners “simples” de atualização
[
    { id: "mesSelecionado",    evt: "change" },
    { id: "dias",             evt: "input" },
    { id: "consumo",          evt: "input" },
    { id: "potenciac",        evt: "change" },
    { id: "fixo",             evt: "input" },
    { id: "variavel",         evt: "input" },
    { id: "omieInput",        evt: "input" },
    { id: "mostrarNomes",     evt: "change" },
    { id: "incluirACP",       evt: "change" },
    { id: "incluirContinente",evt: "change" },
    { id: "incluirMeo",       evt: "change" },
    { id: "restringir",       evt: "change" },
    { id: "incluirEDP",       evt: "change" },
].forEach(({id, evt}) => {
    document.getElementById(id)?.addEventListener(evt, atualizarResultados);
});
document.querySelectorAll('input[name="tsType"]').forEach(r =>
    r.addEventListener("change", atualizarResultados)
);
document.getElementById("familiasNumerosas")
    ?.addEventListener("change", atualizarResultados);


function alternarAba(abaSelecionada) {
    const abas = ["MeuTarifario", "OutrasOpcoes"];

    abas.forEach(aba => {
        document.getElementById("aba" + aba).classList.toggle("ativa", aba === abaSelecionada);
        document.getElementById("conteudo" + aba).classList.toggle("ativa", aba === abaSelecionada);
    });
}

function revealPostTableContent() {
    const wrapper = document.getElementById('postTableContent');
    // 1) mostra o container todo de uma vez
    wrapper.style.visibility = 'visible';
  
    // 2) garante que o iframe só carrega quando vamos revelar
    const iframe = document.getElementById('grafico');
    if (!iframe.src) iframe.src = iframe.dataset.src;
  
    // 3) adiciona a classe 'visible' a todos os .reveal simultaneamente
    wrapper.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('visible');
    });
  }

// --------------------------------------------------
// 6) Toda inicialização em um só lugar
document.addEventListener("DOMContentLoaded", async () => {
    // referências principais
    const btnDias         = document.getElementById("btnDias");
    const div3            = document.querySelector(".div3");
    const div4            = document.querySelector(".div4");
    const div5            = document.querySelector(".div5");
    const div6            = document.querySelector(".div6");
    const btnShowOmie     = document.getElementById("btnShowOmie");
    const btnShowCalendar = document.getElementById("btnShowCalendar");
    const btnShowTs       = document.getElementById("btnShowTs");
    const btnClearOmie    = document.getElementById("btnClearOmie");
    const btnClearDates   = document.getElementById("btnClearDates");
    const btnClearTs      = document.getElementById("btnClearTs");
    const btnClearAll     = document.getElementById("btnClearForms");
    const btnDef          = document.getElementById("btnDefinicoes");
    const secaoDef        = document.getElementById(btnDef.dataset.target);
    const arrowUseDef        = btnDef.querySelector("use");
    const arrowUseDias    = btnDias.querySelector("use");
    const startDate       = document.getElementById("startDate");
    const endDate         = document.getElementById("endDate");
    const mesSelecionado  = document.getElementById("mesSelecionado");
    const diasInput       = document.getElementById("dias");


    // Controle de "DataS": desativa mês+dias se houver intervalo válido
    function atualizarEstadoDatas() {
        const inicioValido = startDate.value !== "";
        const fimValido    = endDate.value   !== "";
        DataS = inicioValido && fimValido && (startDate.value <= endDate.value);
    
        mesSelecionado.disabled = DataS;
        diasInput.disabled      = DataS;
      }

    // estado para o botão Dias
    let estadoOmieAberto = false,
        estadoCalendarioAberto = false,
        estadoTsAberto = false;

    // 1) Carregar CSV, aplicar esquema e popular meses
    console.log("🔄 Iniciando carregamento do CSV...");
    dadosCSV_basico = await carregarCSV(urlCSV_basico);
    console.log("✅ CSV básico carregado");
    aplicarEsquema(esquemaAtual);
    preencherSelecaoMeses();
    document.getElementById("incluirACP").checked = false;
    document.getElementById("incluirEDP").checked = true;
    document.getElementById("incluirMeo").checked = true;
    document.getElementById("incluirContinente").checked = true;
    document.body.classList.toggle("no-rounded", !cornersRounded);


    atualizarResultados();
    revealPostTableContent();

    // 2) Listeners de Clear individuais
    btnClearAll.addEventListener("click", () => {
        document.getElementById("omieInput").value = "";
        startDate.value = endDate.value = "";
        // 2) Restaura os limites originais
        startDate.min = "2025-01-01";
        startDate.max = "2025-12-31";
        endDate.min = "2025-01-01";
        endDate.max = "2025-12-31";
        resetDescontosSociais();
        atualizarEstadoDatas();
        atualizarResultados();
    });
    btnClearOmie.addEventListener("click", () => {
        document.getElementById("omieInput").value = "";
        atualizarResultados();
    });
    btnClearDates.addEventListener("click", () => {
        startDate.value = endDate.value = "";
        // 2) Restaura os limites originais
        startDate.min = "2025-01-01";
        startDate.max = "2025-12-31";
        endDate.min = "2025-01-01";
        endDate.max = "2025-12-31";
        atualizarEstadoDatas();
        atualizarResultados();
    });
    btnClearTs.addEventListener("click", () => {
        resetDescontosSociais();
        atualizarResultados();
    });

    // 3) Toggle OMIE + clear
    btnShowOmie.addEventListener("click", () => {
        div4.classList.toggle("hidden");
        // esconde Datas e TS e limpa as Datas sempre que OMIE aparece
        if (!div4.classList.contains("hidden")) {
            div5.classList.add("hidden");
            startDate.value = "";
            endDate.value = "";
            btnClearDates.classList.add("hidden");
            div6.classList.add("hidden");
            btnClearTs.classList.add("hidden");
        }
        // mostra/esconde o botão “limpar OMIE”
        btnClearOmie.classList.toggle("hidden", div4.classList.contains("hidden"));
        atualizarResultados();
    });
    // 4) Toggle Datas + clear
    btnShowCalendar.addEventListener("click", () => {
        div5.classList.toggle("hidden");
        // esconde OMIE e TS e limpa OMIE sempre que Datas aparecem
        if (!div5.classList.contains("hidden")) {
            div4.classList.add("hidden");
            document.getElementById("omieInput").value = "";
            btnClearOmie.classList.add("hidden");
            div6.classList.add("hidden");
            btnClearTs.classList.add("hidden");
        }
        btnClearDates.classList.toggle("hidden", div5.classList.contains("hidden"));
        atualizarResultados();
    });
    // 5) Toggle TS + clear
    btnShowTs.addEventListener("click", () => {
        div6.classList.toggle("hidden");
        if (!div6.classList.contains("hidden")) {
            div4.classList.add("hidden");
            btnClearOmie.classList.add("hidden");
            div5.classList.add("hidden");
            btnClearDates.classList.add("hidden");
        }
        btnClearTs.classList.toggle("hidden", div6.classList.contains("hidden"));
        atualizarResultados();
    });

    // 6) Botão Definições
    // espera que o DOM esteja pronto
  
    console.log("btnDef:", btnDef);
  console.log("secaoDef:", secaoDef);
  
  

    // 7) Dates → DataS + resultados
    // Função de callback comum para startDate
    function onStartDateChange() {
        // ajustar min do endDate
        endDate.min = startDate.value || "2025-01-01";
        atualizarEstadoDatas();
        atualizarResultados();
    }

    // Função de callback comum para endDate
    function onEndDateChange() {
        // ajustar max do startDate
        startDate.max = endDate.value || "2025-12-31";
        atualizarEstadoDatas();
        atualizarResultados();
    }

    // Atachar em input e change para robustez
    startDate.addEventListener("input", onStartDateChange);
    startDate.addEventListener("change", onStartDateChange);

    endDate.addEventListener("input", onEndDateChange);
    endDate.addEventListener("change", onEndDateChange);


    btnDef.addEventListener("click", () => {
        // 1) alterna visibilidade da secção
        const isHidden = getComputedStyle(secaoDef).display === "none";
        secaoDef.style.display = isHidden ? "block" : "none";

        
        // 3) escolhe o símbolo certo
        const newId = isHidden ? "chevron-up-logo" : "chevron-down-logo";
    
        // 4) atualiza o href (ou xlink:href, conforme o teu SVG)
        arrowUseDef.setAttribute("href", `icons.svg#${newId}`);
        // se o teu <use> usa xlink:href em vez de href, usa esta linha em vez da anterior:
        // arrowUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `icons.svg#${newId}`);
      });


    // 8) Botão Dias (chevron/menu)
    btnDias.addEventListener("click", () => {
        // 1) Toggle do painel .div3
        const aberto = !div3.classList.contains("hidden");
        div3.classList.toggle("hidden", aberto);
      
        // 2) Altera o símbolo (chevron-down ↔ chevron-up)
        //    se 'aberto' era true, vamos fechar => down; se false, vamos abrir => up
        const novoIcon = aberto ? "chevron-down-logo" : "chevron-up-logo";
        arrowUseDias.setAttribute("href", `icons.svg#${novoIcon}`);
    
        if (aberto) {
            estadoOmieAberto       = !div4.classList.contains("hidden");
            estadoCalendarioAberto = !div5.classList.contains("hidden");
            estadoTsAberto         = !div6.classList.contains("hidden");
    
            div4.classList.add("hidden");
            div5.classList.add("hidden");
            div6.classList.add("hidden");
    
            // 🟨 Esconder também os botões “Clear”
            btnClearOmie.classList.add("hidden");
            btnClearDates.classList.add("hidden");
            btnClearTs.classList.add("hidden");
    
        } else {
            div4.classList.toggle("hidden", !estadoOmieAberto);
            div5.classList.toggle("hidden", !estadoCalendarioAberto);
            div6.classList.toggle("hidden", !estadoTsAberto);
    
            // 🟩 Mostrar os “Clear” se o painel estiver visível
            btnClearOmie.classList.toggle("hidden", !estadoOmieAberto);
            btnClearDates.classList.toggle("hidden", !estadoCalendarioAberto);
            btnClearTs.classList.toggle("hidden", !estadoTsAberto);
        }
    });

    // Botão limpar meu tarifário
    document.getElementById("btnLimpar")?.addEventListener("click", () => {
        document.getElementById("fixo").value = "";
        document.getElementById("variavel").value = "";
        atualizarResultados();
    });
    

    // 9) Alternar abas “Meu tarifário” / “Outras opções”
    document.getElementById("abaMeuTarifario")
        .addEventListener("click", () => alternarAba("MeuTarifario"));
    document.getElementById("abaOutrasOpcoes")
        .addEventListener("click", () => alternarAba("OutrasOpcoes"));
    
    setTimeout(async () => {
        dadosCSV_grande = await carregarCSV(urlCSV_grande);
        adiarGrandes = false;
        console.log("✅ CSV grande carregado em background");
    }, 1000); // Aguarda 1 segundo para não interferir com o carregamento inicial

    tippy.delegate(document.body, {
        theme: 'light-border',    // usa um tema mais clean
        distance: 4,              // distancia menor entre tooltip e célula
        target: '.has-tooltip',
        allowHTML: true,
        interactive: true,
        trigger: 'click',
        content(reference) {
            return reference.getAttribute('title');
        },
        hideOnClick: true,     // fecha ao clicar de novo ou noutro lugar
        placement: 'top',
        arrow: true,
        // opcional: ancorar o quarto-círculo ao visível/invisível
        onShow(instance) {
            // fecha qualquer outro ativo
            document.querySelectorAll('.has-tooltip-active')
                .forEach(el => el !== instance.reference && el.classList.remove('has-tooltip-active'));
            instance.reference.classList.add('has-tooltip-active');
        },
        onHidden(instance) {
            instance.reference.classList.remove('has-tooltip-active');
        }
      });
});
