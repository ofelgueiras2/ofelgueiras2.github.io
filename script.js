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
    Tudo: { inicio: "AV2", fim: "BC35041" },
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
    tarifariosExtra: { inicio: "C68", fim: "C79"},
    detalheTarifariosExtra: { inicio: "B68", fim: "B79"},
    preçosSimplesExtra: { inicio: "D68", fim: "W79"},
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

function setSort(field, direction) {
    sortField = field;
    sortDirection = direction;
    atualizarResultados();
}



// Obter referências aos elementos do botão e da seção
const btnDefinicoes = document.getElementById('btnDefinicoes');
const arrowIcon = document.getElementById('arrowIcon');
const secao = document.getElementById("secaoDefinicoes");

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
console.log("📌 Variável perdas2024:", obterVariavel("perdas2024"));

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
    let potenciaSelecionada = document.getElementById("potenciac").value;
    if (isNaN(consumo)) consumo = 0;
    if (!potenciaSelecionada) potenciaSelecionada = "6,9 kVA";
    let mostrarNomesAlternativos = document.getElementById("mostrarNomes").checked;
    let incluirACP = document.getElementById("incluirACP").checked;
    let incluirContinente = document.getElementById("incluirContinente").checked;
    let incluirMeo = document.getElementById("incluirMeo").checked;
    let restringir = document.getElementById("restringir").checked;

    const mesSelecionadoIndex = document.getElementById("mesSelecionado").selectedIndex;
    
    let diasInput = document.getElementById("dias").value.trim();
    diasInput = diasInput === "" ? NaN : parseFloat(diasInput.replace(",", "."));
    const diasMesesTabela = obterTabela("diasMeses")?.flat() || [];
    const strDiasTabela = obterTabela("strDias")?.flat() || [];
    let diasS = !isNaN(diasInput) ? diasInput : parseFloat(diasMesesTabela[mesSelecionadoIndex]);
    console.log(`🔎 diasS determinado: ${diasS}`);
    console.log(`🔎 diasInput determinado: ${diasInput}`);
    let strDiasSimples = (!isNaN(diasInput) ? String(diasS) : (strDiasTabela[mesSelecionadoIndex]));
    console.log(`🔎 strDias determinado: ${strDiasTabela[mesSelecionadoIndex]}`);
    console.log(`🔎 strDiasSimples determinado: ${strDiasSimples}`);

    const potencias = obterTabela("kVAs")?.map(row => row[0]) || [];
    console.log("🔍 Conteúdo de potencias:", potencias);
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
    
    let IVABaseSimples = parseFloat(obterVariavel("IVABase").replace("%", "")) / 100 || 0;
    let AudiovisualS = parseFloat(obterVariavel("Audiovisual").replace("€", "").replace(",", ".").trim()) || 0;
    let DGEGS = parseFloat(obterVariavel("DGEG").replace("€", "").replace(",", ".").trim()) || 0;
    let IESS = parseFloat(obterVariavel("IES").replace("€", "").replace(",", ".").trim()) || 0;
    let IVA_AudiovisualSimples = parseFloat(obterVariavel("IVA_Audiovisual").replace("%", "")) / 100 || 0;
    let IVA_DGEGSimples = parseFloat(obterVariavel("IVA_DGEG").replace("%", "")) / 100 || 0;
    let IVA_IESS = parseFloat(obterVariavel("IVA_IES").replace("%", "")) / 100 || 0;
    let kWhIVAPromocionalS = parseFloat(obterVariavel("kWhIVAPromocional")) || 0;
    kWhIVAPromocionalS = Math.round((kWhIVAPromocionalS * diasS) / 30);
    let IVAPromocionalS = parseFloat(obterVariavel("IVAPromocional").replace("%", "")) / 100 || 0;
    let FTSS = parseFloat(obterVariavel("FTS").replace("€", "").replace(",", ".").trim()) || 0;
    let TARSimplesS = parseFloat(obterVariavel("TARSimples").replace("€", "").replace(",", ".").trim()) || 0;
    let luzboaCGSS = parseFloat(obterVariavel("luzboaCGS")) || 0;
    let luzboaFAS = parseFloat(obterVariavel("luzboaFA")) || 0;
    let luzboaKS = parseFloat(obterVariavel("luzboaK")) || 0;
    let ibelectraCSS = parseFloat(obterVariavel("ibelectraCS")) || 0;
    let ibelectraKS = parseFloat(obterVariavel("ibelectraK")) || 0;
    let perdas2024S = parseFloat(obterVariavel("perdas2024")) || 0;
    let precoACPS = parseFloat(obterVariavel("precoACP").replace("€", "").replace(",", ".").trim()) || 0;
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
    
    let OMIESSelecionadoS = OMIES[mesSelecionadoIndex]?.[0] || 0;
    let PerdasSelecionadoS = PerdasS[mesSelecionadoIndex]?.[0] || 0;
    
    const colIndex = potencias.indexOf(potenciaSelecionada);
    if (colIndex === -1) {
        throw new Error("Potência selecionada inválida.");
    }
    const colPotencia = colIndex * 2;
    const colSimples = colPotencia + 1;
    
    const luzigasFeeTabela = obterTabela("LuzigazFee")?.flat() || [];
    let luzigasFeeS = luzigasFeeTabela[colIndex] || "0";
    luzigasFeeS = parseFloat(luzigasFeeS.replace("€", "").replace(",", ".").trim()) || 0;
    luzigasFeeS = parseFloat((luzigasFeeS * (1 + IVABaseSimples)).toFixed(2));

    let IVAFixoS;
    console.log("Potência:", potenciaSelecionada, IVAFixoS, kVAsTarSocialS)
    if (kVAsTarSocialS.includes(potenciaSelecionada)) {
        IVAFixoS = IVAPromocionalS;
    } else {
        IVAFixoS = IVABaseSimples;
    }
    console.log("IVAFixoS:", IVAFixoS)
    
    // --- Criação do array de tarifários a partir dos dados CSV ---
    // MODIFICAÇÃO 1: Marcação dos tarifários indexados (empresas entre C19 e C25)
    let tarifarios = nomesTarifarios.map((nome, i) => {
        let isIndexado = false;
        if (i + 5 >= 19 && i + 5 <= 25) { // Como a tabela começa em C5
            isIndexado = true;
        }
        
        let potencia = parseFloat(tarifariosDados[i]?.[colPotencia]) || 0;
        let simples;

        if (nome === "Luzboa indexado") {
            simples = parseFloat(((OMIESSelecionadoS + luzboaCGSS) * (1 + PerdasSelecionadoS) * luzboaFAS + luzboaKS + TARSimplesS).toFixed(4)) + FTSS;
        } else if (nome === "Ibelectra indexado") {
            simples = parseFloat(((OMIESSelecionadoS + ibelectraCSS) * (1 + perdas2024S) + ibelectraKS + TARSimplesS).toFixed(5)) + FTSS;
        } else if (nome.startsWith("Luzigás Energy 8.8")) {
            simples = parseFloat(((OMIESSelecionadoS + luzigasCSS) * (1 + PerdasSelecionadoS) + luzigasKS + TARSimplesS).toFixed(4)) + FTSS;
        } else if (nome === "EDP indexado") {
            simples = parseFloat((OMIESSelecionadoS * EDPK1S + EDPK2S + TARSimplesS).toFixed(4));
        } else if (nome === "Repsol indexado") {
            simples = parseFloat((OMIESSelecionadoS * (1 + PerdasSelecionadoS) * repsolFAS + repsolQTarifaS + TARSimplesS).toFixed(6)) + FTSS;
        } else if (nome === "Coopérnico") {
            simples = parseFloat(((OMIESSelecionadoS + coopernicoCGSS + coopernicoKS) * (1 + PerdasSelecionadoS) + TARSimplesS).toFixed(6)) + FTSS;
        } else if (nome === "Plenitude indexado") {
            simples = parseFloat(((OMIESSelecionadoS + plenitudeCGSS + plenitudeGDOSS) * (1 + PerdasSelecionadoS) 
            + plenitudeFeeS + TARSimplesS).toFixed(4));
            console.log("Plenitude indexado:", simples);
        } else {                            
            simples = parseFloat(tarifariosDados[i]?.[colSimples]) || 0;
        }

        if (nome === "Meo" && incluirMeo) {
            simples -= 0.01;
        }

        const nomeExibido = mostrarNomesAlternativos && nomesTarifariosDetalhados[i] ? nomesTarifariosDetalhados[i] : nome;

        let custo = (potencia * diasS * (1 + IVABaseSimples)) +
                    simples * (Math.max(consumo - kWhIVAPromocionalS, 0) * (1 + IVABaseSimples) +
                               Math.min(consumo, kWhIVAPromocionalS) * (1 + IVAFixoS)) +
                    (AudiovisualS * (1 + IVA_AudiovisualSimples)) +
                    (DGEGS * (1 + IVA_DGEGSimples)) +
                    consumo * (IESS * (1 + IVA_IESS));
    
        if (nome.startsWith("Luzigás Energy 8.8") && diasS > 0) {
            potencia += luzigasFeeS / diasS / (1 + IVABaseSimples);
            custo += luzigasFeeS;
        }
    
        if (nome.startsWith("Goldenergy ACP")) {
            custo += precoACPS;
        }
    
        return {
            nome: nomeExibido,
            potencia,
            simples,
            custo: parseFloat(custo.toFixed(2)),
            isIndexado // Propriedade adicionada para identificar tarifários indexados
        };
    });
    
    if (!restringir) {
        const nomesTarifariosExtra = obterTabela("tarifariosExtra")?.flat() || [];
        const nomesTarifariosDetalhadosExtra = obterTabela("detalheTarifariosExtra")?.flat() || [];
        const tarifariosDadosExtra = obterTabela("preçosSimplesExtra");

        nomesTarifariosExtra.forEach((nome, i) => {
            let potencia = parseFloat(tarifariosDadosExtra[i]?.[colPotencia]) || 0;
            let simples = parseFloat(tarifariosDadosExtra[i]?.[colSimples]) || 0;

            if (nome === "Galp Continente" && incluirContinente) {
                potencia *= 0.9;
                simples *= 0.9;
            }
            
            const nomeExibido = mostrarNomesAlternativos && nomesTarifariosDetalhadosExtra[i] ? nomesTarifariosDetalhadosExtra[i] : nome;

            let custo = (potencia * diasS * (1 + IVABaseSimples)) +
                    simples * (Math.max(consumo - kWhIVAPromocionalS, 0) * (1 + IVABaseSimples) +
                               Math.min(consumo, kWhIVAPromocionalS) * (1 + IVAFixoS)) +
                    (AudiovisualS * (1 + IVA_AudiovisualSimples)) +
                    (DGEGS * (1 + IVA_DGEGSimples)) +
                    consumo * (IESS * (1 + IVA_IESS));

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
    
        function calcularCor(valor, min, max) {
            const corMin = [90, 138, 198];
            const corMed = [252, 252, 255];
            const corMax = [248, 105, 107];
            let corFinal;
            if (valor <= (min + max) / 2) {
                const percent = (valor - min) / (((min + max) / 2) - min || 1);
                corFinal = corMin.map((c, i) => Math.round(c + percent * (corMed[i] - c)));
            } else {
                const percent = (valor - ((min + max) / 2)) / (max - ((min + max) / 2) || 1);
                corFinal = corMed.map((c, i) => Math.round(c + percent * (corMax[i] - c)));
            }
            return `rgb(${corFinal[0]}, ${corFinal[1]}, ${corFinal[2]})`;
        }
    
        
        let tabelaResultados = `<table>
        <tr>
          <th colspan="3" rowspan="2" style="background-color:#375623; color:white; text-align:center; vertical-align:middle; position:relative;
          font-weight: normal;line-height:1;">
            <div style="font-weight: bold;margin-top: 15px;margin-bottom: 10px;">Potência contratada ${potenciaSelecionada}</div>
            <br>
            <div style="font-size: 14px;margin-bottom: -10px;">${strDiasSimples} dia${(typeof diasS === 'number' && diasS !== 1 ? 's' : '')}</div>
            <br>
            <div style="font-size: 14px;">OMIE = ${OMIESSelecionadoS} €/kWh</div>            
            <span class="sort-container">
              <span class="sort-arrow ${sortField==='default' && sortDirection==='asc' ? 'selected' : ''}" onclick="setSort('default','asc')">&#9650;</span>
              <span class="sort-arrow ${sortField==='default' && sortDirection==='desc' ? 'selected' : ''}" onclick="setSort('default','desc')">&#9660;</span>
            </span>
          </th>
          <th style="background-color:#375623; color:white; text-align:center;">
            Consumo (kWh)
          </th>
        </tr>

        <tr>
          <td style="background-color:#FFC000; font-weight:bold; color:black; text-align:center;">
            ${consumo || 0}
          </td>
        </tr>
        <tr>
          <th style="background-color:#00B050; font-weight:bold; color:white; text-align:center; position:relative;">
            Tarifário
            <span class="sort-container">
              <span class="sort-arrow ${sortField==='tariff' && sortDirection==='asc' ? 'selected' : ''}" onclick="setSort('tariff','asc')">&#9650;</span>
              <span class="sort-arrow ${sortField==='tariff' && sortDirection==='desc' ? 'selected' : ''}" onclick="setSort('tariff','desc')">&#9660;</span>
            </span>
          </th>
          <th style="background-color:#00B050; font-weight:bold; color:white; text-align:center; position:relative;">
            Potência (€/dia)
            <span class="sort-container">
              <span class="sort-arrow ${sortField==='power' && sortDirection==='asc' ? 'selected' : ''}" onclick="setSort('power','asc')">&#9650;</span>
              <span class="sort-arrow ${sortField==='power' && sortDirection==='desc' ? 'selected' : ''}" onclick="setSort('power','desc')">&#9660;</span>
            </span>
          </th>
          <th style="background-color:#00B050; font-weight:bold; color:white; text-align:center; position:relative;">
            Simples (€/kWh)
            <span class="sort-container">
              <span class="sort-arrow ${sortField==='simple' && sortDirection==='asc' ? 'selected' : ''}" onclick="setSort('simple','asc')">&#9650;</span>
              <span class="sort-arrow ${sortField==='simple' && sortDirection==='desc' ? 'selected' : ''}" onclick="setSort('simple','desc')">&#9660;</span>
            </span>
          </th>
          <th style="background-color:#00B050; font-weight:bold; color:white; text-align:center; position:relative;">
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
                nomeStyle = "background-color:#FFC000; font-weight:bold; color:black;";
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
    }
}

document.getElementById("mesSelecionado")?.addEventListener("change", atualizarResultados);
document.getElementById("dias")?.addEventListener("input", atualizarResultados);
document.getElementById("consumo")?.addEventListener("input", atualizarResultados);
document.getElementById("potenciac")?.addEventListener("change", atualizarResultados);
document.getElementById("fixo")?.addEventListener("input", atualizarResultados);
document.getElementById("variavel")?.addEventListener("input", atualizarResultados);
document.getElementById("mostrarNomes")?.addEventListener("change", atualizarResultados);
document.getElementById("incluirACP")?.addEventListener("change", atualizarResultados);
document.getElementById("incluirContinente")?.addEventListener("change", atualizarResultados);
document.getElementById("incluirMeo")?.addEventListener("change", atualizarResultados);
document.getElementById("restringir")?.addEventListener("change", atualizarResultados);

window.onload = async function () {
    console.log("🔄 Iniciando carregamento do CSV...");
    await carregarDadosCSV();
    preencherSelecaoMeses();
    console.log("📊 Dados carregados! Atualizando interface...");
    atualizarResultados();
    document.getElementById("incluirACP").checked = true;
    atualizarResultados()
};

btnDefinicoes.addEventListener("click", function() {
    if (secao.style.display === "none" || secao.style.display === "") {
      secao.style.display = "block";
      arrowIcon.classList.remove('fa-chevron-down');
      arrowIcon.classList.add('fa-chevron-up');
    } else {
      secao.style.display = "none";
      arrowIcon.classList.remove('fa-chevron-up');
      arrowIcon.classList.add('fa-chevron-down');
    }
});

document.getElementById("btnLimpar").addEventListener("click", function() {
    document.getElementById("fixo").value = "";
    document.getElementById("variavel").value = "";
    atualizarResultados();
});

document.getElementById("btnLimpar").addEventListener("click", function() {
    document.getElementById("fixo").value = "";
    document.getElementById("variavel").value = "";
    atualizarResultados();
});

document.getElementById("abaMeuTarifario").addEventListener("click", function() {
    alternarAba("MeuTarifario");
});

document.getElementById("abaOutrasOpcoes").addEventListener("click", function() {
    alternarAba("OutrasOpcoes");
});

function alternarAba(abaSelecionada) {
    const abas = ["MeuTarifario", "OutrasOpcoes"];
    
    abas.forEach(aba => {
        document.getElementById("aba" + aba).classList.toggle("ativa", aba === abaSelecionada);
        document.getElementById("conteudo" + aba).classList.toggle("ativa", aba === abaSelecionada);
    });
}
