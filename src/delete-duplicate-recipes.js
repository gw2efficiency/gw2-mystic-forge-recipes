const fs = require('fs')
const path = require('path')

const recipesPath = path.join(__dirname, '..', 'recipes.json')
const duplicateRecipesPath = path.join(
  __dirname,
  '..',
  'tmp',
  'duplicate-recipe-lines.json'
)

function removeDuplicates() {
  if (!fs.existsSync(duplicateRecipesPath)) {
    console.log('No duplicate recipes file found, Exiting.')
    return
  }

  const linesToRemove = JSON.parse(
    fs.readFileSync(duplicateRecipesPath, 'utf-8')
  )

  const recipes = fs.readFileSync(recipesPath, 'utf-8').split('\n')

  const sortedDuplicates = [...new Set(linesToRemove.map(Number))].sort(
    (a, b) => b - a
  )

  sortedDuplicates.forEach(line => {
    if (line >= 1 && line <= recipes.length) {
      recipes.splice(line - 1, 1)
    }
  })

  fs.writeFileSync(recipesPath, recipes.join('\n'), 'utf-8')
  console.log('Duplicate recipes removed successfully.')
}

removeDuplicates()
