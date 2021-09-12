/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

var path = require('path')
var { workspace } = require('vscode')
var { LanguageClient, TransportKind } = require('vscode-languageclient/node')
let client

function activate (context) {
    console.log(process.versions,66);
  // The server is implemented in node
  const serverModule = context.asAbsolutePath('server/index.js')
  // The debug options for the server
  // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] }

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions
    }
  }

  // Options to control the language client
  const clientOptions = {
    // Register the server for plain text documents
    documentSelector: [{ scheme: 'file', language: 'plaintext' },{ scheme: 'file' }, { scheme: 'untitled' }],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
    }
  }

  // Create the language client and start the client.
  client = new LanguageClient('unvuecss','Language Server Example', serverOptions, clientOptions)

  // Start the client. This will also launch the server
  client.start()
}

function deactivate () {
  if (!client) {
    return undefined
  }
  return client.stop()
}

module.exports = {
    activate,
    deactivate
}