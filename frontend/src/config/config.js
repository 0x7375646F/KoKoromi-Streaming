const config = {
  proxyUrl: import.meta.env.VITE_APP_PROXYURL, //future use for m3-u8proxy
};

export const API_BACKEND_URL =
  import.meta.env.VITE_APP_MODE &&
  import.meta.env.VITE_APP_MODE === "development"
    ?  import.meta.env.VITE_APP_BACKEND_LOCALURL || "http://localhost:6969/api"
    : import.meta.env.VITE_APP_BACKEND;

export const API_ANIME_URL =
  import.meta.env.VITE_APP_MODE &&
  import.meta.env.VITE_APP_MODE === "development"
    ? import.meta.env.VITE_APP_LOCALURL || "http://localhost:3030/api/v1"
    : import.meta.env.VITE_APP_SERVERURL;

export default config;
