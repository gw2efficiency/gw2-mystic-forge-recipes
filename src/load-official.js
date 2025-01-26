const fs = require('fs')

console.log('Reading official recipe cache...')
const OFFICIAL_RECIPE_CACHE = JSON.parse(fs.readFileSync('./official-recipe-cache.json', 'utf-8'))
const OFFICIAL_RECIPE_MAP = {}
OFFICIAL_RECIPE_CACHE.forEach((recipe) => {
  OFFICIAL_RECIPE_MAP[recipe.output_item_id] = (OFFICIAL_RECIPE_MAP[recipe.output_item_id] || []).concat(recipe.id)
})

console.log('Reading recipes file...')
const file = fs.readFileSync('./recipes.json', 'utf-8')
let recipes = JSON.parse(file)

console.log('Trying to resolve output ids to recipe ids on official API...')
let results = []

recipes.forEach((recipe) => {
  if ([92687].includes(recipe.output_item_id)) {
    return
  }

  const recipeIds = OFFICIAL_RECIPE_MAP[recipe.output_item_id]

  const ingredientIds = recipe.ingredients.map(x => x.id)
  const isMFUpgradeRecipe = ingredientIds.includes(recipe.output_item_id)

  const isAchievement = recipe.disciplines.includes('Achievement')

  if (recipeIds && !isMFUpgradeRecipe && !isAchievement) {
    results.push(`${recipe.name} (${recipe.output_item_id}) => ${recipeIds.join(', ')}`)
  }
})

results = results.filter((x, i, self) => self.indexOf(x) === i)

fs.writeFileSync('./official-id-overwrite.txt', results.join('\n') + '\n', 'utf-8')
console.log('Written to ./official-id-overwrite.txt')
