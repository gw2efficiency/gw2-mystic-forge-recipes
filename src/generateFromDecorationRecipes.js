const fs = require('fs')
const flocky = require('@devoxa/flocky')
const flatStringify = require('./helpers/flatStringify')

console.log('Reading unofficial item cache...')
// using unofficial items as the decorations just exist as fake items in gw2e, not in the official api
const UNOFFICIAL_ITEM_CACHE = JSON.parse(fs.readFileSync('./unofficial-item-cache.json', 'utf-8'))
const UNOFFICIAL_ITEM_NAME_MAP = {}
UNOFFICIAL_ITEM_CACHE.forEach((item) => (UNOFFICIAL_ITEM_NAME_MAP[item.id] = item.name))

console.log('Reading official recipe cache...')
const OFFICIAL_RECIPE_CACHE = JSON.parse(fs.readFileSync('./official-recipe-cache.json', 'utf-8'))
const OFFICIAL_RECIPE_MAP = {}
OFFICIAL_RECIPE_CACHE.forEach((recipe) => (OFFICIAL_RECIPE_MAP[recipe.output_item_id] = recipe.id))

console.log('Reading decoration recipes...')
const decorationRecipes = JSON.parse(fs.readFileSync('./decorationRecipes.json', {encoding: 'utf8'}))

let recipes = []
for (const decorationRecipe of decorationRecipes) {
  if (OFFICIAL_RECIPE_MAP[recipe.id]) {
    // Ignore any recipes that already have an official crafting recipe
    continue
  }

  if (!UNOFFICIAL_ITEM_NAME_MAP[recipe.output_item_id]) {
    console.warn(`  > WARN: Ignoring decoration recipe, unsupported item id "${recipe.output_item_id}"`)
    continue
  }

  const ingredientItems = recipe.ingredients.filter((x) => x.type === 'Item')
  let ignore = false
  for (const item of ingredientItems) {
    if (!UNOFFICIAL_ITEM_NAME_MAP[item.id]) {
      console.warn(`  > WARN: Ignoring decoration recipe, unsupported ingredient item id "${item.id}"`)
      ignore = true
      break
    }
  }
  if (ignore) {
    continue
  }

  const recipe = {
    name: UNOFFICIAL_ITEM_NAME_MAP[decorationRecipe.id],
    output_item_id: decorationRecipe.output_item_id,
    output_item_count: decorationRecipe.output_item_count,
    ingredients: decorationRecipe.ingredients,
    disciplines: decorationRecipe.disciplines,
    min_rating: decorationRecipe.min_rating ? decorationRecipe.min_rating : 1 // avoid rating of 0, as it's falsy and introduces edge cases down the line...
  }

  recipe.decoration_data_hash = flocky.hash(recipe)

  recipes.push(recipe)
}
console.log(`  > Generated ${recipes.length} recipes`)

console.log('Merging generated recipes with recipes.json...')
const newDecorationRecipeHashes = recipes.map((x) => x.decoration_data_hash)
let recipesJson = JSON.parse(fs.readFileSync('./recipes.json', 'utf-8'))

recipesJson = flocky.compact(
  recipesJson.map((x) => {
    if (!x.decoration_data_hash) return x
    if (!newDecorationRecipeHashes.includes(x.decoration_data_hash)) return null // -> removes recipes not existing in the new batch

    return recipes.find((y) => y.decoration_data_hash === x.decoration_data_hash)
  })
)

const existingDecorationRecipeHashes = flocky.compact(recipesJson.map((x) => x.decoration_data_hash))
const newRecipes = recipes.filter((x) => !existingDecorationRecipeHashes.includes(x.decoration_data_hash))
recipesJson = recipesJson.concat(newRecipes)

console.log('Writing output into recipes.json...')
fs.writeFileSync('./recipes.json', flatStringify(recipesJson, null, 2), 'utf-8')

console.log('Done, next run `node src/format.js && node src/validate.js`')
