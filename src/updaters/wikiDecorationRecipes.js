const fs = require('fs')

const smw = require('./smw')
const queryApi = smw.queryApi
const getCurrencyForName = smw.getCurrencyForName

async function crawlDecorationRecipes() {
  console.log(`Crawling SMW for decoration recipes`)

  // [[Has context::Recipe]][[Requires discipline::Handiworker]]
  // ?Has canonical name
  // ?Has recipe id
  // ?Has item data object.Has decoration id=Has decoration id
  // ?Has output quantity
  // ?Has ingredient
  // ?Has ingredient with id
  // ?Requires rating
  // ?Has recipe source
  // ?Learned from recipe sheet
  // ?Learned from recipe sheet.Has game id=Has game id

  let recipes = await queryApi(`[[Has context::Recipe]][[Requires discipline::Handiworker]]|` +
  `?Has recipe id|?Has item data object.Has decoration id=Has decoration id|?Has output quantity|` +
  `?Has ingredient with id|?Requires rating|?Has recipe source|?Learned from recipe sheet.Has game id=Has game id`)
  if (recipes.length === 0) {
    console.error(`No decoration recipes found.`)
    return
  }

  recipes = await Promise.all(recipes.map(async (recipe) => {
    return {
      id: recipe.printouts['Has recipe id'][0],
      type: 'Homestead Decoration',
      output_decoration_id: recipe.printouts['Has decoration id'][0],
      output_item_id: recipe.printouts['Has decoration id'][0] + 2001000000000,
      output_item_count: recipe.printouts['Has output quantity'][0],
      disciplines: ['Handiworker'],
      min_rating: recipe.printouts['Requires rating'][0],
      flags: recipe.printouts['Has decoration id'][0] === 'Automatic' ? ['AutoLearned'] : ['LearnedFromItem'],
      ingredients: await Promise.all(recipe.printouts['Has ingredient with id'].map(async (ingredient) => {
        if (ingredient['Has ingredient id'].item[0]) {
          return {
            count: ingredient['Has ingredient quantity'].item[0],
            type: 'Item',
            id: ingredient['Has ingredient id'].item[0]
          }
        }
        const {currency, multiplier} = await getCurrencyForName(ingredient['Has ingredient name'].item[0].fulltext)
        return {
          count: multiplier * ingredient['Has ingredient quantity'].item[0],
          type: 'Currency',
          id: currency.id
        }
      }))
    }
  }))

  recipes = recipes.sort((a, b) => a.id - b.id)

  fs.writeFileSync('decorationRecipes.json', JSON.stringify(recipes, null, 2))
}

crawlDecorationRecipes()
