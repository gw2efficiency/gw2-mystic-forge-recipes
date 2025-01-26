function flatStringify (data) {
  return '[\n' + data.map(x => '  ' + JSON.stringify(x)).join(',\n') + '\n]\n'
}

module.exports = flatStringify
