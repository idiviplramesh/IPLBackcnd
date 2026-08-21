import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.username.trim()) {
      setError("Please enter username");
      return;
    }

    if (!form.password) {
      setError("Please enter password");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/login",
        {
          username: form.username.trim(),
          password: form.password,
        }
      );

      login(response.data);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="temple-symbol">🛕</div>

        <h1>Temple Management</h1>

        <p>
          Manage your temple administration

        </p>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
        

            <h2>Welcome Back</h2>

            <p>
              Sign in to your administrator account
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>

              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="primary-button login-button"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;