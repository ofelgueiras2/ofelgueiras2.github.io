const urlCSV = "https://raw.githubusercontent.com/ofelgueiras2/ofelgueiras2.github.io/refs/heads/main/gs/SimuladorEletricidade_OF_MN_2025_3.csv";
let dadosCSV = [];

const tabelas = {
    Meses: { inicio: "AB6", fim: "AB24" },
    Perdas: { inicio: "AC6", fim: "AC24" },
    OMIE: { inicio: "AD6", fim: "AD24" },
    descSocial: { inicio: "AQ12", fim: "AQ15" },
    Indexados: { inicio: "AS3", fim: "AS9" },
    diasMeses: { inicio: "AT14", fim: "AT32" },
    indexBase: { inicio: "AT3", fim: "AT9" },
    strDias: { inicio: "AU14", fim: "AU32" },
    Ciclos: { inicio: "AV5", fim: "BC1" },
    TData: { inicio: "AV2", fim: "AV35041" },
    TBTN_A: { inicio: "AZ2", fim: "AZ35041" },
    TBTN_B: { inicio: "BA2", fim: "BA35041" },
    TBTN_C: { inicio: "BB2", fim: "BB35041" },
    TPreco: { inicio: "BC2", fim: "BC35041" },
    TBD: { inicio: "AW2", fim: "AW35041" },
    TBS: { inicio: "AW2", fim: "BC35041" },
    TPT: { inicio: "AY2", fim: "AY35041" },
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
    detalheTarifarios: { inicio: "AM5", fim: "AM25"},
    tarifariosExtra: { inicio: "C68", fim: "C80"},
    detalheTarifariosExtra: { inicio: "B68", fim: "B80"},
    preçosSimplesExtra: { inicio: "D68", fim: "W80"},
};

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

let esquemaAtual = "azul-vermelho"; // pode ser "azul-vermelho" ou "azul-creme-vermelho"

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

// 🔹 Função para obter uma tabela pelo nome
function obterTabela(nome) {
    if (!dadosCSV.length || !tabelas[nome]) return "❌ Tabela não encontrada!";
    
    const { inicio, fim } = tabelas[nome];
    const { col: colIni, row: rowIni } = converterReferencia(inicio);
    const { col: colFim, row: rowFim } = converterReferencia(fim);
    
    let tabelaExtraida = [];
    for (let i = rowIni; i <= rowFim; i++) {
        if (dadosCSV[i]) {
            tabelaExtraida.push(dadosCSV[i].slice(colIni, colFim + 1));
        }
    }
    
    console.log(`🔎 Conteúdo de ${nome}:`, tabelaExtraida);
    return tabelaExtraida.length > 0 ? tabelaExtraida : "❌ Tabela vazia!";
}

// Função para obter variável pelo nome e mostrar a linha e coluna usadas
function obterVariavel(nome) {
    if (!dadosCSV.length || !variaveis[nome]) {
        console.error(`❌ Variável "${nome}" não encontrada.`);
        return "Variável não encontrada";
    }

    const { col, row } = converterReferencia(variaveis[nome]);

    console.log(`🔍 Variável "${nome}" está na linha ${row}, coluna ${col}`);
    const valor = dadosCSV[row]?.[col] || "Indefinido";
    
    console.log(`🔎 Teste variável ${nome}:`, valor);
    return valor;
}

