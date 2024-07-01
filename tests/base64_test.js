import { expect, test } from '@playwright/test';

test('base64 page works as expected', async ({ page }) => {
	await page.goto('/base64');
	await expect(page.getByRole('heading', { name: 'Base64' })).toBeVisible();
	await page.getByRole('textbox').fill('test');
	await page.getByText('Encode', { exact: true }).click();
	await expect(page.getByText('dGVzdA==')).toBeVisible();
});
