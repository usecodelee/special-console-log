// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const insertLog = vscode.commands.registerCommand('extension.insertLog', () => {
		const editor = vscode.window.activeTextEditor
		if (!editor) { return }

		const selection = editor.selection
		const text = editor.document.getText(selection)
		const userConfig = getUserConfig()['special-console'].log
		let fontSize = 16
		let startFont = "PRINT"
		if (userConfig) {
			fontSize = userConfig.fontSize || fontSize
			startFont = userConfig.startFont || startFont
		}
		let logToInsert = ''
		let str = ''
		if (text) {
			str = `${text}`.replace(/\'|\"/g, '')
			logToInsert = `console.log('%c ${startFont}: ${str} ', 'color: #fff; background: ${bgc()}; font-size: ${fontSize}px;', ${text})`
		} else {
			logToInsert = `console.log('%c ${startFont}: ${str} ', 'color: #fff; background: ${bgc()}; font-size: ${fontSize}px;', variable)`
		}
		vscode.commands.executeCommand('editor.action.insertLineAfter')
			.then(() => {
				insertText(logToInsert, !text)
			})
	})
	context.subscriptions.push(insertLog)

	const deleteLogs = vscode.commands.registerCommand('extension.deleteLogs', () => {
		const editor = vscode.window.activeTextEditor
		if (!editor) { return }

		const document = editor.document
		const documentText = editor.document.getText()

		let workspaceEdit = new vscode.WorkspaceEdit()

		const logStatements = getAllLogs(document, documentText)

		deleteFoundLogs(workspaceEdit, document.uri, logStatements)
	})
	context.subscriptions.push(deleteLogs)
}
function getUserConfig() {
	return vscode.workspace.getConfiguration()
}
const insertText = (val: string, cursorMove: boolean) => {
	const editor = vscode.window.activeTextEditor

	if (!editor) {
		vscode.window.showErrorMessage('Can\'t insert log because no document is open')
		return
	}

	const selection = editor.selection

	const range = new vscode.Range(selection.start, selection.end)

	editor.edit((editBuilder) => {
		editBuilder.replace(range, val)
	}).then(() => {
		let postion = editor.selection.end
		editor.selection = new vscode.Selection(postion, postion)
		if (cursorMove) {
			vscode.commands.executeCommand('cursorMove', { to: 'left', by: 'character', value: 1, select: false }).then(() => {
				vscode.commands.executeCommand('cursorMove', { to: 'left', by: 'character', value: 8, select: true })
			})
		}
	})
}
function getAllLogs(document: any, documentText: string) {
	let logStatements = []
	const userConfig = getUserConfig()['special-console'].log
	let logRegex = /console.log\('%c(.*color.*background.*)\);?/g
	if (userConfig && userConfig.deleteAll) {
		logRegex = /console.log\('%c(.*)\);?/g
	}
	let match
	while (match = logRegex.exec(documentText)) {
		let matchRange =
			new vscode.Range(
				document.positionAt(match.index),
				document.positionAt(match.index + match[0].length)
			)
		if (!matchRange.isEmpty)
			logStatements.push(matchRange)
	}
	return logStatements
}
function deleteFoundLogs(workspaceEdit: any, docUri: any, logs: any) {
	logs.forEach((log: any) => {
		workspaceEdit.delete(docUri, log)
	})

	vscode.workspace.applyEdit(workspaceEdit).then(() => {
		vscode.window.showInformationMessage(`${logs.length} console.log deleted`)
	})
}
function bgc() {
	const colors = ['rgb(205, 179, 128)', 'rgb(3, 101, 100)', 'rgb(3, 22, 52)', 'rgb(237, 222, 139)', 'rgb(251, 178, 23)', 'rgb(96, 143, 159)', 'rgb(1, 77, 103)', 'rgb(254, 67, 101)', 'rgb(252, 157, 154)', 'rgb(131, 175, 155)', 'rgb(229, 187, 129)', 'rgb(161, 23, 21)', 'rgb(34, 8, 7)', 'rgb(118, 77, 57)', 'rgb(17, 63, 61)', 'rgb(60, 79, 57)', 'rgb(95, 92, 51)', 'rgb(179, 214, 110)', 'rgb(248, 214, 110)', 'rgb(248, 147, 29)', 'rgb(227, 160, 93)', 'rgb(178, 190, 126)', 'rgb(56, 13, 49)', 'rgb(89, 61, 67)', 'rgb(3, 38, 58)', 'rgb(222, 125, 44)', 'rgb(20, 68, 106)', 'rgb(130, 57, 53)', 'rgb(23, 44, 60)', 'rgb(39, 72, 98)', 'rgb(153, 80, 84)', 'rgb(217, 104, 49)', 'rgb(38, 157, 128)', 'rgb(114, 83, 52)']
	return colors[Math.floor(Math.random() * (colors.length))]
}
// this method is called when your extension is deactivated
export function deactivate() { }
