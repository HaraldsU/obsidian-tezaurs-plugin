import { ItemView, WorkspaceLeaf, debounce, requestUrl } from "obsidian";
import * as cheerio from "cheerio";

export const VIEW_TYPE_EXAMPLE = "tezaurs-definitions";

export class ExampleView extends ItemView {
  private mainContainer: Element;
  private headingContainer: HTMLElement;
  private tableContainer: HTMLDivElement;
  private inputEl: HTMLInputElement;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    this.icon = "type";
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return "Tezaurs Definitions";
  }

  async onOpen() {
    // Containers
    this.mainContainer = this.containerEl.children[1];
    const inputContainer = this.mainContainer.createDiv("search-input-container");
    this.tableContainer = this.mainContainer.createDiv("tezaurs-table");

    // Elements
    this.inputEl = inputContainer.createEl("input", { placeholder: "Search..." });
    this.inputEl.setAttribute("type", "text");

    const inputClearEl = inputContainer.createEl("div");
    inputClearEl.className = "search-input-clear-button";
    inputClearEl.ariaLabel = "Clear search";

    const debouncesDisplay = debounce((input: string) => {
      this.displayTezaursDefinition(input);
    }, 500, true);

    this.inputEl.addEventListener("input", async () => {
      const inputData = this.inputEl.value;
      debouncesDisplay(inputData);
    });

    inputClearEl.addEventListener("click", () => {
      this.clearInput();
    })
  }

  public async displayTezaursDefinition(input: string) {
    this.tableContainer.empty();
    this.headingContainer?.remove();

    if (input != "") {
      input = input.toLowerCase();

      const [context, definitions] = (await this.getTezaursDefinition(input) as [string, string[]]);

      this.headingContainer = this.mainContainer.createEl("h2");
      this.mainContainer.insertBefore(this.headingContainer, this.tableContainer);

      this.headingContainer.createSpan({
        text: input[0].toUpperCase() + input.substring(1).toLowerCase() + " ",
        cls: "tezaurs-heading-main"
      });
      this.headingContainer.createSpan({
        text: "(" + context + ")",
        cls: "tezaurs-heading-context"
      });

      console.log("definitions = ", definitions);

      if (definitions != undefined) {
        if (definitions.length > 0) {
          definitions.forEach((el) => {
            let regexpFirstWord = new RegExp("^(\\S+)");
            let matchFW = regexpFirstWord.exec(el);

            if (matchFW != null) {
              let regexpDigits = new RegExp("\\d", "g");
              let matchD = matchFW[0].match(regexpDigits);

              if (matchD != null) {
                let tr = this.tableContainer.createEl("tr");
                let td = tr.createEl("td", { text: el });

                if (matchD.length == 1) {
                  td.className = "tezaurs-table-head";
                }
                else {
                  td.className = "tezaurs-table-data";
                }
              }
            }
          })
        }
        else {
          let tr = this.tableContainer.createEl("tr");
          tr.createEl("td", { text: "No definition found!" });
        }
      }
    }
  }

  private clearInput() {
    this.inputEl.value = "";
    this.tableContainer.empty();
    this.headingContainer?.remove();
  }

  private async getTezaursDefinition(input: string) {
    const searchURL = "https://tezaurs.lv/" + input

    try {
      let returnValues: string[] = [];
      let context;
      const tezaurs = await requestUrl(searchURL).text;

      const $ = cheerio.load(tezaurs);
      const dictSenseElements = $("#homonym-1 > .dict_Sense");
      context = $("#homonym-1 > .dict_EntryHeader > .dict_Lexemes > .dict_Lexeme > .dict_Verbalization").text();
      console.log("context = ", context);

      dictSenseElements.each(function getDictGloss() {
        let returnId = $(this).attr("id")?.slice(1);
        let returnString = $(this).find("> .dict_Gloss").text();

        returnValues.push(returnId + ". " + returnString);
        const childDictSense = $(this).find("> .dict_Sense");
        childDictSense.each(getDictGloss);
      });

      return [context, returnValues];
    }
    catch (error) {
      console.error("Request failed:", error)
    }
  }

  async onClose() {
    // Nothing to clean up.
  }
}