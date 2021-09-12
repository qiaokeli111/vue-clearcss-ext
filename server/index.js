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
  InitializeResult
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
  var unvuecss = await findLib(textDocument)
  const uri = URI.parse(textDocument.uri)
  unvuecss(uri.fsPath).then(e => {
    console.log(e, 22)
  })
}

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection)

// Listen on the connection
connection.listen()