// 🔹 Função para carregar os dados do CSV
async function carregarDadosCSV() {
    console.log("📥 Carregando dados do CSV...");
    try {
        const resposta = await fetch(urlCSV);
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }

        const texto = await resposta.text();

        dadosCSV = texto.split("\n").map(linha =>
            linha.split(";").map(valor => {
                valor = valor.trim();
                if (valor.match(/^-?\d+,\d+$/)) {
                    return parseFloat(valor.replace(",", "."));
                } else if (valor.match(/^-?\d+$/)) {
                    return parseInt(valor, 10);
                } else {
                    return valor;
                }
            })
        );

        console.log("✅ Dados do CSV carregados com sucesso!");
        console.log("📌 Tamanho do CSV:", dadosCSV.length, "linhas x", (dadosCSV[0]?.length || 0), "colunas");
        console.log("📌 Primeiras 5 linhas do CSV:", dadosCSV.slice(0, 5));

        console.log("🔎 Teste tabela preçosSimples:", obterTabela("preçosSimples"));
        console.log("🔎 Teste variável aano:", obterVariavel("aano"));

    } catch (erro) {
        console.error("❌ Erro ao carregar CSV:", erro);
    }
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
    luzigasFeeS = parseFloat(
        (
          luzigasFeeS
          * multiplicador
          * (1 + IVABaseSimples)
        ).toFixed(2)
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


        if (i + 5 >= 19 && i + 5 <= 25) { // Como a tabela começa em C5
            isIndexado = true;
        }
        
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
                    simples = parseFloat((media + TARSimplesS).toFixed(4)) + FTSS;
                } else {
                    // fallback para simples padrão
                    const base = (OMIESSelecionadoS + luzboaCGSS)
                               * (1 + PerdasSelecionadoS)
                               * luzboaFAS
                               + luzboaKS
                               + TARSimplesS;
                    simples = parseFloat(base.toFixed(4)) + FTSS;
                }
        
            } else {
                // DataS === false: apenas o cálculo simples
                const base = (OMIESSelecionadoS + luzboaCGSS)
                           * (1 + PerdasSelecionadoS)
                           * luzboaFAS
                           + luzboaKS
                           + TARSimplesS;
                simples = parseFloat(base.toFixed(4)) + FTSS;
            }   
        } else if (nome === "Ibelectra indexado") {
            simples = parseFloat(((OMIESSelecionadoS + ibelectraCSS) * (1 + perdas2024S) + ibelectraKS + TARSimplesS).toFixed(5)) + FTSS;
        } else if (nome.startsWith("Luzigás Energy 8.8")) {
            simples = parseFloat(((OMIESSelecionadoS + luzigasCSS) * (1 + PerdasSelecionadoS) + luzigasKS + TARSimplesS).toFixed(4)) + FTSS;
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
                // 3) arredonda a 6 casas e adiciona TARSimplesS e FTSS
                simples = parseFloat((media + TARSimplesS).toFixed(6)) + FTSS;
              } else {
                // fallback idêntico ao “simples” quando não há dados no intervalo
                const base = 
                  OMIESSelecionadoS * (1 + PerdasSelecionadoS) * repsolFAS
                  + repsolQTarifaS
                  + TARSimplesS;
                simples = parseFloat(base.toFixed(6)) + FTSS;
              }
          
            } else {
              // DataS === false → sempre o cálculo simples
              const base =
                OMIESSelecionadoS * (1 + PerdasSelecionadoS) * repsolFAS
                + repsolQTarifaS
                + TARSimplesS;
              simples = parseFloat(base.toFixed(6)) + FTSS;
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
                // 3) arredonda a 6 casas, soma TARSimplesS antes do .toFixed e FTSS depois
                simples = parseFloat((media + TARSimplesS).toFixed(6)) + FTSS;
              } else {
                // fallback “simples” quando não houver dados no intervalo
                simples = parseFloat(
                  (
                    (OMIESSelecionadoS + coopernicoCGSS + coopernicoKS)
                    * (1 + PerdasSelecionadoS)
                    + TARSimplesS
                  ).toFixed(6)
                ) + FTSS;
              }
          
            } else {
              // DataS = false → sempre o cálculo simples de fallback
              simples = parseFloat(
                (
                  (OMIESSelecionadoS + coopernicoCGSS + coopernicoKS)
                  * (1 + PerdasSelecionadoS)
                  + TARSimplesS
                ).toFixed(6)
              ) + FTSS;
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
            custo += luzigasFeeS;
        }
    
        if (nome.startsWith("Goldenergy ACP")) {
            custo += precoACPS;
        }

        if (nome.startsWith("Goldenergy")) {
            custo += consumo * FTSS * (1 + IVABaseSimples);
        }

        if (nome === "Repsol"  || nome === "G9") {
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

            if (nome.startsWith("G9 Net Promo 7x7")) {
                        custo += (Math.max(consumo - kWhIVAPromocionalS, 0) * (1 + IVABaseSimples) +
                        Math.min(consumo, kWhIVAPromocionalS) * (1 + IVAFixoS)) * FTSS;
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

        // dentro de calcularPreco(), antes de montar tabelaResultados:
        const iconColor = esquemaAtual === "azul-vermelho"
        ? "#FFFFFF"
        : "#FFF6E5";

        // LOGO NO INÍCIO DE calcularPreco, antes de montar tabelaResultados:
        const headerPrimary = esquemaAtual === "azul-creme-vermelho" ? "#003D77" : "#00B050";
        // — o “verde de cima” passa a azul escuro ou fica o verde original

        const headerSecondary = esquemaAtual === "azul-creme-vermelho" ? "#007A1E" : "#375623";
        // — a linha que era escura (o fundo do botão + Consumo) passa a este tom de azul ou ao original

        const consumoBg = esquemaAtual === "azul-creme-vermelho" ? "#F0B000" : "#FFC000";
        // — o laranja original (FFC000) passa a amarelo suave (FFFF66)

    
        // Funções auxiliares
        function calcularCor(valor, min, max) {
            if (min === max) {
                return "rgb(255, 255, 255)"; // evita divisões por zero
            }
        
            let t = (valor - min) / (max - min); // normalizar para [0,1]
        
            let corMin, corMed, corMax;
        
            if (esquemaAtual === "azul-creme-vermelho") {
                corMin = [90, 138, 198];     // Azul médio
                corMed = [255, 246, 229];    // Creme
                corMax = [248, 106, 108];    // Coral suave
            } else {
                corMin = [90, 138, 198];     // Azul médio
                corMed = [252, 252, 255];    // Branco azulado
                corMax = [248, 105, 107];    // Coral avermelhado
            }
        
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
        
        

    
        
        let tabelaResultados = `<table>
        <tr> 
          <th colspan="3" rowspan="2" 
               style="background-color:${headerSecondary}; color:white; text-align:center; vertical-align:middle; position:relative;
          font-weight: normal;line-height:1;">
            <button id="btnEsquema" style="position:absolute;top:5px;left:5px;
            width: 30px;      /* nova largura */
            height: 30px;     /* altura igual */
            padding: 0;       /* sem espaço interior */
            text-align:center;background:none;border:none;cursor:pointer;">
            <i id="iconeRaio"
            class="fa-solid fa-bolt" title="Alterar cores"
            style="color:${iconColor}; font-size:20px; transition: color .3s;">
            </i>

            </button>

            <div style="font-weight: bold;margin-top: 15px;margin-bottom: 10px;">Potência contratada ${potenciaSelecionada2}</div>
            <br>
            <div style="font-size: 14px;margin-bottom: -10px;">${strDiasSimples} dia${(typeof diasS === 'number' && diasS !== 1 ? 's' : '')}</div>
            <br>
            <div style="font-size: 14px;">OMIE = ${OMIESSelecionadoS} €/kWh</div>            
            <span class="sort-container">
              <span class="sort-arrow ${sortField==='default' && sortDirection==='asc' ? 'selected' : ''}" onclick="setSort('default','asc')">&#9650;</span>
              <span class="sort-arrow ${sortField==='default' && sortDirection==='desc' ? 'selected' : ''}" onclick="setSort('default','desc')">&#9660;</span>
            </span>
          </th>
          <th style="background-color:${headerSecondary}; color:white; text-align:center;">
            Consumo (kWh)
          </th>
        </tr>

        <tr>
          <td style="background-color:${consumoBg}; font-weight:bold; color:black; text-align:center;">
            ${consumo || 0}
          </td>
        </tr>
        <tr>
          <th style="background-color:${headerPrimary}; font-weight:bold; color:white; text-align:center; position:relative;">
            Tarifário
            <span class="sort-container">
              <span class="sort-arrow ${sortField==='tariff' && sortDirection==='asc' ? 'selected' : ''}" onclick="setSort('tariff','asc')">&#9650;</span>
              <span class="sort-arrow ${sortField==='tariff' && sortDirection==='desc' ? 'selected' : ''}" onclick="setSort('tariff','desc')">&#9660;</span>
            </span>
          </th>
          <th style="background-color:${headerPrimary}; font-weight:bold; color:white; text-align:center; position:relative;">
            Potência (€/dia)
            <span class="sort-container">
              <span class="sort-arrow ${sortField==='power' && sortDirection==='asc' ? 'selected' : ''}" onclick="setSort('power','asc')">&#9650;</span>
              <span class="sort-arrow ${sortField==='power' && sortDirection==='desc' ? 'selected' : ''}" onclick="setSort('power','desc')">&#9660;</span>
            </span>
          </th>
          <th style="background-color:${headerPrimary}; font-weight:bold; color:white; text-align:center; position:relative;">
            Energia (€/kWh)
            <span class="sort-container">
              <span class="sort-arrow ${sortField==='simple' && sortDirection==='asc' ? 'selected' : ''}" onclick="setSort('simple','asc')">&#9650;</span>
              <span class="sort-arrow ${sortField==='simple' && sortDirection==='desc' ? 'selected' : ''}" onclick="setSort('simple','desc')">&#9660;</span>
            </span>
          </th>
          <th style="background-color:${headerPrimary}; font-weight:bold; color:white; text-align:center; position:relative;">
            Preço (€)
            <span class="sort-container">
              <span class="sort-arrow ${sortField==='price' && sortDirection==='asc' ? 'selected' : ''}" onclick="setSort('price','asc')">&#9650;</span>
              <span class="sort-arrow ${sortField==='price' && sortDirection==='desc' ? 'selected' : ''}" onclick="setSort('price','desc')">&#9660;</span>
            </span>
          </th>
        </tr>`;
      



    
        tarifarios.forEach(tarifa => {
            const corPotencia = calcularCor(tarifa.potencia, minPotencia, maxPotencia);
            const corSimples = calcularCor(tarifa.simples, minSimples, maxSimples);
            const corCusto = calcularCor(tarifa.custo, minCusto, maxCusto);
    
            const isMinPotencia = tarifa.potencia === minPotencia ? "font-weight:bold;" : "";
            const isMinSimples = tarifa.simples === minSimples ? "font-weight:bold;" : "";
            const isMinCusto = tarifa.custo === minCusto ? "font-weight:bold;" : "";
            
            // MODIFICAÇÃO 2: Se for "Meu tarifário" ou tarifário indexado, aplicar fundo amarelo
            let nomeStyle = "";
            if (tarifa.nome === "Meu tarifário") {
                if (esquemaAtual === "azul-vermelho") {
                  // o teu amarelo original
                  nomeStyle = "background-color:#FFC000; font-weight:bold; color:black;";
                } else {
                  // quando estiver no esquema creme, usa um creme suave
                  nomeStyle = "background-color:#F0B000; font-weight:bold; color:black;";
                }
            }
              
            if (tarifa.isIndexado) {
                nomeStyle = "background-color:#FFF2CC;";
                if (tarifa.nome === "Repsol indexado" || tarifa.nome === "Coopérnico" || tarifa.nome === "Plenitude indexado" ||
                    tarifa.nome === "Coopérnico: Base 2.0" || tarifa.nome === "Repsol: Tarifa Leve Sem Mais" || tarifa.nome === "Plenitude: Tarifa Tendência"
                ) {
                    nomeStyle += "color:#0070C0;";
                } else {
                    nomeStyle += "color:black;";
                }
            }
            tabelaResultados += `<tr>
                                    <td style='${nomeStyle}'>${tarifa.nome}</td>
                                    <td style='${isMinPotencia} background-color:${corPotencia}; color:black;'>${tarifa.potencia.toFixed(4)}</td>
                                    <td style='${isMinSimples} background-color:${corSimples}; color:black;'>${tarifa.simples.toFixed(4)}</td>
                                    <td style='${isMinCusto} background-color:${corCusto}; color:black;'>${tarifa.custo.toFixed(2)}</td>
                                 </tr>`;
        });
    
        tabelaResultados += "</table>";
        document.getElementById("resultado").innerHTML = tabelaResultados;
        // Agora que a tabela foi desenhada, o botão já existe — associar o evento!
        document.getElementById("btnEsquema")?.addEventListener("click", () => {
            // inverte o esquema
            esquemaAtual = (esquemaAtual === "azul-vermelho")
                ? "azul-creme-vermelho"
                : "azul-vermelho";

            // atualiza o ícone
            const icone = document.getElementById("iconeRaio");
            if (icone) {
                icone.style.color = esquemaAtual === "azul-vermelho" ? "#FFFFFF" : "#FFF6E5";
                icone.classList.add("pulsar");
                setTimeout(() => icone.classList.remove("pulsar"), 600);
            }

            // **NOVO**: troca também as cores do select de potência e do input de consumo
            const pot = document.getElementById("potenciac");
            const con = document.getElementById("consumo");
            if (esquemaAtual === "azul-creme-vermelho") {
                pot.style.backgroundColor = "#007A1E";  // azul escuro
                pot.style.color = "#FFFFFF";
                con.style.backgroundColor = "#F0B000";  // creme
                con.style.color = "#000000";
            } else {
                pot.style.backgroundColor = "#375623";  // verde original
                pot.style.color = "#FFFFFF";
                con.style.backgroundColor = "#FFC000";  // amarelo original
                con.style.color = "#000000";
            }

            // finalmente, redesenha tudo com o novo esquema de heat-map
            atualizarResultados();
        });
        
        

    }
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
    const temas = {
        "azul-vermelho": {
            potBg: "#375623", potFg: "#FFFFFF",
            conBg: "#FFC000", conFg: "#000000"
        },
        "azul-creme-vermelho": {
            potBg: "#007A1E", potFg: "#FFFFFF",
            conBg: "#FFF6E5", conFg: "#000000"
        }
    }[esquema] || {};
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
    const arrowDef        = btnDef.querySelector(".arrow-icon");
    const arrowDias       = btnDias.querySelector(".arrow-icon");
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
    await carregarDadosCSV();
    aplicarEsquema(esquemaAtual);
    preencherSelecaoMeses();
    document.getElementById("incluirACP").checked = true;
    atualizarResultados();

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
    btnDef.addEventListener("click", () => {
        const isHidden = secaoDef.style.display === "none" ||
                         getComputedStyle(secaoDef).display === "none";
        secaoDef.style.display = isHidden ? "block" : "none";
        arrowDef.classList.toggle("fa-chevron-down", !isHidden);
        arrowDef.classList.toggle("fa-chevron-up", isHidden);
    });

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

    // 8) Botão Dias (chevron/menu)
    btnDias.addEventListener("click", () => {
        const aberto = !div3.classList.contains("hidden");
        div3.classList.toggle("hidden", aberto);
        arrowDias.classList.toggle("fa-chevron-down", aberto);
        arrowDias.classList.toggle("fa-chevron-up", !aberto);
    
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
});
