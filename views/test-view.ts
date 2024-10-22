import { ItemView, WorkspaceLeaf } from 'obsidian';
import MyPlugin from 'main';

export const VIEW_TYPE_EXAMPLE = 'tezaurs-definitions';

export class ExampleView extends ItemView {
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.icon = 'type';
  }

  static mainContainer: Element;
  static listContainer: HTMLDivElement;
  static inputEl: HTMLInputElement;
  static inputTitle: HTMLElement;
  static button: HTMLButtonElement;

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return 'Tezaurs Definitions';
  }

  async onOpen() {
    ExampleView.mainContainer = this.containerEl.children[1];
    const inputContainer = ExampleView.mainContainer.createDiv('tezaurs-input');
    ExampleView.listContainer = ExampleView.mainContainer.createDiv('tezaurs-definitions');

    ExampleView.inputEl = inputContainer.createEl('input', { text: 'tezaurs-input' });
    ExampleView.inputEl.setAttribute('type', 'text');

    ExampleView.button = inputContainer.createEl('button', { text: 'Search' });
    ExampleView.button.setAttribute('type', 'button');
    ExampleView.button.addEventListener('click', async () => {
      const inputData = ExampleView.inputEl.value;
      ExampleView.displayTezaursDefinition(inputData);
    });
  }

  static async displayTezaursDefinition(input: string) {
    input = input.toLowerCase();

    if (ExampleView.inputTitle != null) {
      ExampleView.inputTitle.empty();
    }

    ExampleView.inputTitle = ExampleView.mainContainer.createEl('h2', { text: input[0].toUpperCase() + input.substring(1).toLowerCase() })
    ExampleView.mainContainer.insertBefore(ExampleView.inputTitle, ExampleView.listContainer);

    ExampleView.listContainer.empty();
    let definitions = await MyPlugin.getTezaursDefinition(input);

    if (definitions != undefined){
      if (definitions.length > 0) {
        definitions.forEach(function (el) {
          let regexpFirstWord = new RegExp('^(\\S+)');
          let matchFW = regexpFirstWord.exec(el);
  
          if (matchFW != null) {
            let regexpDigits = new RegExp('\\d', 'g');
            let matchD = matchFW[0].match(regexpDigits);
  
            if (matchD != null) {
              let li = ExampleView.listContainer.createEl('li', { text: el });
              li.style.paddingLeft = matchD.length + 'em';
            }
          }
        })
      }
      else {
        ExampleView.listContainer.createEl('li', { text: 'No definition found!' });
      }
    }
  }

  async onClose() {
    // Nothing to clean up.
  }
}