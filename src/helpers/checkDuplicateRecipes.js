function areRecipesDuplicate(firstRecipe, secondRecipe) {
  if (firstRecipe.output_item_id !== secondRecipe.output_item_id) {
    return false
  }

  if (firstRecipe.output_item_count !== secondRecipe.output_item_count) {
    return false
  }
    
  const normalizeDisciplines = disciplines => disciplines.slice().sort()
    if (
      JSON.stringify(normalizeDisciplines(firstRecipe.disciplines)) !==
      JSON.stringify(normalizeDisciplines(secondRecipe.disciplines))
    ) {
      return false
    }

  const normalizeIngredients = ingredients =>
    ingredients.slice().sort((a, b) => {
      if (a.id !== b.id) return a.id - b.id
      if (a.count !== b.count) return a.count - b.count
      return a.type.localeCompare(b.type)
    })

  const firstRecipeIngredients = normalizeIngredients(
    firstRecipe.ingredients || []
  )
  const secondRecipeIngredients = normalizeIngredients(
    secondRecipe.ingredients || []
  )

  if (firstRecipeIngredients.length !== secondRecipeIngredients.length) {
    return false
  }

  if (
    !firstRecipeIngredients.every(
      (ingredient, index) =>
        ingredient.id === secondRecipeIngredients[index].id &&
        ingredient.count === secondRecipeIngredients[index].count &&
        ingredient.type === secondRecipeIngredients[index].type
    )
  ) {
    return false
  }

  const firstMerchant = firstRecipe.merchant || {}
  const secondMerchant = secondRecipe.merchant || {}

  if (
    firstMerchant.name !== secondMerchant.name ||
    !firstMerchant.locations ||
    !secondMerchant.locations ||
    !firstMerchant.locations.some(location =>
      secondMerchant.locations.includes(location)
    )
  ) {
    return false
  }

  return true
}

module.exports = areRecipesDuplicate
