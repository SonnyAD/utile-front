import { expect, test } from '@playwright/test';

test('math page works as expected', async ({ page }) => {
	await page.goto('/math');
	await expect(page.getByRole('heading', { name: 'Some mathematics stuff' })).toBeVisible();
	const result = await page.getByTitle('result');
	expect((await result.innerHTML()) == '&nbsp;');
	const button = await page.getByText('Compute π 10K first decimals', { exact: true });
	await button.click();
	expect((await result.innerHTML()) == '...');
});
