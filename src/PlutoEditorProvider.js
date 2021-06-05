'use strict';

const { PlutoDocument } = require('./PlutoDocument');

const vscode = require('vscode');

class PlutoEditorProvider {
  getWebviewContent(records) {
    const contentArray = [];

    contentArray.push(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Pluto</title>
          <style>
            table {
              text-align: center;
              width: 100%;
            }
          </style>
        </head>
        <body>
          <p>
            There ${(records.length === 1) ? 'is 1 record' : ('are ' + records.length + ' records')}
            in this kerberos keytab file.
          </p>
          <table>
            <thead>
              <tr>
                <th scope="col">slot</th>
                <th scope="col">principal</th>
                <th scope="col">key version</th>
                <th scope="col">encoding type</th>
                <th scope="col">timestamp</th>
                <th scope="col">name</th>
                <th scope="col">flags</th>
              </tr>
            </thead>
            <tbody>
    `);

    records.forEach((x, i) => {
      contentArray.push(`
              <tr>
                <th scope="row">${i + 1}</th>
                <td>${x.principal}</td>
                <td>${x.key_version}</td>
                <td>${x.enctype}</td>
                <td>${x.timestamp.toUTCString()}</td>
                <td>${x.name}</td>
                <td>${x.flags}</td>
              </tr>
      `);
    });

    contentArray.push(`
            </tbody>
          </table>
        </body>
      </html>
    `);

    return contentArray.join('');
  }

  openCustomDocument(uri, openContext, token) {
    return PlutoDocument.assemble(
      uri,
      vscode.workspace.fs.readFile(uri)
    );
  }

  resolveCustomEditor(document, webviewPanel, token) {
    webviewPanel.webview.html = this.getWebviewContent(document.records);
  }
}

module.exports.PlutoEditorProvider = PlutoEditorProvider;
