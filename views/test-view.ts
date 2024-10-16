import { IconName, ItemView, WorkspaceLeaf } from "obsidian";
import MyPlugin from "main";

export const VIEW_TYPE_EXAMPLE = "tezaurs-definitions";

export class ExampleView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.icon = 'type';
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return "Tezaurs Definitions";
  }

  async onOpen() {
    let definitions: string[] = [];
    const mainContainer = this.containerEl.children[1];
    const inputContainer = mainContainer.createDiv("tezaurs-input");
    const listContainer = mainContainer.createDiv("tezaurs-definitions");
    // container.empty();
    
    const input = inputContainer.createEl("input", { text: "tezaurs-input" });
    input.setAttribute("type", "text");

    const button = inputContainer.createEl("button", { text: "Search" });
    button.setAttribute("type", "button");
    button.addEventListener('click', async () => {
      const inputData = input.value;

      listContainer.empty();
      definitions = await MyPlugin.getTezaursDefinition(inputData);
      definitions.forEach(function(el, i) {
        // console.log('el = ', el)
        listContainer.createEl("li", {text: el})
      })
    });
  }

  async onClose() {
    // Nothing to clean up.
  }
}