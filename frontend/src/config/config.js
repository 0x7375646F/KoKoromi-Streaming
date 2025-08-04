const config = {
  serverUrl: import.meta.env.VITE_APP_SERVERURL,
  localUrl: import.meta.env.VITE_APP_LOCALURL || "http://localhost:3030/api/v1",
  proxyUrl: import.meta.env.VITE_APP_PROXYURL,
  authUrl: import.meta.env.VITE_APP_AUTHURL || "http://172.17.0.1:6969/api",
};

export default config;
