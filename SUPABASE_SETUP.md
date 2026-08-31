# Archivo de deseos con Supabase

La web envia los deseos a una Edge Function. La tabla no ofrece acceso directo
al navegador y la contrasena administrativa no se publica en GitHub.

## 1. Crear la tabla

1. Crea un proyecto en Supabase.
2. Abre `SQL Editor` en el panel del proyecto.
3. Copia y ejecuta el contenido de `supabase/setup.sql`.

## 2. Configurar y publicar la funcion

Desde una terminal situada en la carpeta del proyecto:

```powershell
npx supabase login
npx supabase secrets set WISHES_ADMIN_PASSWORD=TU_CONTRASENA_PRIVADA --project-ref TU_PROJECT_REF
npx supabase functions deploy star-wishes --no-verify-jwt --project-ref TU_PROJECT_REF
```

`TU_PROJECT_REF` aparece en `Project Settings > General` dentro de Supabase.
Sustituye `TU_CONTRASENA_PRIVADA` por la clave elegida al ejecutar el comando.
El valor se guarda como secreto remoto y no se incluye en ningun archivo del
repositorio.

## 3. Conectar la pagina

En `supabase-config.js`, sustituye `TU-PROYECTO` por el identificador del
proyecto. La URL final tendra esta forma:

```text
https://TU_PROJECT_REF.supabase.co/functions/v1/star-wishes
```

## 4. Consultar deseos

En el menu inicial, pulsa diez veces la palabra `ENTRADA`. Introduce la
contrasena configurada como secreto para ver cada deseo junto a su fecha y hora.
