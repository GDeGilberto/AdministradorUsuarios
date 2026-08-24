# 👥 Administrador de Usuarios

Este es un monorepo que unifica el sistema de administración de usuarios, compuesto por un backend en **.NET 9.0** y un frontend en **Angular v20**.

---

## 📋 Prerrequisitos

Para ejecutar y compilar este proyecto, asegúrate de tener instalado el software correspondiente según el método que elijas:

### Opción A: Ejecución con Docker (Recomendada)
Para levantar todo el proyecto con un solo comando (Base de datos, Backend y Frontend):
* **Docker Desktop**: Descárgalo e instálalo desde [docker.com](https://www.docker.com/products/docker-desktop/).
  * *Nota para Windows:* Asegúrate de tener habilitado **WSL 2** (Windows Subsystem for Linux) durante la instalación.
  * Al instalar Docker Desktop, se incluyen de forma automática los comandos `docker` y `docker compose`.

### Opción B: Ejecución Local (Sin Docker)
Si prefieres ejecutar los servicios directamente en tu máquina local:
* **.NET 9.0 SDK**: Descárgalo desde [dotnet.microsoft.com](https://dotnet.microsoft.com/download/dotnet/9.0).
* **Node.js (versión 20 o superior)**: Descárgalo desde [nodejs.org](https://nodejs.org/).
* **SQL Server**: Un motor local instalado (Express o Developer Edition) o una cadena de conexión a un servidor accesible.

---

## ⚡ Instalación y Ejecución Rápida (con Docker)

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd AdministradorUsuarios
   ```

2. **Configurar las variables de entorno:**
   Crea una copia del archivo `.env.example` y nómbrala `.env` en la raíz del proyecto. Si es necesario, personaliza las contraseñas, puertos o nombres:
   ```bash
   cp .env.example .env
   ```

3. **Levantar el proyecto completo:**
   Asegúrate de tener Docker abierto en tu máquina y ejecuta:
   ```bash
   docker compose up --build
   ```
   *Este comando descargará las imágenes necesarias, compilará el backend y frontend en contenedores, y conectará la base de datos de SQL Server de manera automática.*

4. **Acceso a los servicios:**
   * 🌐 **Frontend (Angular):** Accede a [http://localhost:4200](http://localhost:4200) (o el puerto configurado en `FRONTEND_PORT`).
   * ⚙️ **Backend API (.NET):** Endpoint y documentación de Swagger en [http://localhost:8080](http://localhost:8080).

---

## 💻 Desarrollo Local (Sin Docker)

Si prefieres ejecutar y depurar los proyectos por separado en tu entorno de desarrollo:

### 1. Iniciar la Base de Datos
* Asegúrate de tener SQL Server corriendo localmente y actualiza los valores del servidor y credenciales en tu archivo `.env`.

### 2. Iniciar el Backend (.NET)
Desde la raíz del monorepo:
```bash
cd backend
dotnet restore
dotnet run --project API/API.csproj
```
El backend buscará de manera automática el archivo `.env` en el directorio padre, por lo que cargará tus credenciales locales de forma transparente y creará la base de datos automáticamente si no existe.

### 3. Iniciar el Frontend (Angular)
Desde la raíz del monorepo en otra terminal:
```bash
cd frontend
npm install
npm start
```
La aplicación de Angular estará disponible en [http://localhost:4200](http://localhost:4200).
