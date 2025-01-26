const fs = require('fs')
const flatStringify = require('./helpers/flatStringify')

const pveGifts = [
  78866, // Gift of Prosperity
  78989, // Gift of Prowess
  78936 // Gift of Dedication
]

const pvpGifts = [
  84174, // Gift of Competitive Prosperity
  82350, // Gift of Competitive Prowess
  84203 // Gift of Competitive Dedication
]

const wvwGifts = [
  82746, // Gift of War Prosperity
  84168, // Gift of War Prowess
  83259 // Gift of War Dedication
]

let recipes = [
  // PvE - Heavy
  {legendary: `Perfected Envoy Helmet`, ascended: `Refined Envoy Helmet`, gifts: pveGifts},
  {legendary: `Perfected Envoy Pauldrons`, ascended: `Refined Envoy Pauldrons`, gifts: pveGifts},
  {legendary: `Perfected Envoy Breastplate`, ascended: `Refined Envoy Breastplate`, gifts: pveGifts},
  {legendary: `Perfected Envoy Gauntlets`, ascended: `Refined Envoy Gauntlets`, gifts: pveGifts},
  {legendary: `Perfected Envoy Tassets`, ascended: `Refined Envoy Tassets`, gifts: pveGifts},
  {legendary: `Perfected Envoy Greaves`, ascended: `Refined Envoy Greaves`, gifts: pveGifts},

  // PvE - Medium
  {legendary: `Perfected Envoy Mask`, ascended: `Refined Envoy Mask`, gifts: pveGifts},
  {legendary: `Perfected Envoy Shoulderpads`, ascended: `Refined Envoy Shoulderpads`, gifts: pveGifts},
  {legendary: `Perfected Envoy Jerkin`, ascended: `Refined Envoy Jerkin`, gifts: pveGifts},
  {legendary: `Perfected Envoy Vambraces`, ascended: `Refined Envoy Vambraces`, gifts: pveGifts},
  {legendary: `Perfected Envoy Leggings`, ascended: `Refined Envoy Leggings`, gifts: pveGifts},
  {legendary: `Perfected Envoy Boots`, ascended: `Refined Envoy Boots`, gifts: pveGifts},

  // PvE - Light
  {legendary: `Perfected Envoy Cowl`, ascended: `Refined Envoy Cowl`, gifts: pveGifts},
  {legendary: `Perfected Envoy Mantle`, ascended: `Refined Envoy Mantle`, gifts: pveGifts},
  {legendary: `Perfected Envoy Vestments`, ascended: `Refined Envoy Vestments`, gifts: pveGifts},
  {legendary: `Perfected Envoy Gloves`, ascended: `Refined Envoy Gloves`, gifts: pveGifts},
  {legendary: `Perfected Envoy Pants`, ascended: `Refined Envoy Pants`, gifts: pveGifts},
  {legendary: `Perfected Envoy Shoes`, ascended: `Refined Envoy Shoes`, gifts: pveGifts},

  // PvP A - Heavy
  {legendary: `Ardent Glorious Plate Helm`, ascended: `Ardent Glorious Plate Helm`, gifts: pvpGifts},
  {legendary: `Ardent Glorious Pauldrons`, ascended: `Ardent Glorious Pauldrons`, gifts: pvpGifts},
  {legendary: `Ardent Glorious Breastplate`, ascended: `Ardent Glorious Breastplate`, gifts: pvpGifts},
  {legendary: `Ardent Glorious Gauntlets`, ascended: `Ardent Glorious Gauntlets`, gifts: pvpGifts},
  {legendary: `Ardent Glorious Legplates`, ascended: `Ardent Glorious Legplates`, gifts: pvpGifts},
  {legendary: `Ardent Glorious Wargreaves`, ascended: `Ardent Glorious Wargreaves`, gifts: pvpGifts},

  // PvP A - Medium
  {legendary: `Ardent Glorious Cap`, ascended: `Ardent Glorious Cap`, gifts: pvpGifts},
  {legendary: `Ardent Glorious Shoulderguards`, ascended: `Ardent Glorious Shoulderguards`, gifts: pvpGifts},
  {legendary: `Ardent Glorious Brigandine`, ascended: `Ardent Glorious Brigandine`, gifts: pvpGifts},
  {legendary: `Ardent Glorious Wristplates`, ascended: `Ardent Glorious Wristplates`, gifts: pvpGifts},
  {legendary: `Ardent Glorious Legguards`, ascended: `Ardent Glorious Legguards`, gifts: pvpGifts},
  {legendary: `Ardent Glorious Shinplates`, ascended: `Ardent Glorious Shinplates`, gifts: pvpGifts},

  // PvP A - Light
  {legendary: `Ardent Glorious Crown`, ascended: `Ardent Glorious Crown`, gifts: pvpGifts},
  {legendary: `Ardent Glorious Epaulets`, ascended: `Ardent Glorious Epaulets`, gifts: pvpGifts},
  {legendary: `Ardent Glorious Raiment`, ascended: `Ardent Glorious Raiment`, gifts: pvpGifts},
  {legendary: `Ardent Glorious Armguards`, ascended: `Ardent Glorious Armguards`, gifts: pvpGifts},
  {legendary: `Ardent Glorious Leggings`, ascended: `Ardent Glorious Leggings`, gifts: pvpGifts},
  {legendary: `Ardent Glorious Footgear`, ascended: `Ardent Glorious Footgear`, gifts: pvpGifts},

  // PvP B - Heavy
  {legendary: `Glorious Hero's Plate Helm`, ascended: `Glorious Hero's Plate Helm`, gifts: pvpGifts},
  {legendary: `Glorious Hero's Pauldrons`, ascended: `Glorious Hero's Pauldrons`, gifts: pvpGifts},
  {legendary: `Glorious Hero's Breastplate`, ascended: `Glorious Hero's Breastplate`, gifts: pvpGifts},
  {legendary: `Glorious Hero's Gauntlets`, ascended: `Glorious Hero's Gauntlets`, gifts: pvpGifts},
  {legendary: `Glorious Hero's Legplates`, ascended: `Glorious Hero's Legplates`, gifts: pvpGifts},
  {legendary: `Glorious Hero's Wargreaves`, ascended: `Glorious Hero's Wargreaves`, gifts: pvpGifts},
  
  // PvP B - Medium
  {legendary: `Glorious Hero's Cap`, ascended: `Glorious Hero's Cap`, gifts: pvpGifts},
  {legendary: `Glorious Hero's Shoulderguards`, ascended: `Glorious Hero's Shoulderguards`, gifts: pvpGifts},
  {legendary: `Glorious Hero's Brigandine`, ascended: `Glorious Hero's Brigandine`, gifts: pvpGifts},
  {legendary: `Glorious Hero's Wristplates`, ascended: `Glorious Hero's Wristplates`, gifts: pvpGifts},
  {legendary: `Glorious Hero's Legguards`, ascended: `Glorious Hero's Legguards`, gifts: pvpGifts},
  {legendary: `Glorious Hero's Shinplates`, ascended: `Glorious Hero's Shinplates`, gifts: pvpGifts},
  
  // PvP B - Light
  {legendary: `Glorious Hero's Crown`, ascended: `Glorious Hero's Crown`, gifts: pvpGifts},
  {legendary: `Glorious Hero's Epaulets`, ascended: `Glorious Hero's Epaulets`, gifts: pvpGifts},
  {legendary: `Glorious Hero's Raiment`, ascended: `Glorious Hero's Raiment`, gifts: pvpGifts},
  {legendary: `Glorious Hero's Armguards`, ascended: `Glorious Hero's Armguards`, gifts: pvpGifts},
  {legendary: `Glorious Hero's Leggings`, ascended: `Glorious Hero's Leggings`, gifts: pvpGifts},
  {legendary: `Glorious Hero's Footgear`, ascended: `Glorious Hero's Footgear`, gifts: pvpGifts},

  // PvP C - Heavy
  {legendary: `Mistforged Glorious Hero's Plate Helm`, ascended: `Mistforged Glorious Hero's Plate Helm`, gifts: pvpGifts},
  {legendary: `Mistforged Glorious Hero's Pauldrons`, ascended: `Mistforged Glorious Hero's Pauldrons`, gifts: pvpGifts},
  {legendary: `Mistforged Glorious Hero's Breastplate`, ascended: `Mistforged Glorious Hero's Breastplate`, gifts: pvpGifts},
  {legendary: `Mistforged Glorious Hero's Gauntlets`, ascended: `Mistforged Glorious Hero's Gauntlets`, gifts: pvpGifts},
  {legendary: `Mistforged Glorious Hero's Legplates`, ascended: `Mistforged Glorious Hero's Legplates`, gifts: pvpGifts},
  {legendary: `Mistforged Glorious Hero's Wargreaves`, ascended: `Mistforged Glorious Hero's Wargreaves`, gifts: pvpGifts},

  // PvP C - Medium
  {legendary: `Mistforged Glorious Hero's Cap`, ascended: `Mistforged Glorious Hero's Cap`, gifts: pvpGifts},
  {legendary: `Mistforged Glorious Hero's Shoulderguards`, ascended: `Mistforged Glorious Hero's Shoulderguards`, gifts: pvpGifts},
  {legendary: `Mistforged Glorious Hero's Brigandine`, ascended: `Mistforged Glorious Hero's Brigandine`, gifts: pvpGifts},
  {legendary: `Mistforged Glorious Hero's Wristplates`, ascended: `Mistforged Glorious Hero's Wristplates`, gifts: pvpGifts},
  {legendary: `Mistforged Glorious Hero's Legguards`, ascended: `Mistforged Glorious Hero's Legguards`, gifts: pvpGifts},
  {legendary: `Mistforged Glorious Hero's Shinplates`, ascended: `Mistforged Glorious Hero's Shinplates`, gifts: pvpGifts},

  // PvP C - Light
  {legendary: `Mistforged Glorious Hero's Crown`, ascended: `Mistforged Glorious Hero's Crown`, gifts: pvpGifts},
  {legendary: `Mistforged Glorious Hero's Epaulets`, ascended: `Mistforged Glorious Hero's Epaulets`, gifts: pvpGifts},
  {legendary: `Mistforged Glorious Hero's Raiment`, ascended: `Mistforged Glorious Hero's Raiment`, gifts: pvpGifts},
  {legendary: `Mistforged Glorious Hero's Armguards`, ascended: `Mistforged Glorious Hero's Armguards`, gifts: pvpGifts},
  {legendary: `Mistforged Glorious Hero's Leggings`, ascended: `Mistforged Glorious Hero's Leggings`, gifts: pvpGifts},
  {legendary: `Mistforged Glorious Hero's Footgear`, ascended: `Mistforged Glorious Hero's Footgear`, gifts: pvpGifts},

  // WvW A - Heavy
  {legendary: `Triumphant Hero's Warhelm`, ascended: `Triumphant Hero's Warhelm`, gifts: wvwGifts},
  {legendary: `Triumphant Hero's Pauldrons`, ascended: `Triumphant Hero's Pauldrons`, gifts: wvwGifts},
  {legendary: `Triumphant Hero's Breastplate`, ascended: `Triumphant Hero's Breastplate`, gifts: wvwGifts},
  {legendary: `Triumphant Hero's Gauntlets`, ascended: `Triumphant Hero's Gauntlets`, gifts: wvwGifts},
  {legendary: `Triumphant Hero's Legplates`, ascended: `Triumphant Hero's Legplates`, gifts: wvwGifts},
  {legendary: `Triumphant Hero's Wargreaves`, ascended: `Triumphant Hero's Wargreaves`, gifts: wvwGifts},

  // WvW A - Medium
  {legendary: `Triumphant Hero's Faceguard`, ascended: `Triumphant Hero's Faceguard`, gifts: wvwGifts},
  {legendary: `Triumphant Hero's Shoulderguards`, ascended: `Triumphant Hero's Shoulderguards`, gifts: wvwGifts},
  {legendary: `Triumphant Hero's Brigandine`, ascended: `Triumphant Hero's Brigandine`, gifts: wvwGifts},
  {legendary: `Triumphant Hero's Wristplates`, ascended: `Triumphant Hero's Wristplates`, gifts: wvwGifts},
  {legendary: `Triumphant Hero's Legguards`, ascended: `Triumphant Hero's Legguards`, gifts: wvwGifts},
  {legendary: `Triumphant Hero's Shinplates`, ascended: `Triumphant Hero's Shinplates`, gifts: wvwGifts},

  // WvW A - Light
  {legendary: `Triumphant Hero's Masque`, ascended: `Triumphant Hero's Masque`, gifts: wvwGifts},
  {legendary: `Triumphant Hero's Epaulets`, ascended: `Triumphant Hero's Epaulets`, gifts: wvwGifts},
  {legendary: `Triumphant Hero's Raiment`, ascended: `Triumphant Hero's Raiment`, gifts: wvwGifts},
  {legendary: `Triumphant Hero's Armguards`, ascended: `Triumphant Hero's Armguards`, gifts: wvwGifts},
  {legendary: `Triumphant Hero's Leggings`, ascended: `Triumphant Hero's Leggings`, gifts: wvwGifts},
  {legendary: `Triumphant Hero's Footgear`, ascended: `Triumphant Hero's Footgear`, gifts: wvwGifts},

  // WvW B - Heavy
  {legendary: `Mistforged Triumphant Hero's Warhelm`, ascended: `Mistforged Triumphant Hero's Warhelm`, gifts: wvwGifts},
  {legendary: `Mistforged Triumphant Hero's Pauldrons`, ascended: `Mistforged Triumphant Hero's Pauldrons`, gifts: wvwGifts},
  {legendary: `Sublime Mistforged Triumphant Hero's Breastplate`, ascended: `Sublime Mistforged Triumphant Hero's Breastplate`, gifts: wvwGifts},
  {legendary: `Mistforged Triumphant Hero's Gauntlets`, ascended: `Mistforged Triumphant Hero's Gauntlets`, gifts: wvwGifts},
  {legendary: `Mistforged Triumphant Hero's Legplates`, ascended: `Mistforged Triumphant Hero's Legplates`, gifts: wvwGifts},
  {legendary: `Mistforged Triumphant Hero's Wargreaves`, ascended: `Mistforged Triumphant Hero's Wargreaves`, gifts: wvwGifts},

  // WvW B - Medium
  {legendary: `Mistforged Triumphant Hero's Faceguard`, ascended: `Mistforged Triumphant Hero's Faceguard`, gifts: wvwGifts},
  {legendary: `Mistforged Triumphant Hero's Shoulderguards`, ascended: `Mistforged Triumphant Hero's Shoulderguards`, gifts: wvwGifts},
  {legendary: `Sublime Mistforged Triumphant Hero's Brigandine`, ascended: `Sublime Mistforged Triumphant Hero's Brigandine`, gifts: wvwGifts},
  {legendary: `Mistforged Triumphant Hero's Wristplates`, ascended: `Mistforged Triumphant Hero's Wristplates`, gifts: wvwGifts},
  {legendary: `Mistforged Triumphant Hero's Legguards`, ascended: `Mistforged Triumphant Hero's Legguards`, gifts: wvwGifts},
  {legendary: `Mistforged Triumphant Hero's Shinplates`, ascended: `Mistforged Triumphant Hero's Shinplates`, gifts: wvwGifts},

  // WvW B - Light
  {legendary: `Mistforged Triumphant Hero's Masque`, ascended: `Mistforged Triumphant Hero's Masque`, gifts: wvwGifts},
  {legendary: `Mistforged Triumphant Hero's Epaulets`, ascended: `Mistforged Triumphant Hero's Epaulets`, gifts: wvwGifts},
  {legendary: `Sublime Mistforged Triumphant Hero's Raiment`, ascended: `Sublime Mistforged Triumphant Hero's Raiment`, gifts: wvwGifts},
  {legendary: `Mistforged Triumphant Hero's Armguards`, ascended: `Mistforged Triumphant Hero's Armguards`, gifts: wvwGifts},
  {legendary: `Mistforged Triumphant Hero's Leggings`, ascended: `Mistforged Triumphant Hero's Leggings`, gifts: wvwGifts},
  {legendary: `Mistforged Triumphant Hero's Footgear`, ascended: `Mistforged Triumphant Hero's Footgear`, gifts: wvwGifts}
]

