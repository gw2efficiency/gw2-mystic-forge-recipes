const querystring = require('querystring')
const fetch = require('node-fetch')

const BASE_API_URL = 'https://wiki.guildwars2.com/api.php?'

let currencies
const currencyInitializationPromise = (async () => {
  currencies = await getCurrencies()
})()

module.exports.queryApi = queryApi
module.exports.getIdForName = getIdForName
module.exports.getCurrencyForName = getCurrencyForName

async function queryApi (query, offset = 0) {
  const parameters = {
    action: 'ask',
    format: 'json',
    query: query + `|limit=500|offset=${offset}`,
  }

  const url = BASE_API_URL + querystring.stringify(parameters)
  const response = await fetch(url).then(x => x.json())

  let results = Object.values(response.query.results)
  let moreResults = []

  if (response['query-continue-offset']) {
    moreResults = await queryApi(query, response['query-continue-offset'])
  }

  return results.concat(moreResults)
}

async function getCurrencyForName(name) {
  let multiplier = 1
  switch (name) {
    case 'Ascended Shard of Glory':
      name = 'Ascended Shards of Glory'
      break
    case 'Laurels':
      name = 'Laurel'
      break
    case 'Gold':
      name = 'Coin'
      multiplier = 10000
      break
    case 'Silver':
      name = 'Coin'
      multiplier = 100
      break
    case 'Copper':
      name = 'Coin'
      break
    default:
      break
  }

  await currencyInitializationPromise
  const currency = currencies.find((x) => x.name.toLowerCase() === name.toLowerCase())

  return {currency, multiplier}
}

async function getIdForName(name) {
  if (name === 'Ectoplasm') { // instead of 'Glob of Ectoplasm'
    return 19721
  }

  // agony infusions have their "+" escaped (=removed) in the vendor property, but can only be queried for with the full name...
  if (/^(\w+ )?[0-9]+ (Agony|Simple) Infusion$/.exec(name)) {
    const index = /[0-9]+ (Agony|Simple) Infusion$/.exec(name).index
    name = name.substring(0, index) + "+" + name.substring(index)
  }

  const results = await queryApi(`[[Has context::Item]][[Has canonical name::${name}]]|?Has game id`)

  if (results.length === 0) {
    console.error(`Found no id for '${name}'. Please fix this manually (look out for 'id: null').`)
    return null
  }

  if (results.length > 1) {
    console.warn(`Name '${name}' is ambiguous. Found ids ${results.map((x) => x.printouts['Has game id'][0])}. Using the first one.`)
  }

  return results[0].printouts['Has game id'][0]
}

async function getCurrencies() {
  return await fetch('https://api.guildwars2.com/v2/currencies?lang=en&ids=all').then(x => x.json())
}
