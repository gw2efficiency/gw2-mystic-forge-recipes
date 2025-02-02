const fetch = require('node-fetch')

const smw = require('./smw')
const queryApi = smw.queryApi
const getIdForName = smw.getIdForName
const getCurrencyForName = smw.getCurrencyForName

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
  console.log(`Processing item ${name}`)

  return await Promise.all(vendors.map(getVendor))
}

async function getVendor(vendorName) {
  console.log(`Processing vendor ${vendorName}`)

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

async function formatOfferedItem (item) {
  if (item.printouts['Has availability'][0] !== 'Current') {
    return
  }

  let result = {}

  result.type = 'Item'
  result.id = item.printouts['Has game id'][0] || await getIdForName(item.printouts['Sells item'][0].fulltext)
  result.count = item.printouts['Has item quantity'][0]
  result.price = await Promise.all(item.printouts['Has item cost'].map(formatCost))

  if (result.id === undefined || result.count === undefined || result.price === undefined) {
    console.error(`Item '${item.printouts['Sells item'][0] ? item.printouts['Sells item'][0].fulltext : item.fulltext}' misses some property:`, result)
  }

  result.id = result.id || null
  result.count = result.count || null
  result.price = result.price || null

  return result
}

async function formatCost (cost) {
  let result = {}

  const name = cost['Has item currency'].item[0]

  const {currency, multiplier} = await getCurrencyForName(name)
  if (currency) {
    result.type = 'Currency'
    result.id = currency.id
  } else {
    result.type = 'Item'
    result.id = await getIdForName(name)
  }

  result.count = multiplier * Number(cost['Has item value'].item[0])

  if (result.type === undefined || result.id === undefined || result.count === undefined) {
    console.error('Cost misses some property:', result)
  }

  result.type = result.type || null
  result.id = result.id || null
  result.count = result.count || null

  return result
}

async function getLocations(vendorName) {
  const results = await queryApi(`[[Has vendor::${vendorName}]]|?Located in=a|?Located in.Located in=b`)

  console.assert(results[0].printouts.a.length === results[0].printouts.b.length)
  const zipped = results[0].printouts.a.map((k, i) => [k, results[0].printouts.b[i]])

  return zipped.map((x) => x.map((y) => y ? y.fulltext : null).filter(Boolean).join(', '))
}
