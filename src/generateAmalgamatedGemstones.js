const fs = require('fs')
const flatStringify = require('./helpers/flatStringify')

const AMALGAMATED_GEMSTONE = 68063
const CRYSTALLINE_DUST = 24277
const GLOB_OF_ECTOPLASM = 19721
const BASE_INGREDIENTS = [
  24514, // Crest of the Assassin
  24518, // Crest of the Magi
  24532, // Crest of the Rabid
  24533, // Crest of the Shaman
  24524, // Crest of the Soldier
  72436, // Agate Orb
  42010, // Azurite Orb
  24520, // Beryl Orb
  76491, // Black Diamond
  24512, // Chrysocola Orb
  24510, // Coral Orb
  75654, // Ebony Orb
  24515, // Emerald Orb
  74988, // Flax Blossom
  76179, // Freshwater Pearl
  72315, // Maguuma Burl
  70957, // Maguuma Lily
  72504, // Moonstone Orb
  24522, // Opal Orb
  24508, // Ruby Orb
  24516, // Sapphire Orb
  24884, // Copper Doubloon
  24502, // Silver Doubloon
  24772, // Gold Doubloon
  24773 // Platinum Doubloon
]

function run () {
  const recipes = generateGemstoneRecipes()
  console.log(`Generated ${recipes.length} recipes`)

  // Load the recipe file
  let recipeFile = JSON.parse(fs.readFileSync('./recipes.json', 'utf-8'))
  console.log('Read recipe file')

  // Remove the old recipes & add new recipes
  recipeFile = recipeFile.filter(x => x.output_item_id !== 68063)
  recipeFile = recipeFile.concat(recipes)
  console.log('Updated recipe file')

  // Write the recipe file
  fs.writeFileSync('./recipes.json', flatStringify(recipeFile), 'utf-8')
  console.log('Wrote recipe file')
}

function generateGemstoneRecipes () {
  let recipes = []

  // Note: We are deliberately ignoring the chance (10%) for a higher component count, because
  // this annoyingly breaks the recipe generation for higher level recipes. :<

  BASE_INGREDIENTS.forEach(ingredient => {
    recipes.push({
      'name': 'Amalgamated Gemstone',
      'output_item_id': AMALGAMATED_GEMSTONE,
      'output_item_count': 1,
      'ingredients': [
        {'count': 1, 'item_id': CRYSTALLINE_DUST},
        {'count': 3, 'item_id': ingredient},
        {'count': 3, 'item_id': ingredient},
        {'count': 3, 'item_id': ingredient}
      ],
      'disciplines': ['Mystic Forge']
    })

    recipes.push({
      'name': 'Amalgamated Gemstone',
      'output_item_id': AMALGAMATED_GEMSTONE,
      'output_item_count': 10,
      'ingredients': [
        {'count': 5, 'item_id': GLOB_OF_ECTOPLASM},
        {'count': 25, 'item_id': ingredient},
        {'count': 25, 'item_id': ingredient},
        {'count': 25, 'item_id': ingredient}
      ],
      'disciplines': ['Mystic Forge']
    })
  })

  return recipes
}

run()
