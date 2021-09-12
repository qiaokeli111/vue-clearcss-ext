const { Files } = require('vscode-languageserver')
const { URI } = require('vscode-uri')
var path = require('path')
async function findLib (textDocument) {
//   let globalNpmPath = Files.resolveGlobalNodePath()
//   let cwd
//   const uri = URI.parse(textDocument.uri)
//   const file = uri.fsPath
//   const directory = path.dirname(file)
//   cwd = directory
//   const libPath = await Files.resolve('vue-clearcss', globalNpmPath, cwd)

//   var lib = require(libPath)
  
  var lib = require('D:/czj/vue/vue-clearcss/index.js')
  return lib
}
module.exports = {
  findLib
}
