const { Files } = require('vscode-languageserver')
const { URI } = require('vscode-uri')
var path = require('path')
async function findLib (textDocument,connection) {
  let globalNpmPath = Files.resolveGlobalNodePath()
  let cwd
  const uri = URI.parse(textDocument.uri)
  const file = uri.fsPath
  const directory = path.dirname(file)
  cwd = directory
  let lib = null
  try {
    const libPath = await Files.resolve('vue-clearcss', globalNpmPath, cwd)
    lib = require(libPath)
  } catch (error) {
    connection.window.showErrorMessage(`not find vue-clearcss, please npm install`);
  }
  return lib
}
function getAbsoluteUrl(url,parseFileUrl){
    if (url.startsWith('file')) {
        return url
    }else{
        let absoluteUrl = path.resolve(parseFileUrl,'..',url)
        return URI.file(absoluteUrl).toString()
    }
}
module.exports = {
  findLib,
  getAbsoluteUrl
}
