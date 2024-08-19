import { test } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';
import MainPage from './PageObjects/MainPage';

const execPromise = promisify(exec);
const runApp = 'npm run dev';
const appUrl = 'http://localhost:5173/';

test.beforeAll(async () => {
    execPromise(runApp);
})

test('Create new task', async ({ page }) => {
    const mainPage = new MainPage(page);
    await page.goto(appUrl);
    await mainPage.createNewTask();
});

test('Edit task', async ({ page }) => {
    const mainPage = new MainPage(page);
    await page.goto(appUrl);
    await mainPage.createNewTask();
    await mainPage.editTask();
});

test('Delete task', async ({ page }) => {
    const mainPage = new MainPage(page);
    await page.goto(appUrl);
    await mainPage.createNewTask();
    await mainPage.deleteTask();
});

test('Create task with different combinations', async ({ page }) => {
    const mainPage = new MainPage(page);
    await page.goto(appUrl);
    await mainPage.createTaskWithDifferentOptions();
});

test('Sort tasks by importance Descending', async ({ page }) => {
    const mainPage = new MainPage(page);
    await page.goto(appUrl);
    await mainPage.createTaskVerifyOrder();
})