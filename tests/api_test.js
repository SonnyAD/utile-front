import { expect, test } from '@playwright/test';

test('api page has expected h1', async ({ page }) => {
	await page.goto('/api');
	await expect(page.getByRole('heading', { name: 'utile.space API Usage License' })).toBeVisible();
});
