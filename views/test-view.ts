import { ItemView, WorkspaceLeaf, debounce, requestUrl } from "obsidian";
import * as cheerio from "cheerio";

export const VIEW_TYPE_EXAMPLE = "tezaurs-definitions";

export class ExampleView extends ItemView {
  private mainContainer: Element;
  private headingContainer: HTMLElement;
  private tableDiv: HTMLDivElement;
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
    const inputDiv = this.mainContainer.createDiv("search-input-container");
    this.tableDiv = this.mainContainer.createDiv("tezaurs-table");

    // Elements
    this.inputEl = inputDiv.createEl("input", { placeholder: "Search..." });
    this.inputEl.setAttribute("type", "text");

    const inputClearDiv = inputDiv.createEl("div");
    inputClearDiv.className = "search-input-clear-button";
    inputClearDiv.ariaLabel = "Clear search";

    // Debounce to prevent race conditions
    const debouncesDisplay = debounce((input: string) => {
      this.displayTezaursDefinition(input);
    }, 500, true);

    // Do when typing in input
    this.inputEl.addEventListener("input", async () => {
      const inputData = this.inputEl.value;
      debouncesDisplay(inputData);
    });

    // Do when input clear icon clicked
    inputClearDiv.addEventListener("click", () => {
      this.clearInput();
    })
  }

  public async displayTezaursDefinition(input: string) {
    this.tableDiv.empty();
    this.headingContainer?.remove();

    if (input != "") {
      input = input.toLowerCase();

      const [context, definitions] = (await this.getTezaursDefinition(input) as [string, string[]]);

      this.headingContainer = this.mainContainer.createEl("h2");
      this.mainContainer.insertBefore(this.headingContainer, this.tableDiv);

      this.headingContainer.createSpan({
        text: input[0].toUpperCase() + input.substring(1).toLowerCase() + " ",
        cls: "tezaurs-heading-main"
      });
      this.headingContainer.createSpan({
        text: "(" + context + ")",
        cls: "tezaurs-heading-context"
      });

      if (definitions != undefined) {
        if (definitions.length > 0) {
          definitions.forEach((el) => {
            let regexpFirstWord = new RegExp("^(\\S+)");
            let matchFW = regexpFirstWord.exec(el);

            if (matchFW != null) {
              let regexpDigits = new RegExp("\\d", "g");
              let matchD = matchFW[0].match(regexpDigits);

              if (matchD != null) {
                let tr = this.tableDiv.createEl("tr");
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
          let tr = this.tableDiv.createEl("tr");
          tr.createEl("td", { text: "No definition found!" });
        }
      }
    }
  }

  private clearInput() {
    this.inputEl.value = "";
    this.tableDiv.empty();
    this.headingContainer?.remove();
  }

  private async getTezaursDefinition(input: string) {
    const searchURL = "https://tezaurs.lv/" + input

    try {
      let context;
      let returnValues: string[] = [];
      const response = await requestUrl(searchURL).text;

      const $ = cheerio.load(response);
      const dictSenseElements = $("#homonym-1 > .dict_Sense");
      context = $("#homonym-1 > .dict_EntryHeader > .dict_Lexemes > .dict_Lexeme > .dict_Verbalization").text();

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