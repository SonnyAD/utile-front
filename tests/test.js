import { expect, test } from '@playwright/test';

test('index page has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(
		page.getByRole('heading', { name: 'Welcome to utile.space the Swiss Army Knife webtool' })
	).toBeVisible();
});

test('about page has expected h1', async ({ page }) => {
	await page.goto('/about');
	await expect(page.getByRole('heading', { name: 'Welcome to utile.space' })).toBeVisible();
});

test('api page has expected h1', async ({ page }) => {
	await page.goto('/api');
	await expect(page.getByRole('heading', { name: 'utile.space API Usage License' })).toBeVisible();
});

test('base64 page works as expected', async ({ page }) => {
	await page.goto('/base64');
	await expect(page.getByRole('heading', { name: 'Base64' })).toBeVisible();
	await page.getByRole('textbox').fill('test');
	await page.getByText('Encode', { exact: true }).click();
	await expect(page.getByText('dGVzdA==')).toBeVisible();
});

test('dice page works as expected', async ({ page }) => {
	await page.goto('/dice');
	await expect(page.getByRole('heading', { name: 'Dice' })).toBeVisible();
	const buttons = await page.getByText('Roll', { exact: true }).all();
	expect(buttons.length).toBe(5);
	for (var button of buttons) {
		await button.click();
	}
});

test('int2english page works as expected', async ({ page }) => {
	await page.goto('/int2english');
	await expect(page.getByRole('heading', { name: 'Int2English' })).toBeVisible();
	await page.locator('input[type=number]').fill('42');
	await page.getByText('To English', { exact: true }).click();
	await expect(page.getByText('Forty-Two')).toBeVisible();
});
