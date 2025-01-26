const fs = require('fs')
const api = require('gw2api-client')
const flatStringify = require('./helpers/flatStringify')

async function run () {
  const items = await api().recipes().all()
  fs.writeFileSync('./official-recipe-cache.json', flatStringify(items), 'utf-8')
}

run()
