const fs = require('fs')
const flatStringify = require('./helpers/flatStringify')

const MYSTIC_FACET = 101540
const PILE_OF_LUCENT_CRYSTAL = 89271

function run() {
  const recipes = generateGemstoneRecipes()
  console.log(`Generated ${recipes.length} recipes`)

  // Load the recipe file
  let recipeFile = JSON.parse(fs.readFileSync('./recipes.json', 'utf-8'))
  console.log('Read recipe file')

  // Remove the old recipes & add new recipes
  recipeFile = recipeFile.filter(x => x.output_item_id !== MYSTIC_FACET)
  recipeFile = recipeFile.concat(recipes)
  console.log('Updated recipe file')

  // Write the recipe file
  fs.writeFileSync('./recipes.json', flatStringify(recipeFile), 'utf-8')
  console.log('Wrote recipe file')
}

function generateGemstoneRecipes() {
  const items = JSON.parse(fs.readFileSync('./item-cache.json', 'utf-8'))
  const unofficialItems = JSON.parse(fs.readFileSync('./unofficial-item-cache.json', 'utf-8'))

  const relics = items
    .filter(item => ['Mwcc', 'Relic'].includes(item.type))
    .filter(item => item.rarity === 'Exotic')
    .filter(item => {
      const unofficialItem = unofficialItems.find(x => x.id === item.id)
      return unofficialItem && unofficialItem.tradable
    })

  console.log(`Found ${relics.length} relics`)

  return relics.map((item) => ({
    'name': 'Mystic Facet',
    'output_item_id': MYSTIC_FACET,
    'output_item_count': 1,
    'ingredients': [
      {'count': 1, 'type': 'Item', id: item.id},
      {'count': 250, 'type': 'Item', 'id': PILE_OF_LUCENT_CRYSTAL},
      {'count': 250, 'type': 'Item', 'id': PILE_OF_LUCENT_CRYSTAL},
      {'count': 250, 'type': 'Item', 'id': PILE_OF_LUCENT_CRYSTAL}
    ],
    'disciplines': ['Mystic Forge']
  }))
}

run()
