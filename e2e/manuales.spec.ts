import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button').filter({ hasText: /^$/ }).first().click();
  await page.getByRole('button', { name: 'Inicio de Sesión' }).click();
  await page.getByRole('textbox', { name: 'Usuario' }).click();
  await page.getByRole('textbox', { name: 'Usuario' }).fill('admin');
  await page.getByRole('textbox', { name: 'Contraseña' }).click();
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('123');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).first().click();
  await page.getByRole('button', { name: 'Manuales del Auto' }).click();
  await page.locator('div').filter({ hasText: 'No hay manuales disponibles' }).nth(2).click();
  await page.getByRole('button', { name: 'Agregar Manual' }).click();
  await page.getByRole('textbox', { name: 'Título del manual' }).fill('manual');
  await page.getByRole('textbox', { name: 'Marca' }).click();
  await page.getByRole('textbox', { name: 'Marca' }).fill('toyoca');
  await page.getByRole('textbox', { name: 'Modelo' }).click();
  await page.getByRole('textbox', { name: 'Modelo' }).fill('baulo');
  await page.getByLabel('Año').selectOption('2009');
  await page.getByRole('button', { name: 'Archivo del manual' }).click();
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();
  await page.getByRole('link', { name: 'Club del 1500 Oficial' }).click();
});