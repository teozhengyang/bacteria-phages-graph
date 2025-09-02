interface AppConfig {
  host: string;
  port: number;
}

// host and port config
const appConfig : AppConfig = {
  host: process.env.APP_HOST ?? "localhost",
  port: parseInt(process.env.APP_PORT ?? "3000"),
};

export default appConfig;