'use strict';

const stream = require('stream');
const util = require('util');
const vscode = require('vscode');

const HeaderExtractorTransform = require('../lib/HeaderExtractorTransform');
const Record = require('../lib/Record');
const RecordExtractorTransform = require('../lib/RecordExtractorTransform');

function assembleCustomDocument(uri) {
    const pipeline = util.promisify(stream.pipeline);

    return vscode.workspace.fs.readFile(uri)
        .then(value => {
            const fileBytesSource = new stream.Readable({
                read(size) {
                    this.push(value);
                    this.push(null);
                }
            });

            const recordCollection = [];
            const recordCollector = new stream.Writable ({
                writev: (chunks, callback) => {
                    chunks.forEach(x => { recordCollection.push(new Record(x.chunk)); });
                    callback();
                }
            });

            const recordPipeline = pipeline(
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

class PlutoEditorProvider {
    openCustomDocument(uri, openContext, token) {
        return assembleCustomDocument(uri);
    }

    resolveCustomEditor(document, webviewPanel, token) {
        const content = document.records.map(x => x.toString()).join('<br/>');
        webviewPanel.webview.html = content;
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
