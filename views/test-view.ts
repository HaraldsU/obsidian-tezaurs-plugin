import { ItemView, WorkspaceLeaf } from "obsidian";
import MyPlugin from "main";

export const VIEW_TYPE_EXAMPLE = "example-view";

export class ExampleView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return "Example view";
  }

  async onOpen() {
    let definitions: string[] = [];
    const container = this.containerEl.children[1];
    container.empty();
    // container.createEl("h4", { text: "Example view" });
    const input = container.createEl("input", { text: "tezaurs-input" });
    input.setAttribute("type", "text");

    const button = container.createEl("button", { text: "Search" });
    button.setAttribute("type", "button");
    button.addEventListener('click', async () => {
      const inputData = input.value;
      definitions = await MyPlugin.getTezaursDefinition(inputData);
      // console.log('Def = ', definitions);
      definitions.forEach(function(el, i) {
        console.log('el = ', el)
        container.createEl("li", {text: el})
      })
    });
  }

  async onClose() {
    // Nothing to clean up.
  }
}