'use strict';

import * as vscode from 'vscode';
import { checkExtension, generateTimestamp } from '../helper/common';
import { output } from '../helper/output';
import { insertAlert } from './alert-controller';
import { formatBold } from './bold-controller';
import { applyCleanup } from './cleanup/cleanup-controller';
import { formatCode } from './code-controller';
import { pickImageType } from './image-controller';
import { insertInclude } from './include-controller';
import { formatItalic } from './italic-controller';
import { pickLinkType } from './link-controller';
import { insertBulletedList, insertNumberedList } from './list-controller';
import { insertLink, insertVideo } from './media-controller';
import { insertMoniker } from './moniker-controller';
import { noLocText } from './no-loc-controller';
import { previewTopic, seoPreview } from './preview-controller';
import { insertRowsAndColumns } from './row-columns-controller';
import { insertSnippet } from './snippet/snippet-controller';
import { insertTable } from './table-controller';
import { applyTemplate } from './template-controller';
import { applyXref } from './xref/xref-controller';
import {
	insertExpandableParentNode,
	insertTocEntry,
	insertTocEntryWithOptions
} from './yaml/yaml-controller';
import { ExtensionContext } from 'vscode';
import { Command } from '../Command';
import { insertNotebook } from './notebook-controller';

export const quickPickMenuCommand: Command[] = [
	{ command: markdownQuickPick.name, callback: markdownQuickPick }
];
export function markdownQuickPick(context: ExtensionContext) {
	const opts: vscode.QuickPickOptions = { placeHolder: 'Which command would you like to run?' };
	const markdownItems: vscode.QuickPickItem[] = [];
	const yamlItems: vscode.QuickPickItem[] = [];
	let items: vscode.QuickPickItem[] = [];
	const activeTextDocument = vscode.window.activeTextEditor;

	if (checkExtension('docsmsft.docs-preview')) {
		markdownItems.push({
			description: 'View preview',
			label: '$(browser) Preview'
		});
		markdownItems.push({
			description: 'View search results preview',
			label: '$(search) Search Results Preview'
		});
	}

	markdownItems.push(
		{
			description: 'Bold selected text',
			label: '$(pencil) Bold'
		},
		{
			description: 'Italicize selected text',
			label: '$(info) Italic'
		},
		{
			description: 'Mark selected text as code block',
			label: '$(code) Code'
		},
		{
			description: 'Insert a Jupyter notebook from GitHub',
			label: '$(book) Jupyter Notebook'
		},
		{
			description: 'Insert note, tip, important, caution, or warning',
			label: '$(alert) Alert'
		},
		{
			description: 'Insert a numbered list',
			label: '$(list-ordered) Numbered list'
		},
		{
			description: 'Insert a bulleted list',
			label: '$(list-unordered) Bulleted list'
		},
		{
			description: 'Insert markdown table',
			label: '$(diff-added) Table'
		},
		{
			description: 'Insert columns',
			label: '$(ellipsis) Columns'
		},
		{
			description: 'Insert link',
			label: '$(link) Link'
		},
		{
			description: 'Indicate selected text as non-localizable',
			label: '$(lock) Non-localizable text'
		},
		{
			description: 'Insert image',
			label: '$(file-media) Image'
		},
		{
			description: 'Insert include file',
			label: '$(clippy) Include'
		},
		{
			description: 'Insert code snippet',
			label: '$(file-code) Snippet'
		},
		{
			description: 'Insert video',
			label: '$(device-camera-video) Video'
		},
		{
			description: 'Perform cleanup',
			label: '$(tasklist) Cleanup...'
		},
		{
			description: 'Insert moniker',
			label: '$(project) Moniker'
		}
	);

	// push commands marked for preview (beta)
	// add description and label to this section for preview features. Example below:
	// {
	//    description: "Beta preview",
	//    label: "$(tasklist) Cleanup...",
	// }
	const config = vscode.workspace.getConfiguration('markdown');
	const previewFeatures = config.get<boolean>('previewFeatures');
	if (previewFeatures === true) {
		output.appendLine('Preview features will be enabled.');
	}

	if (checkExtension('docsmsft.docs-article-templates')) {
		markdownItems.push({
			description: '',
			label: '$(diff) Template'
		});
	}

	yamlItems.push(
		{
			description: '',
			label: '$(note) TOC entry'
		},
		{
			description: '',
			label: '$(note) TOC entry with optional attributes'
		},
		{
			description: '',
			label: '$(note) Parent node'
		},
		{
			description: '',
			label: '$(link) Insert link'
		},
		{
			description: '',
			label: '$(lock) Non-localizable text'
		}
	);

	if (activeTextDocument) {
		const activeDocumentLanguage = activeTextDocument.document.languageId;
		switch (activeDocumentLanguage) {
			case 'markdown':
				items = markdownItems;
				break;
			case 'yaml':
				items = yamlItems;
				break;
		}
	}

	vscode.window.showQuickPick(items, opts).then((selection: any) => {
		if (!selection) {
			return;
		}

		if (!vscode.window.activeTextEditor) {
			vscode.window.showInformationMessage('Open a file first to manipulate text selections');
			return;
		}

		const convertLabelToLowerCase = selection.label.toLowerCase();
		const selectionWithoutIcon = convertLabelToLowerCase.split(')')[1].trim();

		switch (selectionWithoutIcon) {
			case 'bold':
				formatBold();
				break;
			case 'italic':
				formatItalic();
				break;
			case 'code':
				formatCode();
				break;
			case 'jupyter notebook':
				insertNotebook();
				break;
			case 'alert':
				insertAlert();
				break;
			case 'numbered list':
				insertNumberedList();
				break;
			case 'bulleted list':
				insertBulletedList();
				break;
			case 'table':
				insertTable();
				break;
			case 'link':
				pickLinkType();
				break;
			case 'non-localizable text':
				noLocText();
				break;
			case 'image':
				pickImageType(context);
				break;
			case 'include':
				insertInclude();
				break;
			case 'snippet':
				insertSnippet();
				break;
			case 'video':
				insertVideo();
				break;
			case 'preview':
				previewTopic();
				break;
			case 'search results preview':
				seoPreview();
				break;
			case 'template':
				applyTemplate();
				break;
			case 'cleanup...':
				applyCleanup();
				break;
			case 'link to xref':
				applyXref();
				break;
			case 'toc entry':
				insertTocEntry();
				break;
			case 'toc entry with optional attributes':
				insertTocEntryWithOptions();
				break;
			case 'parent node':
				insertExpandableParentNode();
				break;
			case 'insert link':
				insertLink();
				break;
			case 'columns':
				insertRowsAndColumns();
				break;
			case 'moniker':
				insertMoniker();
				break;
			default:
				const { msTimeValue } = generateTimestamp();
				output.appendLine(msTimeValue + ' - No quickpick case was hit.');
		}
	});
}
