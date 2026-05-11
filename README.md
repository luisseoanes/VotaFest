# VotaFest 2026 🗳️

Aplicación de votación interactiva para el evento académico VotaFest de la UPB.

## Inicio rápido

### 1. Iniciar el backend (Python/FastAPI)
```
Doble clic en: start-backend.bat
```
O manualmente:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Iniciar el frontend (React)
```
Doble clic en: start-frontend.bat
```
O manualmente:
```bash
cd frontend
npm install
npm run dev
```

### 3. Abrir la aplicación
- Público (votar): http://localhost:3000/votar
- Landing: http://localhost:3000
- Admin: http://localhost:3000/admin

## Credenciales admin
- **Usuario:** `admin`
- **Contraseña:** `votafest2026`

## Flujo del evento

1. El presentador abre el **Panel de Administración** (`/admin/dashboard`)
2. Crea una pregunta o usa las plantillas incluidas
3. Activa la pregunta (botón "Activar")
4. Los participantes entran a `/votar` en sus celulares
5. Votan y ven los resultados en tiempo real
6. El presentador puede pausar o activar la siguiente pregunta

## Estructura del proyecto

```
votafest/
├── backend/
│   ├── main.py          # API FastAPI completa
│   ├── requirements.txt
│   └── votafest.db      # Base de datos SQLite (se crea automáticamente)
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx       # Página principal informativa
│   │   │   ├── Vote.jsx          # Pantalla de votación pública
│   │   │   ├── AdminLogin.jsx    # Login del administrador
│   │   │   └── AdminDashboard.jsx # Panel de control
│   │   └── components/
│   │       └── Navbar.jsx
│   └── package.json
├── start-backend.bat
└── start-frontend.bat
```

## Colores de opciones
- 🟢 **Verde** — Respuestas positivas (Sí, De acuerdo)
- 🔴 **Rojo** — Respuestas negativas (No, En desacuerdo)
- 🟡 **Amarillo** — Respuestas neutras (Tal vez, No sé)
- 🔵 **Teal** — Opción adicional
- 🟠 **Naranja** — Opción adicional
