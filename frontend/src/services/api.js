import axios from "axios";

// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://ipl-temple-1.onrender.com/api";

// ============================================================
// AXIOS INSTANCE
// ============================================================

const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    console.log(
      "================================="
    );

    console.log(
      "API REQUEST:",
      config.method?.toUpperCase()
    );

    console.log(
      "BASE URL:",
      config.baseURL
    );

    console.log(
      "ENDPOINT:",
      config.url
    );

    console.log(
      "FULL URL:",
      `${config.baseURL}${config.url}`
    );

    console.log(
      "================================="
    );

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
  (response) => {

    console.log(
      "API RESPONSE:",
      response.status,
      response.config?.url
    );

    return response;
  },

  (error) => {

    console.error(
      "=========================================="
    );

    console.error(
      "API ERROR"
    );

    console.error(
      "=========================================="
    );

    console.error(
      "URL:",
      error.config?.baseURL +
        error.config?.url
    );

    console.error(
      "METHOD:",
      error.config?.method?.toUpperCase()
    );

    console.error(
      "STATUS:",
      error.response?.status
    );

    console.error(
      "BACKEND RESPONSE:",
      error.response?.data
    );

    console.error(
      "BACKEND RESPONSE JSON:",
      JSON.stringify(
        error.response?.data,
        null,
        2
      )
    );

    console.error(
      "ERROR MESSAGE:",
      error.message
    );

    console.error(
      "=========================================="
    );

    // ========================================================
    // NETWORK / CORS ERROR
    // ========================================================

    if (!error.response) {

      console.error(
        "NETWORK/CORS ERROR"
      );

      console.error(
        "The browser could not receive a response from the backend."
      );
    }

    // ========================================================
    // UNAUTHORIZED
    // ========================================================

    if (
      error.response?.status === 401
    ) {

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      window.location.href =
        "/login";
    }

    return Promise.reject(error);
  }
);

export default api
