import { App, Editor, MarkdownView,  Modal,  Plugin, PluginSettingTab, Setting, requestUrl, WorkspaceLeaf } from 'obsidian';
import * as cheerio from 'cheerio';
import { ExampleView, VIEW_TYPE_EXAMPLE } from "./views/test-view";

export default class MyPlugin extends Plugin {
	// settings: MyPluginSettings;

	async onload() {
		// await this.loadSettings();

		// This registers the Tezaurs definition view
		this.registerView(
			VIEW_TYPE_EXAMPLE,
			(leaf) => new ExampleView(leaf)
		  );

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('type', 'Tezaurs Definition', (evt: MouseEvent) => {
			this.activateView();
		});

		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor, view) => {
			  menu.addItem((item) => {
				item
				  .setTitle('Get Tezaurs definition')
				  .setIcon('type')
				  .onClick(async () => {
					ExampleView.displayTezaursDefinition(editor.getSelection());
				  });
			  });
			})
		  );

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-tezaurs-definitions-view',
			name: 'Open view',
			callback: () => {
				this.activateView();
			}
		});

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'get-tezaurs-definitions-selection',
			name: 'Get selection definition',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						const selection = this.app.workspace.activeEditor?.editor?.getSelection();

						if (selection && selection != '') {
							ExampleView.displayTezaursDefinition(selection);
						}
						else {
							return false;
						}
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});
	}

	onunload() {

	}

	static async getTezaursDefinition(input: string) {
		let returnValues: string[] = [];
		const searchURL = 'https://tezaurs.lv/' + input 

		try {
			const tezaurs = await requestUrl(searchURL).text;
	
			const $ = cheerio.load(tezaurs);
			const dictSenseElements = $('#homonym-1 > .dict_Sense');
	
			dictSenseElements.each(function getDictGloss() {
				let returnId = $(this).attr('id')?.slice(1);
				let returnString = $(this).find('> .dict_Gloss').text(); 
	
				returnValues.push(returnId + '. ' + returnString);
				const childDictSense = $(this).find('> .dict_Sense');
				childDictSense.each(getDictGloss);
			});

			return returnValues;
		}
		catch (error) {
			console.error('Request failed:', error)
		}
	}

	async activateView() {
		const { workspace } = this.app;
	
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} 
		else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			await leaf.setViewState({ type: VIEW_TYPE_EXAMPLE, active: true });
		}
	
		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf);
	}
}

