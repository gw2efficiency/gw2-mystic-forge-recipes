const fs = require('fs')
const flocky = require('@devoxa/flocky')
const MERCHANTS = require('../merchants')

console.log('Reading item cache...')
const ITEM_CACHE = JSON.parse(fs.readFileSync('./item-cache.json', 'utf-8'))
const ITEM_NAME_MAP = {}
ITEM_CACHE.forEach((item) => (ITEM_NAME_MAP[item.id] = item.name))

console.log(`Generating recipes out of ${MERCHANTS.length} merchants...`)
const ignoredIds = [19675]
let recipes = []
for (const merchant of MERCHANTS) {
  for (const purchaseOption of merchant.purchase_options) {
    if (purchaseOption.ignore || ignoredIds.includes(purchaseOption.id)) {
      continue
    }

    if (purchaseOption.type !== 'Item') {
      console.error(`  > ERROR: Unsupported type "${purchaseOption.type}" for purchase option`)
      process.exit(1)
    }

    if (!ITEM_NAME_MAP[purchaseOption.id]) {
      console.warn(`  > WARN: Ignoring purchase option, unsupported item id "${purchaseOption.id}"`)
      continue
    }

    const priceItems = purchaseOption.price.filter((x) => x.type === 'Item')
    for (const item of priceItems) {
      if (!ITEM_NAME_MAP[item.id]) {
        console.warn(`  > WARN: Ignoring purchase option, unsupported price item id "${item.id}"`)
        continue
      }
    }

    const ingredients = purchaseOption.price.map((priceItem) => ({
      count: priceItem.count,
      type: priceItem.type,
      id: priceItem.id,
    }))

    const recipe = {
      name: ITEM_NAME_MAP[purchaseOption.id],
      output_item_id: purchaseOption.id,
      output_item_count: purchaseOption.count,
      ingredients,
      disciplines: ['Merchant'],
      merchant: {
        name: merchant.name,
        locations: merchant.locations,
      },
    }

    recipe.merchant_data_hash = flocky.hash(recipe)

    recipes.push(recipe)
  }
}
console.log(`  > Generated ${recipes.length} recipes`)

console.log('Merging generated recipes with recipes.json...')
const merchantDataHashes = recipes.map((x) => x.merchant_data_hash)
let recipesJson = JSON.parse(fs.readFileSync('./recipes.json', 'utf-8'))

recipesJson = flocky.compact(
  recipesJson.map((x) => {
    if (!x.merchant_data_hash) return x
    if (!merchantDataHashes.includes(x.merchant_data_hash)) return null

    return recipes.find((y) => y.merchant_data_hash === x.merchant_data_hash)
  })
)

const existingMerchantDataHashes = flocky.compact(recipesJson.map((x) => x.merchant_data_hash))
const newRecipes = recipes.filter((x) => !existingMerchantDataHashes.includes(x.merchant_data_hash))
recipesJson = recipesJson.concat(newRecipes)

console.log('Writing output into recipes.json...')
fs.writeFileSync('./recipes.json', JSON.stringify(recipesJson, null, 2), 'utf-8')

console.log('Done, next run `node src/format.js && node src/validate.js`')
