export const appConfig = () => ({
  port: Number(process.env.PORT ?? 3000),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV ?? 'development',
});
