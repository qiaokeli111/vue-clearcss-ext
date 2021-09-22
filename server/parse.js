const { Files } = require('vscode-languageserver')
const { URI } = require('vscode-uri')
var path = require('path')
var libPosition = new Map()
var fileUrlPostion = new Map()
async function findLib (textDocument,connection) {
    
  let globalNpmPath = Files.resolveGlobalNodePath()
  const uri = URI.parse(textDocument.uri)
  const file = uri.fsPath
  const directory = path.dirname(file)
  let projectUrl = getProjectUrl(directory)
  if (!libPosition.has(projectUrl)) {
    let cwd = directory
    try {
      const libPath = await Files.resolve('vue-clearcss', globalNpmPath, cwd)
      libPosition.set(projectUrl,libPath)
    } catch (error) {
      connection.window.showErrorMessage(`not find vue-clearcss, please npm install`);
    }
  }
 
  return require(libPosition.get(projectUrl))
}
function getAbsoluteUrl(url,parseFileUrl){
    if (url.startsWith('file')) {
        return url
    }else{
        let absoluteUrl = path.resolve(parseFileUrl,'..',url)
        return URI.file(absoluteUrl).toString()
    }
}



function getProjectUrl(directory){
    if (!fileUrlPostion.has(directory)) {
        const pkgDir = require('pkg-dir');
        let rootDir = pkgDir.sync(directory)
        fileUrlPostion.set(directory,rootDir)
    }
    return fileUrlPostion.get(directory)
}
module.exports = {
  findLib,
  getAbsoluteUrl
}
