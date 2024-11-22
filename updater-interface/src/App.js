import React, {Component} from 'react'
import {observable} from 'mobx'
import {observer} from 'mobx-react'
import c from 'classnames'
import pick from 'lodash.pick'

const apiHostname = process.env.REACT_APP_API_HOST

@observer
class App extends Component {
  @observable apiResponse = null
  @observable itemNames = {}
  @observable currencyNames = {}
  @observable index = 0

  async componentDidMount () {
    await this.fetchItemNames()
    await this.fetchCurrencyNames()
    await this.fetchFromAPI()
  }

  async fetchItemNames () {
    try {
      this.itemNames = JSON.parse(localStorage.getItem('itemNames'))

      if (this.itemNames && this.itemNames.length > 50) {
        return
      }
    } catch (_) {
    }

    const response = await window.fetch('https://api.gw2efficiency.com/items?ids=all')
    const items = await response.json()

    let map = {}
    items.forEach(item => {
      map[item.id] = item.name
    })

    this.itemNames = map
    localStorage.setItem('itemNames', JSON.stringify(map))
  }

  async fetchCurrencyNames () {
    const response = await window.fetch('https://api.guildwars2.com/v2/currencies?ids=all&lang=en')
    const currencies = await response.json()

    let map = {}
    currencies.forEach(currency => {
      map[currency.id] = currency.name
    })

    this.currencyNames = map
  }

  async fetchFromAPI () {
    const response = await window.fetch(`http://${apiHostname}:3001/api/${this.index}`)
    this.apiResponse = await response.json()
  }

  async previous () {
    this.index--
    this.fetchFromAPI()
  }

  async next () {
    this.index++
    this.fetchFromAPI()
  }

