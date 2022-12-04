const querystring = require('querystring')
const fetch = require('node-fetch')

const BASE_API_URL = 'https://wiki.guildwars2.com/api.php?'

let currencies = {}

module.exports.getVendorsForItem = getVendorsForItem
module.exports.getVendor = getVendor

async function getVendorsForItem(nameOrId) {
  let name = nameOrId
  if (!Number.isNaN(Number(nameOrId))) {
    const item = await fetch(`https://api.guildwars2.com/v2/items?lang=en&id=${nameOrId}`).then(x => x.json())
    name = item.name
  }

  const vendors = (await queryApi(`[[Sells item::${name}]]|?Has vendor`)).map((vendor) => vendor.printouts['Has vendor'][0].fulltext)
  if (vendors.length === 0) {
    console.warn(`Found no id for '${name}'.`)
  }
  console.log(`Processing item   ${name}`)

  return await Promise.all(vendors.map(getVendor))
}

async function getVendor(vendorName) {
  console.log(`Processing vendor ${vendorName}`)

  currencies = await getCurrencies()

  const offeredItems = await queryApi(`[[Has vendor::${vendorName}]]|?Sells item|?Sells item.Has game id|?Has item quantity|?Has item cost|?Has availability`)
  if (offeredItems.length === 0) {
    console.error(`Vendor ${vendorName} not found.`)
    return
  }

  return {
    name: vendorName,
    locations: await getLocations(vendorName),
    purchase_options: (await Promise.all(offeredItems.map(formatOfferedItem))).filter(Boolean)
  }
}

async function queryApi (query, offset = 0) {
  const parameters = {
    action: 'ask',
    format: 'json',
    query: query +  `|limit=500|offset=${offset}`,
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

async function formatOfferedItem (item) {
  if (item.printouts['Has availability'][0] !== 'Current') {
    return
  }

  let result = {}

  result.type = 'Item'
  result.id = item.printouts['Has game id'][0]
  result.count = item.printouts['Has item quantity'][0]
  result.price = await Promise.all(item.printouts['Has item cost'].map(formatCost))

  if (result.id === undefined || result.count === undefined || result.price === undefined) {
    console.error(`Item '${item.printouts['Sells item'][0]?.fulltext || item.fulltext}' misses some property:`, result)
  }

  result.id = result.id || null
  result.count = result.count || null
  result.price = result.price || null

  return result
}

async function formatCost (cost) {
  let result = {}

  const name = cost['Has item currency'].item[0]

  const currency = getCurrency(name)
  if (currency) {
    result.type = 'Currency'
    result.id = currency.id
  } else {
    result.type = 'Item'
    result.id = await getIdForName(name)
  }

  result.count = Number(cost['Has item value'].item[0])

  if (result.type === undefined || result.id === undefined || result.count === undefined) {
    console.error('Cost misses some property:', result)
  }

  return result
}

function getCurrency(name) {
  if (name === 'Ascended Shard of Glory') {
    name = 'Ascended Shards of Glory'
  } else if (name === 'Laurels') {
    name = 'Laurel';
  }
  return currencies.find((x) => x.name.toLowerCase() === name.toLowerCase())
}

async function getIdForName(name) {
  if (name === 'Ectoplasm') { // instead of 'Glob of Ectoplasm'
    return 19721
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

async function getLocations(vendorName) {
  const results = await queryApi(`[[Has vendor::${vendorName}]]|?Located in=a|?Located in.Located in=b`)

  console.assert(results[0].printouts.a.length === results[0].printouts.b.length)
  const zipped = results[0].printouts.a.map((k, i) => [k, results[0].printouts.b[i]])

  return zipped.map((x) => x.map((y) => y.fulltext).filter(Boolean).join(', '))
}
