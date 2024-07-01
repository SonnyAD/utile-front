import { expect, test } from '@playwright/test';

test('int2english page works as expected', async ({ page }) => {
	await page.goto('/int2english');
	await expect(page.getByRole('heading', { name: 'Int2English' })).toBeVisible();
	await page.locator('input[type=number]').fill('42');
	await page.getByText('To English', { exact: true }).click();
	await expect(page.getByText('Forty-Two')).toBeVisible();
});
