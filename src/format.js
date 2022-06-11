const fs = require('fs')
const fetch = require('node-fetch')
const overwrites = require('./helpers/getOverwrites')

async function main () {
  console.log('Reading file')
  const file = fs.readFileSync('./recipes.json', 'utf-8')

  console.log('Parsing file to JSON')
  let json = JSON.parse(file)

  console.log('Formatting recipes')
  json = await Promise.all(json.map(formatRecipe))
  json = json.filter(Boolean)

  console.log('Writing to file')
  const jsonString = '[\n' + json.map(x => '  ' + JSON.stringify(x)).join(',\n') + '\n]\n'
  fs.writeFileSync('./recipes.json', jsonString, 'utf-8')
}

main()

async function formatRecipe (recipe) {
  let result = {}

  const id = parseInt(recipe.id, 10)
  if (id > 0) {
    result.id = id
  }

  result.name = recipe.name
  result.output_item_id = recipe.output_item_id

  if (typeof overwrites[result.output_item_id] !== 'undefined') {
    result.id = overwrites[result.output_item_id]
  }

  if (result.output_item_id < 0) {
    return false
  }

  result.output_item_count = recipe.output_item_count
  result.ingredients = recipe.ingredients.map(formatIngredient).filter(Boolean)

  if (result.ingredients.length === 0) {
    return false
  }

  result.disciplines = recipe.disciplines

  if (result.id) {
    const apiRecipe = await getRecipe(result.id)

    result.disciplines = apiRecipe.disciplines
    result.min_rating = apiRecipe.min_rating
  }

  if (recipe.min_rating) {
    result.min_rating = recipe.min_rating
  }

  if (recipe.achievement_id) {
    result.achievement_id = recipe.achievement_id
  }

  if (recipe.merchant) {
    result.merchant = recipe.merchant
  }

  if (recipe.merchant_data_hash) {
    result.merchant_data_hash = recipe.merchant_data_hash
  }

  return result
}

function formatIngredient (ingredient) {
  if (ingredient.id < 0) {
    return false
  }

  let result = {}
  result.count = ingredient.count
  result.type = ingredient.type
  result.id = ingredient.id

  return result
}

async function getRecipe (id) {
  const url = `https://api.guildwars2.com/v2/recipes/${id}`
  return await fetch(url).then(x => x.json())
}
