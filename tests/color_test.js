import { expect, test } from '@playwright/test';

test('color page works as expected', async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto('/color');
	await expect(page.getByRole('heading', { name: 'Color Picker' })).toBeVisible();

    await page.getByText('Copy Hex', { exact: true }).click();

    const handle = await page.evaluateHandle(() => navigator.clipboard.readText());
    const clipboardContent = await handle.jsonValue();

    expect(clipboardContent).toEqual('#c83737');
});
