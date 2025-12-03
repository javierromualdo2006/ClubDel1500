import { test, expect } from '@playwright/test';
import { login } from '../__tests__/utils/login';

test('test', async ({ page }) => {
  // Navegar a la página principal
  await page.goto('http://localhost:3000/', { timeout: 60000, waitUntil: 'load' });
  
  // Usar la utilidad de login
  await page.evaluate(() => {
    // @ts-ignore - Exponer la función de login globalmente para el test
    window.__TEST_LOGIN = async () => {
      const { login } = await import('@/__tests__/utils/login');
      const { useAuth } = await import('@/contexts/auth-context');
      const auth = useAuth();
      await login(auth);
    };
  });
  
  // Ejecutar el login
  await page.evaluate(() => {
    // @ts-ignore
    return window.__TEST_LOGIN();
  });
  
  // Recargar la página para asegurar que la autenticación se mantenga
  await page.reload({ waitUntil: 'networkidle' });

  // Navegar directamente a la sección de Productos
  await page.goto('http://localhost:3000/products', { timeout: 60000, waitUntil: 'networkidle' });
  
  // Esperar a que la página de productos esté completamente cargada
  await page.waitForSelector('button:has-text("Nuevo Producto")', { state: 'visible', timeout: 60000 });

  // Espera y hacer clic en el botón "Nuevo Producto"
  const buttonNuevoProducto = await page.getByRole('button', { name: 'Nuevo Producto' });
  await buttonNuevoProducto.waitFor({ state: 'visible', timeout: 60000 });
  await buttonNuevoProducto.scrollIntoViewIfNeeded(); // Desplazar si es necesario
  await buttonNuevoProducto.click();

  // Completar los campos para crear un nuevo producto
  await page.getByRole('textbox', { name: 'Nombre del producto' }).click();
  await page.getByRole('textbox', { name: 'Nombre del producto' }).fill('test');
  await page.getByRole('textbox', { name: 'Descripción' }).click();
  await page.getByRole('textbox', { name: 'Descripción' }).fill('test');
  await page.getByRole('spinbutton', { name: 'Precio' }).click();
  await page.getByRole('spinbutton', { name: 'Precio' }).fill('120');
  await page.getByRole('textbox', { name: 'Link de MercadoLibre' }).click();
  await page.getByRole('textbox', { name: 'Link de MercadoLibre' }).fill('https://articulo.mercadolibre.com.ar/MLA-1413669863-zapatillas-topper-boro-iii-color-verde-oliva-para-hombre-_JM?searchVariation=180008545784#polycard_client=recommendations_home-navigation-recommendations&reco_backend=machinalis-homes-univb-equivalent-offer&reco_client=home_navigation-recommendations&reco_item_pos=2&reco_backend_type=function&reco_id=3e1ea24a-6566-4d41-abe9-0f0eca19880d&c_id=/home/navigation-recommendations/element&c_uid=84fb2344-b718-4701-9299-e025959ab709');
  await page.getByRole('textbox', { name: 'URL de la imagen del producto' }).click();
  await page.getByRole('textbox', { name: 'URL de la imagen del producto' }).fill('https://http2.mlstatic.com/D_NQ_NP_2X_873715-MLA75001621421_032024-F.webp');

  // Hacer clic en el botón para agregar el producto
  await page.getByRole('button', { name: 'Agregar Producto' }).click();
});
