import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// REQUEST
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
      "API REQUEST:",
      config.method?.toUpperCase(),
      `${config.baseURL}${config.url}`
    );

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// RESPONSE
// ============================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    console.error(
      "=========================================="
    );

    console.error("API ERROR");

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

    // IMPORTANT:
    // Print the actual object as JSON
    console.error(
      "BACKEND RESPONSE JSON:",
      JSON.stringify(
        error.response?.data,
        null,
        2
      )
    );

    console.error(
      "=========================================="
    );

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

export default api;