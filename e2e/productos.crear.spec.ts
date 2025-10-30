import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  // Navigate to the login page
  await page.goto("http://localhost:3000/login");

  // Wait for the "Iniciar Sesión" button to be visible
  const loginButton = page.locator("button", { hasText: "Iniciar Sesión" });
  await loginButton.waitFor({ state: "visible", timeout: 5000 });

  // Log the button's class list for debugging
  const buttonClassList = await loginButton.evaluate((button) => {
    return button.classList.toString(); // Get all class names as a string
  });
  console.log("Button class list:", buttonClassList);

  // Check the 'aria-disabled' attribute if it's present
  const ariaDisabled = await loginButton.getAttribute("aria-disabled");
  console.log("aria-disabled value:", ariaDisabled);

  // Check if the button is disabled by class
  const hasDisabledClass = await loginButton.evaluate((button) => {
    return button.classList.contains("disabled");
  });
  console.log("Has disabled class:", hasDisabledClass);

  // Assert that the button has the 'disabled' class or 'aria-disabled' is true
  if (ariaDisabled === null) {
    // If 'aria-disabled' is not present, check the 'disabled' class
    expect(hasDisabledClass).toBe(true);
  } else {
    // Otherwise, check the 'aria-disabled' attribute
    expect(ariaDisabled).toBe("true");
  }

  // Click the "Iniciar Sesión" button
  await loginButton.click();

  // Wait for the page to redirect and for the "Productos" button to be visible
  await page.waitForSelector("button:has-text('Productos')", {
    state: "visible",
  });

  // Locate the "Productos" button
  const productosButton = page.locator('button:has-text("Productos")');

  // Scroll the button into view if needed
  await productosButton.scrollIntoViewIfNeeded();

  // Check if the "Productos" button is enabled
  await expect(productosButton).toBeEnabled();
  await productosButton.click();

  // Wait for the "Nuevo Producto" button to be visible
  const nuevoProductoButton = page.locator("button", {
    hasText: "Nuevo Producto",
  });
  await expect(nuevoProductoButton).toBeVisible();

  // Fill the form for the new product
  const nombreProductoTextbox = page.locator(
    'input[aria-label="Nombre del producto"]'
  );
  await nombreProductoTextbox.fill("asdasd");

  const descripcionTextbox = page.locator('input[aria-label="Descripción"]');
  await descripcionTextbox.fill("asdasdasdfasd");

  const precioSpinbutton = page.locator('input[aria-label="Precio"]');
  await precioSpinbutton.fill("12");

  const mercadoLibreLinkTextbox = page.locator(
    'input[aria-label="Link de MercadoLibre"]'
  );
  await mercadoLibreLinkTextbox.fill(
    "https://articulo.mercadolibre.com.ar/MLA-1413669863-zapatillas-topper-boro-iii-color-verde-oliva-para-hombre-_JM"
  );

  const imagenURLTextbox = page.locator(
    'input[aria-label="URL de la imagen del producto"]'
  );
  await imagenURLTextbox.fill(
    "https://http2.mlstatic.com/D_NQ_NP_2X_873715-MLA75001621421_032024-F.webp"
  );

  // Click the "Agregar Producto" button
  const agregarProductoButton = page.locator("button", {
    hasText: "Agregar Producto",
  });
  await agregarProductoButton.click();

  // Wait for success message
  const successMessage = page.locator("text=Producto agregado con éxito");
  await expect(successMessage).toBeVisible();
});
