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

En el menu inicial, pulsa diez veces la palabra `ENTRADA`. La clave configurada
en `WISHES_ADMIN_PASSWORD` permite editar texto y fecha y eliminar deseos con
confirmacion. `WISHES_READER_PASSWORD` permite solo consultar el archivo.
Ambas claves se guardan exclusivamente como secretos en Supabase.

## 5. Actualizar un proyecto existente para la entrada 2

Esta version hace publicos los deseos en la entrada 2 del cumpleanos, sin
contrasena, por peticion expresa del propietario. Cualquiera con acceso a la
web o al endpoint de lectura puede leerlos. La tabla mantiene RLS y no permite
acceso directo desde el navegador. Crear deseos sigue funcionando como antes.

1. En SQL Editor, ejecuta
   `supabase/migrations/20261109120000_manage_star_wishes.sql`.
   Solo concede permisos al servidor; no modifica ni borra deseos existentes.
2. En Edge Functions > Secrets, comprueba `WISHES_ADMIN_PASSWORD` y crea
   `WISHES_READER_PASSWORD` con las claves de desarrollador y consulta elegidas.
   Deben ser diferentes. No pongas estas claves en `supabase-config.js`.
3. Vuelve a desplegar la funcion actualizada:

```powershell
npx supabase functions deploy star-wishes --no-verify-jwt --project-ref sqjoojybgkzbvtlhzbep
```

Un push a GitHub/Vercel NO actualiza automaticamente la funcion de Supabase.
La galeria consulta la accion `gallery`, solo de lectura, al entrar, al pulsar
Actualizar y cada 15 segundos mientras esta abierta. No usa localStorage.
Las acciones `update` y `delete` exigen siempre la clave administrativa en el
servidor, incluso si alguien intenta llamarlas fuera de la interfaz.
La accion `list` admite las dos claves y devuelve el rol correspondiente.

Editar la fecha usa la zona horaria local indicada en el formulario y conserva
la precision original si solo cambias el texto. Si otro administrador cambio
el deseo mientras lo editabas, se rechaza la escritura para no sobrescribirlo.
