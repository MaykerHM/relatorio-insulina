let arquivoHTML = document.getElementById('arquivoHTML')
let gerarRelatorio = (doc) => {
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

  pTextList.map((e, index, array) => {
    if (index > 0) {
      let before = array[parseInt(index) - 1]
      let after = array[parseInt(index) + 1]

      if (e.includes('UBS') || e.includes('UASF') || e.includes('POLICLINICA')){
        i = index
        let ubsArray = e
        partArray.push(ubsArray)
      }

      if (e.includes('NPH 100') || e.includes('REGULAR 100') || e.includes(' ANOS')) {
        usersArray.push(e)
      }
      if (partArray.length > 0) {
        if ((after && after.includes('Saude')) || array.length == index + 1) {
          partArray.push(usersArray)
          allArray.push(partArray)
          partArray = []
          usersArray = []
        }
      }
    }
  })

  let simplifiedArray = allArray.map((e) => {
    let nph = 0
    let regular = 0
    e[1].map((e) => {
      if (e.includes('NPH 100')) {
        nph += 1
      } else if (e.includes('REGULAR 100')) {
        regular += 1
      }
    })
    let pacientes = e[1].length - nph - regular 
    let ubs = e[0]

    return [ubs, pacientes, nph, regular]
  })

  let result = []

  simplifiedArray.map((e, index, array) => {
    let indexUBS = result.findIndex((x) => x.UBS === e[0])
    if (indexUBS == -1) {
      let object = {
        UBS: e[0],
        total_pacientes: e[1],
        total_nph: e[2],
        total_regular: e[3],
      }
      result.push(object)
    } else {
      result[indexUBS].total_pacientes += e[1]
      result[indexUBS].total_nph += e[2]
      result[indexUBS].total_regular += e[3]
    }
  })

  result.map((e) => {
e.somente_regular = e.total_pacientes - e.total_nph
    e.somente_nph = e.total_pacientes - e.total_regular
e.nph_e_regular = e.total_nph + e.total_regular - e.total_pacientes
  })

  return result
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
