const fs = require('fs')
const api = require('gw2api-client')
const fetch = require('node-fetch')
const flatStringify = require('./helpers/flatStringify')

async function run () {
  const unofficialItems = await fetch('https://api.gw2efficiency.com/items?ids=all').then(x => x.json())
  fs.writeFileSync('./unofficial-item-cache.json', flatStringify(unofficialItems), 'utf-8')
  console.log('Saved unofficial-item-cache.json')

  const items = await api().items().all()
  fs.writeFileSync('./item-cache.json', flatStringify(items), 'utf-8')
  console.log('Saved item-cache.json')
}

run()
