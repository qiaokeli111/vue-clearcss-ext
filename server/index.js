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
const { Files } = require('vscode-languageserver')
const { URI } = require('vscode-uri');
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
    var diagnostics = []
    unvuecss(uri.fsPath,{console:false,vueData:textDocument.getText()}).then(e => {
      if (e && Array.isArray(e)) {
          e.forEach(i=>{
              i.forEach(h=>{
                let positionData = h.positionData || [],name=h.name.trim()
                let text = textDocument.getText({
                    start: Position.create(positionData[0]-1,0),
                    end: textDocument.positionAt(textDocument.offsetAt(Position.create(positionData[0], 0)) - 1),
                })
                let startIndex = text.indexOf(name)
                const diagnostic = {
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: Position.create(positionData[0]-1,startIndex || 0),
                        end: Position.create(positionData[0]-1,startIndex ? startIndex+name.length : text.length),
                    },
                    message: `selector ${name} is not use.`,
                    source: 'vue-clearcss'
                };
                
                diagnostics.push(diagnostic)
              })
              
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
