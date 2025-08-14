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
  await page.getByRole('button', { name: 'Gestión de Usuarios' }).click();
  await page.locator('div').filter({ hasText: /^usuario@sistema\.comEstado:ActivoPermisos de AdminUsuario Activo$/ }).getByRole('switch').first().click();
  await page.getByText('Admin', { exact: true }).nth(2).click();
  await page.locator('div').filter({ hasText: /^usuario@sistema\.comEstado:ActivoPermisos de AdminUsuario Activo$/ }).getByRole('switch').first().click();
  await page.getByText('Usuario', { exact: true }).first().click();
  await page.getByText('usuarioUsuariousuario@sistema').click();
  await page.locator('div').filter({ hasText: /^usuario@sistema\.comEstado:ActivoPermisos de AdminUsuario Activo$/ }).getByRole('switch').nth(1).click();
  await page.getByText('Inactivo').first().click();
  await page.locator('div').filter({ hasText: /^usuario@sistema\.comEstado:InactivoPermisos de AdminUsuario Activo$/ }).getByRole('switch').nth(1).click();
  await page.getByText('Activo', { exact: true }).nth(1).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();
  await page.getByRole('banner').locator('div').first().click();
});