'use strict';

const { PlutoEditorProvider } = require('./PlutoEditorProvider');
const vscode = require('vscode');

function activate(context) {
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      'pluto.keytab',
      new PlutoEditorProvider()
    )
  );
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
};
