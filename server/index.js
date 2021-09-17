var { TextDocument } = require('vscode-languageserver-textdocument')
var {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  Position,
  Range
} = require('vscode-languageserver/node')
var { findLib,getAbsoluteUrl } = require('./parse')
const { URI } = require('vscode-uri');
var path = require('path')
// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all)

// Create a simple text document manager.
let documents = new TextDocuments(TextDocument)

connection.onInitialize(params => {
  return {}
})

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
    if (change.document.languageId === 'vue') {
        validateTextDocument(change.document)
    }
})
documents.onDidSave(()=>{
    for (const document of documents.all()) {
		if (document.languageId === 'vue') {
            validateTextDocument(document)
        }
	}
})

async function validateTextDocument (textDocument) {
  var unvuecss = await findLib(textDocument, connection)
  if (unvuecss) {
    const uri = URI.parse(textDocument.uri).fsPath
    var diagnostics = [],cssFile = {}
    unvuecss(uri,{console:false,vueData:textDocument.getText()}).then(e => {
      if (e && Array.isArray(e)) {
          e.forEach(i=>{
              i.forEach(h=>{
                  try {
                    let positionData = h.positionData || {},name=h.name.trim()
                    if (positionData.from) {
                       let fileRealUrl = getAbsoluteUrl(positionData.sourceUrl,uri)
                       let fileName = path.basename(fileRealUrl)
                       
                       let m,text = textDocument.getText(),pattern=new RegExp(fileName,'gm')
                       while((m = pattern.exec(text))){
                            let importLine = textDocument.positionAt(m.index) .line
                            let lineText = textDocument.getText({
                                start: Position.create(importLine,0),
                                end:  Position.create(importLine,1000),
                            })
                            if (/@import/.test(lineText)) {
                                let startIndex = lineText.indexOf('@import')
                                let endIndex = lineText.indexOf(fileName) + fileName.length
                                if (!cssFile[positionData.sourceUrl]) {
                                    cssFile[positionData.sourceUrl] = {
                                        severity: DiagnosticSeverity.Warning,
                                        range: {
                                            start: Position.create(importLine,startIndex || 0),
                                            end: Position.create(importLine,endIndex || fileName.length),
                                        },
                                        message: `import ${fileName} exist unused selector.`,
                                        source: 'vue-clearcss'
                                    }
                                    cssFile[positionData.sourceUrl].relatedInformation = []
                                }
                                let {position} = positionData
                                cssFile[positionData.sourceUrl].relatedInformation.push({
                                    location: {
                                        uri: fileRealUrl,
                                        range: {
                                            start: Position.create(position[0]-1 , 0),
                                            end: Position.create(position[0]-1 , 0),
                                        },
                                    },
                                    message: `selector ${name.replace(positionData.from,'')} is not use .`
                                })
                                break
                            }
                       }
                    }else{
                        let {position} = positionData
                        let text = textDocument.getText({
                            start: Position.create(position[0]-1,0),
                            end: Position.create(position[0]-1,1000),
                        })
                        let startIndex = text.lastIndexOf(name)
                        const diagnostic = {
                            severity: DiagnosticSeverity.Warning,
                            message: `selector ${name} is not use.`,
                            source: 'vue-clearcss'
                        };
                        if (startIndex >= 0) {
                            diagnostic.range ={
                                start: Position.create(position[0]-1,startIndex || 0),
                                end: Position.create(position[0]-1,startIndex ? startIndex+name.length : text.length),
                            }
                        }else{
                            startIndex = text.lastIndexOf(text.trim())
                            diagnostic.range ={
                                start: Position.create(position[0]-1,startIndex > 0?startIndex : 0),
                                end: Position.create(position[0]-1,1000),
                            }
                        }
                        diagnostics.push(diagnostic)
                    }
                  } catch (error) {
                      console.log(error);
                  }
              })
              
          })
      }
      if (Object.keys(cssFile).length>0) {
        Object.keys(cssFile).forEach(e=>{
            diagnostics.push(cssFile[e])
        })
      }
      connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
    })
  }
}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection)

// Listen on the connection
connection.listen()
