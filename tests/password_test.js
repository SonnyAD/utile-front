import { expect, test } from '@playwright/test';

test('password page works as expected', async ({ page }) => {
	await page.goto('/password');
	await expect(page.getByRole('heading', { name: 'Password Generator' })).toBeVisible();
	await page.getByText('Generate', { exact: true }).click();
    const result = page.locator('#result');
	await expect(result).toBeVisible();
    expect((await result.innerHTML()).length).toBeGreaterThanOrEqual(20);
});
