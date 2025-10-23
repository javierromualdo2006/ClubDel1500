import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/', { timeout: 60000, waitUntil: 'load' });

  // Interacciones iniciales
  await page.getByRole('button').nth(1).click();
  await page.goto('http://localhost:3000/', { timeout: 60000, waitUntil: 'load' });
  await page.getByRole('button').first().click();

  // Esperar y hacer clic en el botón de inicio de sesión
  const buttonInicioSesion = page.getByRole('button', { name: 'Inicio de Sesión' });
  await buttonInicioSesion.waitFor({ state: 'visible', timeout: 60000 });
  await buttonInicioSesion.scrollIntoViewIfNeeded();
  await buttonInicioSesion.click();

  // Completar el nombre de usuario
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).waitFor({ state: 'visible' });
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).fill('admin@gmail.com');
  await page.getByRole('textbox', { name: 'Nombre de usuario' }).press('Enter');

  // Completar la contraseña
  await page.getByRole('textbox', { name: 'Contraseña' }).waitFor({ state: 'visible' });
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('12345678');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  // Ir al inicio de la página
  await page.getByRole('button').first().click();

  // Esperar y hacer clic en el botón de Productos
  const buttonProductos = await page.getByRole('button', { name: 'Productos' });
  await buttonProductos.waitFor({ state: 'visible', timeout: 60000 });
  await buttonProductos.scrollIntoViewIfNeeded();
  await buttonProductos.click();

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
  
  // Esperar y manejar la ventana emergente
  const page4Promise = page.waitForEvent('popup');
  
  // Cambia el selector para que seleccione un único botón
  await page.getByRole('button', { name: 'Ver en ML' }).nth(0).click(); // Cambiar el índice según el botón correcto
  const page4 = await page4Promise;

  // Editar el producto desde la ventana emergente
  await page4.getByRole('main').getByRole('button', { name: 'Editar' }).click();
  await page4.getByRole('textbox', { name: 'Nombre del producto' }).fill('testupdated');
  await page4.getByRole('textbox', { name: 'Descripción' }).fill('testupdated');
  await page4.getByRole('spinbutton', { name: 'Precio' }).fill('1200000');
  
  // Hacer clic en el botón para actualizar el producto
  await page4.getByRole('button', { name: 'Actualizar Producto' }).click();
});
