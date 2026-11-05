# Backend deployment

## Render

1. Create a PostgreSQL database on Render.
2. Apply [`schema.sql`](./schema.sql) to the database.
3. In Render, create a Blueprint from this repository and provide:
   - `DATABASE_URL`: the database's internal connection URL if the database is on Render.
   - `CORS_ORIGINS`: the deployed Vercel site origin, such as `https://your-site.vercel.app`. Add additional origins as a comma-separated list if needed.
4. After the web service deploys, verify `https://your-service.onrender.com/health` returns `{"status":"ok"}`.

The Blueprint uses `backend` as the service root, `npm ci` to install dependencies, and `npm start` to run the API. Render supplies the listening `PORT`.

For local development, run `npm install` and `npm run dev` from `backend`. The API listens on port 3000 by default. Configure database access with `DATABASE_URL`, or with `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, and `PGDATABASE`. Set `PGSSLMODE=require` when the database requires SSL.

## Vercel frontend

Set the Vercel project environment variable `VITE_API_URL` to the deployed Render service URL, for example `https://your-service.onrender.com`, then redeploy the frontend.
