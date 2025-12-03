import { test, expect } from '@playwright/test';

test.describe('Product Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the products page
    await page.goto('/');
    await page.getByRole('button').first().click();
    
    // Wait for and click on Products button
    const productsButton = page.getByRole('button', { name: 'Productos' });
    await productsButton.waitFor({ state: 'visible', timeout: 30000 });
    await productsButton.scrollIntoViewIfNeeded();
    await productsButton.click();
  });

  test('should create a new product', async ({ page }) => {
    // Click on New Product button
    const newProductButton = page.getByRole('button', { name: 'Nuevo Producto' });
    await newProductButton.waitFor({ state: 'visible', timeout: 30000 });
    await newProductButton.click();

    // Fill in product details
    const testProductName = `Test Product ${Date.now()}`;
    const testDescription = 'This is a test product';
    const testPrice = '120';
    const testMercadoLibreUrl = 'https://articulo.mercadolibre.com.ar/MLA-1413669863-zapatillas-topper-boro-iii-color-verde-oliva-para-hombre';
    const testImageUrl = 'https://http2.mlstatic.com/D_NQ_NP_2X_873715-MLA75001621421_032024-F.webp';

    await page.getByRole('textbox', { name: 'Nombre del producto' }).fill(testProductName);
    await page.getByRole('textbox', { name: 'Descripción' }).fill(testDescription);
    await page.getByRole('spinbutton', { name: 'Precio' }).fill(testPrice);
    await page.getByRole('textbox', { name: 'Link de MercadoLibre' }).fill(testMercadoLibreUrl);
    await page.getByRole('textbox', { name: 'URL de la imagen del producto' }).fill(testImageUrl);

    // Submit the form
    await page.getByRole('button', { name: 'Agregar Producto' }).click();

    // Verify the product was created
    await expect(page.getByText(testProductName).first()).toBeVisible({ timeout: 10000 });

    // También verificamos que el precio y el botón "Ver en ML" se muestren en la tarjeta
    await expect(page.getByText(`$${testPrice}`).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Ver en ML' }).first()).toBeVisible({ timeout: 10000 });

    // Edit the product we just created: open the Edit dialog from its card
    const createdCard = page.locator('.product-card', { hasText: testProductName }).first();
    await createdCard.waitFor({ state: 'visible', timeout: 10000 });

    await createdCard.getByRole('button', { name: 'Editar' }).click();

    const updatedName = `${testProductName} Updated`;

    await page.getByRole('textbox', { name: 'Nombre del producto' }).fill(updatedName);

    // Save changes
    await page.getByRole('button', { name: 'Actualizar Producto' }).click();

    // Verify the product name was updated
    await expect(page.getByText(updatedName).first()).toBeVisible({ timeout: 10000 });

    // Cleanup: delete the updated product to avoid polluting later tests
    const updatedCard = page.locator('.product-card', { hasText: updatedName }).first();
    await updatedCard.waitFor({ state: 'visible', timeout: 10000 });
    const deleteButton = updatedCard.getByRole('button').last();
    await deleteButton.click();

    // Confirmar que el producto ya no aparece después de eliminarlo
    await expect(page.getByText(updatedName)).toHaveCount(0);
  });

  test('should edit an existing product', async ({ page }) => {
    // First, create a product to edit
    const originalName = `Test Edit ${Date.now()}`;
    const originalDescription = 'Initial description';
    const originalPrice = '100';

    // Click on New Product button
    const newProductButton = page.getByRole('button', { name: 'Nuevo Producto' });
    await newProductButton.waitFor({ state: 'visible', timeout: 30000 });
    await newProductButton.click();

    // Fill in product details
    await page.getByRole('textbox', { name: 'Nombre del producto' }).fill(originalName);
    await page.getByRole('textbox', { name: 'Descripción' }).fill(originalDescription);
    await page.getByRole('spinbutton', { name: 'Precio' }).fill(originalPrice);
    await page.getByRole('textbox', { name: 'Link de MercadoLibre' }).fill('https://example.com/product');
    await page.getByRole('textbox', { name: 'URL de la imagen del producto' }).fill('https://example.com/image.jpg');

    // Submit the form
    await page.getByRole('button', { name: 'Agregar Producto' }).click();

    // Verify original product is visible
    await expect(page.getByText(originalName).first()).toBeVisible({ timeout: 10000 });

    // Open edit dialog from the product card
    const productCard = page.locator('.product-card', { hasText: originalName }).first();
    await productCard.waitFor({ state: 'visible', timeout: 10000 });
    await productCard.getByRole('button', { name: 'Editar' }).click();

    const updatedName = `${originalName} Updated`; 
    const updatedDescription = 'Updated description';
    const updatedPrice = '200';

    // Edit fields in the same dialog
    await page.getByRole('textbox', { name: 'Nombre del producto' }).fill(updatedName);
    await page.getByRole('textbox', { name: 'Descripción' }).fill(updatedDescription);
    await page.getByRole('spinbutton', { name: 'Precio' }).fill(updatedPrice);

    // Save changes
    await page.getByRole('button', { name: 'Actualizar Producto' }).click();

    // Verify the changes were saved en la lista
    await expect(page.getByText(updatedName).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(updatedDescription).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(`$${updatedPrice}`).first()).toBeVisible({ timeout: 10000 });

    // Cleanup: delete the edited product
    const updatedCard = page.locator('.product-card', { hasText: updatedName }).first();
    await updatedCard.waitFor({ state: 'visible', timeout: 10000 });
    await updatedCard.getByRole('button').last().click();

    await expect(page.getByText(updatedName)).toHaveCount(0);
  });
});
