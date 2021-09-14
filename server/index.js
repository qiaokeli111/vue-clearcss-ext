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
var { findLib } = require('./parse')
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

async function validateTextDocument (textDocument) {
  var unvuecss = await findLib(textDocument, connection)
  if (unvuecss) {
    const uri = URI.parse(textDocument.uri)
    var diagnostics = [],cssFile = {}
    unvuecss(uri.fsPath,{console:false,vueData:textDocument.getText()}).then(e => {
      if (e && Array.isArray(e)) {
          e.forEach(i=>{
              i.forEach(h=>{
                  try {
                    let positionData = h.positionData || {},name=h.name.trim()
                    if (positionData.from) {
                       let fileName = path.basename(positionData.sourceUrl)
                       
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
                                        uri: positionData.sourceUrl,
                                        range: {
                                            start: Position.create(position[0]-1 , 0),
                                            end: Position.create(position[0]-1 , 0),
                                        },
                                    },
                                    message: `selector ${name.replace(positionData.from,'')} is not use in line ${position[0]}.`
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
                        let startIndex = text.indexOf(name)
                        if (startIndex) {
                            const diagnostic = {
                                severity: DiagnosticSeverity.Warning,
                                range: {
                                    start: Position.create(position[0]-1,startIndex || 0),
                                    end: Position.create(position[0]-1,startIndex ? startIndex+name.length : text.length),
                                },
                                message: `selector ${name} is not use.`,
                                source: 'vue-clearcss'
                            };
                            diagnostics.push(diagnostic)
                        }
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