  async dismiss () {
    const body = {action: 'dismiss'}

    await window.fetch(`http://${apiHostname}:3001/api/${this.index}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.fetchFromAPI()
  }

  async add () {
    const body = {action: 'add'}

    await window.fetch(`http://${apiHostname}:3001/api/${this.index}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.fetchFromAPI()
  }

  async overwrite (existingIndex) {
    const body = {action: 'overwrite', existingIndex}

    await window.fetch(`http://${apiHostname}:3001/api/${this.index}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.fetchFromAPI()
  }

  render () {
    if (!this.apiResponse || !this.itemNames) {
      return null
    }

    return (
      <div>
        {/* Top navigation bar */}
        <div className="p-2 bg-light">
          <div className="container d-flex align-items-center">
            <button
              className='btn btn-primary mr-2'
              onClick={() => this.previous()}
              disabled={this.index === 0}
            >
              Previous
            </button>

            <button
              className='btn btn-primary'
              onClick={() => this.next()}
              disabled={this.index === this.apiResponse.total - 1}
            >
              Next
            </button>

            <div className='ml-auto'>
              Reviewing <strong>{this.index + 1}</strong> of <strong>{this.apiResponse.total}</strong> differences
            </div>
          </div>
        </div>

        <div className="container mt-4 d-flex">
          {/* New Recipe */}
          <div className="w-50 mr-4">
            <h3>New</h3>

            <RecipeCard
              recipe={this.apiResponse.updater}
              itemNames={this.itemNames}
              currencyNames={this.currencyNames}
              mode='new'
              dismiss={() => this.dismiss()}
              add={() => this.add()}
            />
          </div>

          {/* Existing recipes */}
          <div className="w-50">
            <h3>Existing</h3>

            {this.apiResponse.existing.map(existing =>
              <RecipeCard
                key={existing.index}
                recipe={existing}
                diffRecipe={this.apiResponse.updater}
                itemNames={this.itemNames}
                currencyNames={this.currencyNames}
                mode='existing'
                overwrite={(x) => this.overwrite(x)}
              />
            )}
          </div>
        </div>
      </div>
    )
  }
}

class RecipeCard extends Component {
  render () {
    const recipe = this.props.recipe
    const diffRecipe = this.props.diffRecipe
    const itemNames = this.props.itemNames
    const currencyNames = this.props.currencyNames
    const mode = this.props.mode
    const isInvalid = recipe.ingredients.find(x => !x.id) || !recipe.output_item_id
    const isRecursive = !!recipe.ingredients.find(x => x.id === recipe.output_item_id)

    let countIsDifferent = false
    let itemIsDifferent = false
    let itemNameIsDifferent = false
    let isOutputDifferent = false
    let isInputDifferent = false
    let isDisciplineDifferent = false
    let isMetaDifferent = false

    if (diffRecipe) {
      countIsDifferent = diffRecipe.output_item_count !== recipe.output_item_count
      itemIsDifferent = diffRecipe.output_item_id !== recipe.output_item_id
      itemNameIsDifferent = diffRecipe.name !== recipe.name

      const outputKeys = ['name', 'output_item_id', 'output_item_count']
      isOutputDifferent = JSON.stringify(pick(diffRecipe, outputKeys)) !== JSON.stringify(pick(recipe, outputKeys))

      const inputKeys = ['ingredients']
      isInputDifferent = JSON.stringify(pick(diffRecipe, inputKeys)) !== JSON.stringify(pick(recipe, inputKeys))

      const disciplineKeys = ['disciplines', 'min_rating']
      isDisciplineDifferent = JSON.stringify(pick(diffRecipe, disciplineKeys)) !== JSON.stringify(pick(recipe, disciplineKeys))

      const metaKeys = ['id', 'achievement_id']
      isMetaDifferent = JSON.stringify(pick(diffRecipe, metaKeys)) !== JSON.stringify(pick(recipe, metaKeys))
    }

    return (
      <div className='card mb-3'>
        <div className="card-body">
          {/* Output Count & Name */}
          <div className='d-flex mb-2'>
            <strong
              className={c([
                'mr-2',
                {'text-danger': countIsDifferent}
              ])}
            >
              {recipe.output_item_count}
            </strong>

            <span
              className={c([
                'mr-1',
                {'text-danger': itemIsDifferent || itemNameIsDifferent}
              ])}
            >
              {recipe.name}
            </span>

            <span className='text-muted'>({recipe.output_item_id})</span>

            {recipe.id && <span className='ml-auto'>({recipe.id})</span>}
          </div>

          {/* Ingredients */}
          {recipe.ingredients.map((ingredient, index) => {
            let countIsDifferent = false
            let itemIsDifferent = false

            if (diffRecipe) {
              countIsDifferent = !diffRecipe.ingredients[index] ||
                diffRecipe.ingredients[index].count !== ingredient.count
              itemIsDifferent = !diffRecipe.ingredients[index] ||
                diffRecipe.ingredients[index].id !== ingredient.id
            }

            return (
              <div key={index} className='d-flex'>
                <strong
                  className={c([
                    'mr-2',
                    {'text-danger': countIsDifferent}
                  ])}
                >
                  {ingredient.count}
                </strong>

                <span
                  className={c([
                    'mr-1',
                    {'text-danger': itemIsDifferent}
                  ])}
                >
                  {ingredient.type === 'Item' ? itemNames[ingredient.id] : currencyNames[ingredient.id]}
                </span>

                <span className='text-muted'>({ingredient.type}, {ingredient.id})</span>
              </div>
            )
          })}

          {/* Disciplines & Rating */}
          <div className="mt-2">
            {recipe.disciplines.join(', ')}
            {' '}
            {recipe.min_rating && <span>(Min {recipe.min_rating})</span>}
            {' '}
            {recipe.achievement_id && <span>(AID {recipe.achievement_id})</span>}
          </div>
        </div>

        {/* Review helpers */}
        {(diffRecipe || isInvalid || isRecursive) && (
          <div className="card-footer">
            {/* Differences */}
            <table className="table table-sm">
              <thead>
              <tr>
                <th style={{borderTop: 0}}>Output</th>
                <th style={{borderTop: 0}}>Ingredients</th>
                <th style={{borderTop: 0}}>Discipline</th>
                <th style={{borderTop: 0}}>Metadata</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>
                  {isOutputDifferent
                    ? <span className='text-danger'>DIFFERENT</span>
                    : <span className='text-success'>MATCH</span>
                  }
                </td>
                <td>
                  {isInputDifferent
                    ? <span className='text-danger'>DIFFERENT</span>
                    : <span className='text-success'>MATCH</span>
                  }
                </td>
                <td>
                  {isDisciplineDifferent
                    ? <span className='text-danger'>DIFFERENT</span>
                    : <span className='text-success'>MATCH</span>
                  }
                </td>
                <td>
                  {isMetaDifferent
                    ? <span className='text-danger'>DIFFERENT</span>
                    : <span className='text-success'>MATCH</span>
                  }
                </td>
              </tr>
              </tbody>
            </table>

            {/* Invalid warning */}
            {isInvalid && (
              <div className='alert alert-danger' style={{padding: '5px 15px', marginTop: 15, marginBottom: 0}}>
                🛑 This recipe is invalid
              </div>
            )}

            {/* Recursive warning */}
            {isRecursive && (
              <div className='alert alert-warning' style={{padding: '5px 15px', marginTop: 15, marginBottom: 0}}>
                ⚠ This recipe is recursive
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="card-footer d-flex">
          {mode === 'new' && (
            <button
              className='btn btn-success btn-sm mr-2'
              onClick={() => this.props.add()}
              disabled={isInvalid}
            >
              Accept new
            </button>
          )}

          {mode === 'new' && (
            <a
              href={`https://wiki.guildwars2.com/index.php?title=Special%3ASearch&search=${window.encodeURIComponent(recipe.name)}`}
              target='_blank'
              className='btn btn-sm mr-2'
            >
              Open on Wiki
            </a>
          )}

          {mode === 'new' && (
            <button
              className='btn btn-danger btn-sm ml-auto'
              onClick={() => this.props.dismiss()}
            >
              Ignore
            </button>
          )}

          {mode === 'existing' && (
            <button
              className='btn btn-warning btn-sm'
              onClick={() => this.props.overwrite(recipe.index)}
            >
              Overwrite
            </button>
          )}

          {mode === 'existing' && (
            <div className='text-muted ml-auto'>
              L{recipe.index + 2}
            </div>
          )}
        </div>
      </div>
    )
  }
}

export default App
