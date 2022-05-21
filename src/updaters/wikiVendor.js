const querystring = require('querystring')
const fetch = require('node-fetch')

const BASE_API_URL = 'https://wiki.guildwars2.com/api.php?'

let currencies = {}

module.exports = getVendor

async function getVendor(vendorName) {
  currencies = await getCurrencies()

  const offeredItems = await queryApi(vendorName)

  return {
    name: vendorName,
    locations: offeredItems[0].printouts['Located in'].map((x) => x.fulltext),
    purchase_options: await Promise.all(offeredItems.map(formatOfferedItem))
  }
}

async function queryApi (vendorName, offset = 0) {
  const parameters = {
    action: 'ask',
    format: 'json',
    query: `[[Has vendor::${vendorName}]]|?Located in|?Sells item.Has game id|?Has item quantity|?Has item cost` +
        `|limit=500|offset=${offset}`,
  }

  const url = BASE_API_URL + querystring.stringify(parameters)
  const response = await fetch(url).then(x => x.json())

  let results = Object.values(response.query.results)
  let moreResults = []

  if (response['query-continue-offset']) {
    moreResults = await queryApi(vendorName, response['query-continue-offset'])
  }

  return results.concat(moreResults)
}

async function formatOfferedItem (item) {
  let result = {}

  result.type = 'Item'
  result.id = item.printouts['Has game id'][0]
  result.count = item.printouts['Has item quantity'][0]
  result.price = await Promise.all(item.printouts['Has item cost'].map(formatCost))

  return result
}

async function formatCost (cost) {
  let result = {}

  const name = cost['Has item currency'].item[0]

  const currency = currencies.find((x) => x.name === name)
  if (currency) {
    result.type = 'Currency'
    result.id = currency.id
  } else {
    result.type = 'Item'
    result.id = await getIdForName(name)
  }

  result.count = Number(cost['Has item value'].item[0])

  return result
}

async function getIdForName(name) {
  const parameters = {
    action: 'ask',
    format: 'json',
    query: `[[Has context::Item]][[Has canonical name::${name}]]|?Has game id`
  }

  const url = BASE_API_URL + querystring.stringify(parameters)
  const response = await fetch(url).then(x => x.json())
  const results = Object.values(response.query.results)

  if (response.length > 1) {
    console.warn(`Name '${name}' is ambiguous. Found ids ${results.map((x) => x.printouts['Has game id'][0])}. Using the first one.`)
  }

  return results[0].printouts['Has game id'][0]
}

async function getCurrencies() {
  return await fetch('https://api.guildwars2.com/v2/currencies?lang=en&ids=all').then(x => x.json())
}
