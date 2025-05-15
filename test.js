let pNodeList = Array.from(document.querySelectorAll('p'))
const re = /\d{2}\/\d{2}\/\d{2}/g
let pTextList = pNodeList.map((e) => e.textContent).filter((e) => !e.match(re))

// const findByPreviousText = (beforeText, textArray) => {
//   return textArray.filter((e, index, array) => {
//     if (index > 0) {
//       let before = array[parseInt(index) - 1]
//       if (before.includes(beforeText)) {
//         return true
//       }
//     }
//   })
// }

// console.log(pTextList)

// let usuarios = findByPreviousText('Usuario', pTextList)
// console.log(usuarios)

// let ubss = findByPreviousText('Saude', pTextList)
// console.log(ubss)

// let medicamentos = findByPreviousText('Produto', pTextList)
// console.log(medicamentos)

let allArray = []
let i = Number.NEGATIVE_INFINITY
let partArray = []
let usersArray = []

pTextList.map((e, index, array) => {
  if (index > 0) {
    let before = array[parseInt(index) - 1]
    let after = array[parseInt(index) + 1]

    if (before.includes('Saude')) {
      i = index
      let ubsArray = e
      partArray.push(ubsArray)
    }

    if (before.includes('Produto') || before.includes('Usuario')) {
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

// console.log(allArray)

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

// console.log(simplifiedArray)

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
  e.nph_e_regular = e.total_nph - e.total_pacientes + e.total_regular
  e.somente_nph = e.total_nph - e.nph_e_regular
  e.somente_regular = e.total_regular - e.nph_e_regular
})

console.log(result)
