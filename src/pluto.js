'use strict';

const { pipeline, Readable, Writable } = require('stream');
const { promisify } = require('util');
const vscode = require('vscode');

const { HeaderExtractorTransform } = require('../lib/HeaderExtractorTransform');
const { Record } = require('../lib/Record');
const { RecordExtractorTransform } = require('../lib/RecordExtractorTransform');

function assembleCustomDocument(uri) {
    const promisifiedPipeline = promisify(pipeline);

    return vscode.workspace.fs.readFile(uri)
        .then(value => {
            const fileBytesSource = new Readable({
                read(size) {
                    this.push(value);
                    this.push(null);
                }
            });

            const recordCollection = [];
            const recordCollector = new Writable ({
                writev: (chunks, callback) => {
                    chunks.forEach(x => { recordCollection.push(new Record(x.chunk)); });
                    callback();
                }
            });

            const recordPipeline = promisifiedPipeline(
                fileBytesSource,
                new HeaderExtractorTransform(),
                new RecordExtractorTransform(),
                recordCollector
            ).then(() => ({
                records: recordCollection,
                uri: uri,
                dispose: () => {}
            }));

            return recordPipeline;
        });
}

function getWebviewContent(records) {
    const contentArray = [];

    contentArray.push(
        '<!DOCTYPE html>' +
        '<html lang="en">' +
            '<head>' +
                '<meta charset="UTF-8">' +
                '<title>Pluto</title>' +
                '<style>' +
                    'table { text-align: center; }' +
                '</style>' +
            '</head>' +
            '<body>' +
                '<table>' +
                    '<thead>' +
                        '<tr>' +
                            '<th scope="col">slot</th>' +
                            '<th scope="col">principal</th>' +
                            '<th scope="col">key version</th>' +
                            '<th scope="col">encoding type</th>' +
                            '<th scope="col">timestamp</th>' +
                            '<th scope="col">name</th>' +
                            '<th scope="col">flags</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>'
    );

    records.forEach((x, i) => {
        contentArray.push(
                        '<tr>' +
                            '<th scope="row">' + (i + 1) + '</th>' +
                            '<td>' + x.principal + '</td>' +
                            '<td>' + x.key_version + '</td>' +
                            '<td>' + x.enctype + '</td>' +
                            '<td>' + x.timestamp.toUTCString() + '</td>' +
                            '<td>' + x.name + '</td>' +
                            '<td>' + x.flags + '</td>' +
                        '</tr>'
        );
    });

    contentArray.push(
                    '</tbody>' +
                '</table>' +
            '</body>' +
        '</html>'
    );

    return contentArray.join('');
}

class PlutoEditorProvider {
    openCustomDocument(uri, openContext, token) {
        return assembleCustomDocument(uri);
    }

    resolveCustomEditor(document, webviewPanel, token) {
        webviewPanel.webview.html = getWebviewContent(document.records);
    }
}

function activate(context) {
    const disposable = vscode.window.registerCustomEditorProvider('pluto.keytab', new PlutoEditorProvider());
    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
