const fs = require('fs')
const path = require('path')
const validateRecipe = require('./helpers/validateRecipe')
const checkDuplicateRecipes = require('./helpers/checkDuplicateRecipes')

function validate () {
  console.log('Reading file')
  const file = fs.readFileSync('./recipes.json', 'utf-8')

  console.log('Parsing file to JSON')
  const json = JSON.parse(file)

  console.log('Validating recipes')
  console.log()
  const errors = json
    .map((x, i) => validateRecipe(x, i + 2))
    .filter(Boolean)
  
  const duplicateRecipes = new Set()
  const duplicates = []
  for (let i = 0; i < json.length; i++) {
    if (duplicateRecipes.has(i)) continue

    for (let j = i + 1; j < json.length; j++) {
      if (checkDuplicateRecipes(json[i], json[j])) {
        duplicates.push(
          `Duplicate found: Recipe at line ${i + 2} and ${j + 2}`
        )
        duplicateRecipes.add(j)
      }
    }
  }

  const duplicateRecipesPath = path.join(
    __dirname,
    '..',
    'tmp',
    'duplicate-recipe-lines.json'
  )

  if (!fs.existsSync(path.dirname(duplicateRecipesPath))) {
    fs.mkdirSync(path.dirname(duplicateRecipesPath))
  }

  const duplicateRecipesArray = Array.from(duplicateRecipes).sort((a, b) => a - b)
  const formattedArray = duplicateRecipesArray.map(line => line + 2)

  fs.writeFileSync(
    duplicateRecipesPath,
    JSON.stringify(formattedArray, null, 2),
    'utf-8'
  )

  if (duplicates.length > 0) {
    console.log('Duplicate recipes detected:')
    duplicates.forEach(error => console.log(error))
    errors.push(...duplicates)
  }

  if (errors.length > 0) {
    console.log(`Exiting with errors in ${errors.length} recipes`)
    process.exit(1)
  } else {
    console.log('Validation passed!')
  }
}

validate()
