import { App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting, requestUrl, WorkspaceLeaf } from 'obsidian';
import { TezaursDefinitionsView, TEZAURS_DEFINITIONS_VIEW } from "./views/test-view";

export default class TezaursDefinitionsPlugin extends Plugin {
	private TezaursDefinitionsView: TezaursDefinitionsView | null = null;

	async onload() {
		// This registers the Tezaurs definition view
		this.registerView(
			TEZAURS_DEFINITIONS_VIEW,
			(leaf) => {
				this.TezaursDefinitionsView = new TezaursDefinitionsView(leaf);
				return this.TezaursDefinitionsView;
			}
		);

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('type', 'Tezaurs Definitions', (evt: MouseEvent) => {
			this.activateView();
		});

		// Create a context menu entry
		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor, view) => {
				menu.addItem((item) => {
					item
						.setTitle('Get Tezaurs definition')
						.setIcon('type')
						.onClick(async () => {
							const selection = editor.getSelection();

							if (selection && selection != '') {
								if (!this.app.workspace.getActiveViewOfType(TezaursDefinitionsView)) {
									this.activateView();
								}

								this.TezaursDefinitionsView?.displayTezaursDefinition(editor.getSelection());
							}
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
				const selection = this.app.workspace.activeEditor?.editor?.getSelection();

				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {

						if (selection && selection != '') {
							if (!this.app.workspace.getActiveViewOfType(TezaursDefinitionsView)) {
								this.activateView();
							}

							this.TezaursDefinitionsView?.displayTezaursDefinition(selection);
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

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(TEZAURS_DEFINITIONS_VIEW);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		}
		else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);

			if (!leaf) {
				console.error('Failed to create leaf for view');
				return;
			}

			await leaf.setViewState({ type: TEZAURS_DEFINITIONS_VIEW, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf);
	}
}
