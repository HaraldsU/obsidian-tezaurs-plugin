import { App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting, requestUrl, WorkspaceLeaf } from 'obsidian';
import { TezaursDefinitionView, TEZAURS_DEFINITION_VIEW } from "./views/test-view";

export default class TezaursDefinitionPlugin extends Plugin {
	private TezaursDefinitionView: TezaursDefinitionView | null = null;

	async onload() {
		// This registers the Tezaurs definition view
		this.registerView(
			TEZAURS_DEFINITION_VIEW,
			(leaf) => {
				this.TezaursDefinitionView = new TezaursDefinitionView(leaf);
				return this.TezaursDefinitionView;
			}
		);

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('type', 'Tezaurs Definition', (evt: MouseEvent) => {
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
								if (!this.app.workspace.getActiveViewOfType(TezaursDefinitionView)) {
									this.activateView();
								}

								this.TezaursDefinitionView?.displayTezaursDefinition(editor.getSelection());
							}
						});
				});
			})
		);

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-tezaurs-definition-view',
			name: 'Open view',
			callback: () => {
				this.activateView();
			}
		});

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'get-tezaurs-definition-selection',
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
							if (!this.app.workspace.getActiveViewOfType(TezaursDefinitionView)) {
								this.activateView();
							}

							this.TezaursDefinitionView?.displayTezaursDefinition(selection);
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
		const leaves = workspace.getLeavesOfType(TEZAURS_DEFINITION_VIEW);

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

			await leaf.setViewState({ type: TEZAURS_DEFINITION_VIEW, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf);
	}
}
