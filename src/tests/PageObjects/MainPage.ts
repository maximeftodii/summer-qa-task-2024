import { expect, Page } from "@playwright/test";

export default class MainPage {
    private readonly TitleField = "//input[@placeholder='Task Title']";
    private readonly DescriptionField = "//textarea[@placeholder='Task Description']";
    public readonly ImportanceDropdown = '//select[option[text()="Low"] and option[text()="Medium"] and option[text()="High"]]';
    private readonly LabelDropdown = '//select[option[text()="Work"] and option[text()="Social"] and option[text()="Home"] and option[text()="Hobby"]]';
    private readonly AddTaskButton = "//button[@type='submit']";
    private readonly EditTitleField = "//input[@placeholder='Title']";
    private readonly EditDescriptionField = "//textarea[@placeholder='Description']";
    private readonly SaveButton = "//button[@class='py-1 px-2 bg-blue-500 text-white rounded-md']";
    private readonly EditButton = '//div[contains(@class, "task-item")]//h3[text()="Task 1"]//following-sibling::div[contains(@class, "mt-2 flex gap-2")]//button[contains(@class, "bg-yellow-500")]';
    private readonly DeleteButton = '//div[contains(@class, "task-item")]//h3[text()="Task 1"]//following-sibling::div[contains(@class, "mt-2 flex gap-2")]//button[contains(@class, "bg-red-500")]';
    private readonly TaskNameText = '//h3[@class="text-lg font-semibold"]';
    private readonly Description = '//p[@class="text-sm"]';
    private readonly TaskImportanceLocator = '//p[@class="text-xs text-gray-500"]'

    private taskCounter: number = 1; // Start with 1 for Task1
    private descriptionCounter: number = 1;
    private currentTaskName: string | null = null;

    constructor(private page: Page) { }

    private createTaskName(increment: boolean = true): string {
        if (increment) {
            this.currentTaskName = `Task ${this.taskCounter}`;
            this.taskCounter++;
        } else {
            if (!this.currentTaskName) {
                this.currentTaskName = `Task ${this.taskCounter}`;
            }
        }
        return this.currentTaskName;
    }

    private generateDescription(): string {
        const description = `Description ${this.descriptionCounter}`;
        this.descriptionCounter++;
        return description;
    }

    async createNewTask() {
        console.log("Creating new task");
        const taskName = this.createTaskName(true);
        const description = this.generateDescription();
        await this.page.locator(this.TitleField).fill(taskName);
        await this.page.locator(this.DescriptionField).fill(description);
        await this.page.locator(this.AddTaskButton).click();
        await this.verifyCreatedTask(taskName, description);
    }

    async verifyCreatedTask(taskName: string, description: string) {
        await expect(this.page.getByText(taskName)).toBeVisible();
        console.log(`${taskName} is present`);
        await expect(this.page.getByText(description)).toBeVisible();
        console.log(`${description} is present`);
    }

    async editTask() {
        console.log("Editing task");
        const editedTaskName = this.createTaskName(true);
        console.log(editedTaskName);
        const editedDescription = this.generateDescription();
        await this.page.locator(this.EditButton).screenshot();
        await this.page.locator(this.EditButton).click();
        await this.page.locator(this.EditTitleField).fill(editedTaskName);
        await this.page.locator(this.EditDescriptionField).fill(editedDescription);
        await this.page.locator(this.SaveButton).click();
        console.log(`Task name changed to ${editedTaskName}`);
        console.log(`Description changed to ${editedDescription}`);
        await this.verifyEditedTask(editedTaskName, editedDescription);
    }

    async verifyEditedTask(editedTaskName: string, editedDescription: string): Promise<void> {
        await this.page.reload();
        const taskNameText = await this.page.locator(this.TaskNameText).textContent();
        console.log(`Actual name is: ${taskNameText}`);
        const descriptionText = await this.page.locator(this.Description).textContent();
        console.log(`Actual description is: ${descriptionText}`);
        await expect(this.page.getByText(editedTaskName)).toBeVisible();
        await expect(this.page.getByText(editedDescription)).toBeVisible();
    }

    async deleteTask() {
        console.log("Deleting task");
        const taskName = this.createTaskName(false);
        const description = this.generateDescription();
        await this.page.locator(this.DeleteButton).click();
        await this.page.reload();
        await expect(this.page.getByText(taskName)).toBeHidden();
        await expect(this.page.getByText(description)).toBeHidden();
    }

    async importanceDropdonwSelection(importance: string) {
        await this.page.selectOption(this.ImportanceDropdown, importance);
    }

    async labelDropdownSelection(label: string) {
        await this.page.selectOption(this.LabelDropdown, label);
    }

    async selectTaskOptions(importance: string, label: string) {
        await this.importanceDropdonwSelection(importance);
        await this.labelDropdownSelection(label);
    }

    async createTaskWithDifferentOptions() {
        const importances = ['Low', 'Medium', 'High'];
        const labels = ['Work', 'Social', 'Home', 'Hobby'];
        for (const importance of importances) {
            for (const label of labels) {
                await this.createNewTask();
                await this.selectTaskOptions(importance, label)
                await this.page.screenshot({ path: `screenshots/task-${importance}-${label}.png` });
            }
        }
    }

    async selectSortOrder(sortOrder: string) {
        await this.page.selectOption("//select[@class='p-2 border rounded-md ml-4' and option[@value='asc'] and option[@value='desc']]", sortOrder);
    }

    async sortTasksByLabel() {

    }

    async getTaskImportanceList(): Promise<string[]> {
        const taskElements = await this.page.$$(this.TaskImportanceLocator);
        const importanceValues = [];
        for (const element of taskElements) {
            const importanceText = await element.innerText();
            const match = importanceText.match(/Importance:\s*(\w+)/);
            if (match) {
                importanceValues.push(match[1].trim());
            }
        }
        return importanceValues;
    }

    async verifySortedOrder(expectedOrder: string[]): Promise<void> {
        const sortedTasks = await this.getTaskImportanceList();
        if (JSON.stringify(sortedTasks) !== JSON.stringify(expectedOrder)) {
            throw new Error(`Sorting validation failed. Expected order: ${expectedOrder}, but got: ${sortedTasks}`);
        }
    }

    async createTaskVerifyOrder() {
        const expectedOrder = ['High', 'Medium', 'Low'];
        await this.createTaskWithDifferentOptions();
        await this.selectSortOrder('Sort by Importance (Descending)');
        await this.getTaskImportanceList();
        try {
            await this.verifySortedOrder(expectedOrder);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error(`Error: ${error.message}`);
                throw error;
            } else {
                console.error('An unknown error occurred');
            }
        }
    }
}