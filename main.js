let arquivoHTML = document.getElementById('arquivoHTML')

function agruparPorUbsEUsuario(array) {
  // Criamos um objeto para armazenar os itens agrupados
  const agrupados = {};
  
  // Percorremos o array original
  array.forEach(item => {
    // Criamos uma chave única baseada na combinação de ubs e usuario
    const chave = `${item.ubs}-${item.usuario}`;
    
    // Se essa chave já existe no objeto de agrupamento
    if (agrupados[chave]) {
      // Atualizamos os valores booleanos dando prioridade para true
      agrupados[chave].usaNPH = agrupados[chave].usaNPH || item.usaNPH;
      agrupados[chave].usaRegular = agrupados[chave].usaRegular || item.usaRegular;
    } else {
      // Se a chave não existe, criamos uma nova entrada
      agrupados[chave] = { ...item };
    }
  });
  
  // Convertemos o objeto de volta para um array
  return Object.values(agrupados);
}

function gerarTotalizadorPorUbs(arrayAgrupado) {
  // Criamos um objeto para armazenar os totalizadores por UBS
  const totalizadores = {};
  
  // Percorremos o array agrupado
  arrayAgrupado.forEach(item => {
    const ubs = item.ubs;
    
    // Se a UBS ainda não estiver no objeto totalizadores, inicializamos
    if (!totalizadores[ubs]) {
      totalizadores[ubs] = {
        UBS: ubs,
        total_pacientes: 0,
        total_nph: 0,
        total_regular: 0,
        somente_nph: 0,
        somente_regular: 0,
        nph_e_regular: 0
      };
    }
    
    // Incrementamos o total de pacientes
    totalizadores[ubs].total_pacientes++;
    
    // Contagem por tipo de insulina
    if (item.usaNPH && item.usaRegular) {
      totalizadores[ubs].nph_e_regular++;
      totalizadores[ubs].total_nph++;
      totalizadores[ubs].total_regular++;
    } else if (item.usaNPH) {
      totalizadores[ubs].somente_nph++;
      totalizadores[ubs].total_nph++;
    } else if (item.usaRegular) {
      totalizadores[ubs].somente_regular++;
      totalizadores[ubs].total_regular++;
    }
  });
  
  // Convertemos o objeto de totalizadores para um array
  return Object.values(totalizadores);
}

const gerarRelatorio = (doc) => {
  let pNodeList = Array.from(doc.querySelectorAll('p'))
  const re = /\d{2}\/\d{2}\/\d{2}/g
  let pTextList = pNodeList
    .map((e) => e.textContent)
    .filter((e) => !e.match(re))
	.filter((e) => {return !e.includes('Relatório')})
	.filter((e) => {return !e.includes('SECRETARIA MUNICIPAL')})
  let allArray = []
  let i = Number.NEGATIVE_INFINITY
  let partArray = []
  let usersArray = []

  let ubsAtual
  let usuarioAtual = ""
  let usaNPH = false
  let usaRegular = false
  let dadosExtraidos = []
  pTextList.map((e, index, array) => {
    if (index > 0) {
      let after = array[parseInt(index) + 1]

      if (e.includes('UBS') || e.includes('UASF') || e.includes('POLICLINICA')) {
        if (usuarioAtual) {
          dadosExtraidos.push({ubs: ubsAtual, usuario: usuarioAtual, usaNPH, usaRegular})
          usuarioAtual = ""
          usaNPH = false
          usaRegular = false
        }
        ubsAtual = e
      }

      if (e.includes('d. Usuario SU')) {
        if (usuarioAtual) {
          dadosExtraidos.push({ubs: ubsAtual, usuario: usuarioAtual, usaNPH, usaRegular})
          usaNPH = false
          usaRegular = false
        }
        usuarioAtual = array[parseInt(index) + 4]
      }

      if (e === 'Descr. Produto') {
        if (after === "1079708") {
          usaNPH = true
        }
        if (after === "1079709") {
          usaRegular = true
        }
      }
      if (array.length - 1 === index) {
        dadosExtraidos.push({ubs: ubsAtual, usuario: usuarioAtual, usaNPH, usaRegular})
      }
    }
  })

  const dadosAgrupados = agruparPorUbsEUsuario(dadosExtraidos)
  return gerarTotalizadorPorUbs(dadosAgrupados)
}

const table = document.getElementById('valoresExtraidos')
const extrair = () => {
  let fr = new FileReader()
  let file = arquivoHTML.files[0]
  let parser = new DOMParser()

  fr.readAsText(file)

  fr.onload = () => {
    let doc = parser.parseFromString(fr.result, 'text/html')
    let resultado = gerarRelatorio(doc)

    table.innerHTML = `<table>
    <tr>
    <th colspan="5">Usuários de Insulina</th>
    </tr>
    <tr>
      <th>UBS</th>
      <th>Usuários</th>
      <th>NPH</th>
      <th>NPH e Regular</th>
      <th>Regular</th>
    </tr>
  </table>`

    resultado.map((e) => {
      let row = table.insertRow(table.length)
      let cell1 = row.insertCell(0)
      let cell2 = row.insertCell(1)
      let cell3 = row.insertCell(2)
      let cell4 = row.insertCell(3)
      let cell5 = row.insertCell(4)
      cell1.innerHTML = `${e.UBS}`
      cell2.innerHTML = `${e.total_pacientes}`
      cell3.innerHTML = `${e.somente_nph}`
      cell4.innerHTML = `${e.nph_e_regular}`
      cell5.innerHTML = `${e.somente_regular}`
    })
    let total_pacientes = 0
    let total_nph = 0
    let total_regular = 0
    let total_nph_e_regular = 0
    resultado.map((e) => {
      total_pacientes += e.total_pacientes
      total_nph += e.somente_nph
      total_nph_e_regular += e.nph_e_regular
      total_regular += e.somente_regular
    })
    let row = table.insertRow(table.length)
    let cell1 = row.insertCell(0)
    let cell2 = row.insertCell(1)
    let cell3 = row.insertCell(2)
    let cell4 = row.insertCell(3)
    let cell5 = row.insertCell(4)
    cell1.innerHTML = '<b>TOTAL</b>'
    cell2.innerHTML = `${total_pacientes}`
    cell3.innerHTML = `${total_nph}`
    cell4.innerHTML = `${total_nph_e_regular}`
    cell5.innerHTML = `${total_regular}`
  }
}

document.getElementById('extrair').onclick = extrair
