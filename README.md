# Terranova — promociones WAHA

Backend NestJS, frontend Next.js, MySQL y worker PM2.

1. Configure en `backend/.env` los valores `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`.
2. Desde la raíz, ejecute `npm run db:create`; si ya está dentro de `backend`, use `npm run db:create` sin `--prefix`.
3. Desde la raíz, ejecute `npm run migration:run`; dentro de `backend`, use igualmente `npm run migration:run`.
4. Configure WAHA en `backend/.env` o desde el panel.
5. Desarrollo: `npm run dev:backend` y `npm run dev:frontend` en terminales separadas.

Producción: `npm run build` y `pm2 start backend/ecosystem.config.js`. PM2 inicia el API y el worker automático. El worker revisa la agenda cada minuto y evita duplicados diarios.

### Dejar el cron activo con PM2

```powershell
npm install -g pm2
npm run migration:run
npm run build
pm2 start backend/ecosystem.config.js
pm2 save
pm2 status
pm2 logs terranova-worker
```

El worker debe mostrar una sola instancia. Para comprobar los procesos use `pm2 status`; para reiniciarlos tras cambios use `pm2 restart terranova-api terranova-worker --update-env`. En Linux ejecute además `pm2 startup` y luego el comando que PM2 muestre. En Windows, `pm2 save` conserva la lista, pero para arrancarla al iniciar Windows se debe registrar `pm2 resurrect` en el Programador de tareas o instalar un startup helper de PM2.

Puertos configurados: frontend `3100` y backend `4100`.

## Migraciones

- Aplicar pendientes: `npm run migration:run --prefix backend`
- Revertir la última: `npm run migration:revert --prefix backend`
- Generar una nueva: `npm run migration:generate --prefix backend -- src/database/migrations/NombreMigracion`

El backend usa `synchronize: false`; ningún cambio de esquema se realiza fuera de las migraciones. La base, usuario, contraseña, host y puerto siempre provienen de las variables `DB_*`.

## Comunicación frontend/backend

El frontend consume únicamente la API REST configurada mediante `NEXT_PUBLIC_API_URL`. Todas las llamadas están centralizadas en `frontend/services/api.ts`; los componentes no contienen URLs ni lógica HTTP directa.
