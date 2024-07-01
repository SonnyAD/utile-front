import { expect, test } from '@playwright/test';

test('dice page works as expected', async ({ page }) => {
	await page.goto('/dice');
	await expect(page.getByRole('heading', { name: 'Dice' })).toBeVisible();
	const buttons = await page.getByText('Roll', { exact: true }).all();
	expect(buttons.length).toBe(5);
	for (var button of buttons) {
		await button.click();
	}
});
