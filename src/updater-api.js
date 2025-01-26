const fs = require('fs')
const express = require('express')
const cors = require('cors')
const hashRecipe = require('./helpers/hashRecipe')
const flatStringify = require('./helpers/flatStringify')
const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/:index', (req, res) => {
  const index = req.params.index
  const existing = JSON.parse(fs.readFileSync('./recipes.json', 'utf-8'))
  const updater = JSON.parse(fs.readFileSync('./tmp/differences.json', 'utf-8'))

  res.send({
    updater: updater[index],
    existing: existing
      .map((x, i) => Object.assign(x, {index: i}))
      .filter(x => x.output_item_id === updater[index].output_item_id)
      .slice(0, 25),
    total: updater.length
  })
})

app.post('/api/:index', (req, res) => {
  const body = req.body
  const index = req.params.index
  let existing = JSON.parse(fs.readFileSync('./recipes.json', 'utf-8'))
  let updater = JSON.parse(fs.readFileSync('./tmp/differences.json', 'utf-8'))
  let ignored = JSON.parse(fs.readFileSync('./ignored.json', 'utf-8'))

  if (body.action === 'dismiss') {
    const recipe = updater.splice(index, 1)[0]
    fs.writeFileSync('./tmp/differences.json', JSON.stringify(updater, null, 2), 'utf-8')

    ignored.push(hashRecipe(recipe))
    fs.writeFileSync('./ignored.json', JSON.stringify(ignored, null, 2), 'utf-8')

    return res.send('ok')
  }

  if (body.action === 'add') {
    const recipe = updater.splice(index, 1)[0]
    fs.writeFileSync('./tmp/differences.json', JSON.stringify(updater, null, 2), 'utf-8')

    existing.push(recipe)
    fs.writeFileSync('./recipes.json', flatStringify(existing), 'utf-8')

    return res.send('ok')
  }

  if (body.action === 'overwrite') {
    const recipe = updater.splice(index, 1)[0]
    fs.writeFileSync('./tmp/differences.json', JSON.stringify(updater, null, 2), 'utf-8')

    existing = existing.map((x, i) => {
      if (i !== body.existingIndex) {
        return x
      }

      return recipe
    })
    fs.writeFileSync('./recipes.json', flatStringify(existing), 'utf-8')

    return res.send('ok')
  }
})

app.listen(3001, () => console.log('Listening on port 3001'))