// These IDs match the names + rarity, but are not actually the items in game zZz
const NOT_THE_RIGHT_IDS = [
  79989,
  80038
]

async function run () {
  // Grab the total names from the recipes
  const names = recipes.reduce((a, b) => a.concat([b.legendary, b.ascended]), [])

  // Read the items from the API
  let items = JSON.parse(fs.readFileSync('./item-cache.json', 'utf-8'))
  console.log('Read item cache')

  // Grab just matching ones for faster lookups
  items = items
    .filter(x => names.includes(x.name))
    .filter(x => !NOT_THE_RIGHT_IDS.includes(x.id))

  // Go through the recipes and check if ONE item exists for each lookup name
  let error = false
  recipes = recipes.map(recipe => {
    const legendaryItems = items.filter(item => item.rarity === 'Legendary' && recipe.legendary === item.name)
    const ascendedItems = items.filter(item => item.rarity === 'Ascended' && recipe.ascended === item.name)

    if (legendaryItems.length !== 1) {
      console.log(`Legendary "${recipe.legendary}" !== 1`, legendaryItems)
      error = true
    }

    if (ascendedItems.length !== 1) {
      console.log(`Ascended "${recipe.ascended}" !== 1`, ascendedItems)
      error = true
    }

    return {
      name: recipe.legendary,
      output_item_id: legendaryItems[0].id,
      output_item_count: 1,
      ingredients: [
        {count: 1, item_id: ascendedItems[0].id},
        ...recipe.gifts.map(gift => ({count: 1, item_id: gift}))
      ],
      disciplines: ['Mystic Forge']
    }
  })
  if (error) process.exit(1)
  console.log('Generated recipes')

  // Load the recipe file
  let recipeFile = JSON.parse(fs.readFileSync('./recipes.json', 'utf-8'))
  console.log('Read recipe file')

  // Remove the old recipes & add new recipes
  recipeFile = recipeFile.filter(x => !names.includes(x.name))
  recipeFile = recipeFile.concat(recipes)
  console.log('Updated recipe file')

  // Write the recipe file
  fs.writeFileSync('./recipes.json', flatStringify(recipeFile), 'utf-8')
  console.log('Wrote recipe file')
}

run()
