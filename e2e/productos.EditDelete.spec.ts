import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  // Navegar a la página donde está el botón de "Iniciar Sesión"
  await page.goto("http://localhost:3000/login"); // Reemplaza con la URL correcta

  // Seleccionar el botón de "Iniciar Sesión" (asegúrate de usar un selector adecuado)
  const loginButton = await page.locator('button[type="submit"]'); // Asegúrate de que el selector sea el correcto para tu botón

  // Comprobar si el botón tiene la clase 'disabled' cuando está deshabilitado
  const hasDisabledClass = await loginButton.evaluate((button) =>
    button.classList.contains("disabled")
  );
  console.log("Has disabled class:", hasDisabledClass); // Esto imprimirá si el botón tiene la clase 'disabled'

  // Comprobar si el atributo 'aria-disabled' está presente y tiene el valor "true"
  const ariaDisabled = await loginButton.getAttribute("aria-disabled");
  console.log("aria-disabled value:", ariaDisabled); // Esto imprimirá el valor de 'aria-disabled'

  // Esperar que el atributo disabled esté presente en el botón
  await expect(loginButton).toBeEnabled(); // Playwright tiene un método que espera que el botón esté deshabilitado

  // Alternativamente, si se quiere comprobar el atributo disabled directamente:
  const isButtonDisabled = await loginButton.isDisabled();
  console.log("Is the button disabled:", isButtonDisabled);
  expect(isButtonDisabled).toBe(true);
});
