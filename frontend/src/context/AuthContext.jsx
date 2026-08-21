// import {
//   createContext,
//   useContext,
//   useState,
// } from "react";

// const AuthContext =
//   createContext(null);

// export function AuthProvider({
//   children,
// }) {
//   const [token, setToken] =
//     useState(
//       localStorage.getItem("token")
//     );

//   const [user, setUser] =
//     useState(() => {
//       try {
//         const savedUser =
//           localStorage.getItem(
//             "user"
//           );

//         return savedUser
//           ? JSON.parse(savedUser)
//           : null;
//       } catch {
//         return null;
//       }
//     });

//   // =====================================================
//   // LOGIN
//   // =====================================================

//   const login = (
//     loginResponse
//   ) => {
//     const newToken =
//       loginResponse?.token ||
//       loginResponse?.accessToken;

//     const newUser =
//       loginResponse?.user ||
//       loginResponse?.data?.user ||
//       null;

//     if (!newToken) {
//       throw new Error(
//         "Token not returned by server"
//       );
//     }

//     localStorage.setItem(
//       "token",
//       newToken
//     );

//     if (newUser) {
//       localStorage.setItem(
//         "user",
//         JSON.stringify(newUser)
//       );
//     }

//     setToken(newToken);
//     setUser(newUser);
//   };

//   // =====================================================
//   // LOGOUT
//   // =====================================================

//   const logout = () => {
//     localStorage.removeItem(
//       "token"
//     );

//     localStorage.removeItem(
//       "user"
//     );

//     setToken(null);
//     setUser(null);
//   };

//   // =====================================================
//   // USER TYPE
//   // =====================================================

//   const userType = String(
//     user?.UserType || ""
//   )
//     .trim()
//     .toUpperCase();

//   const isAdmin =
//     userType === "ADMIN";

//   // =====================================================
//   // CONTEXT
//   // =====================================================

//   return (
//     <AuthContext.Provider
//       value={{
//         token,
//         user,
//         login,
//         logout,

//         isAuthenticated:
//           !!token,

//         isAdmin,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// // =====================================================
// // USE AUTH
// // =====================================================

// export function useAuth() {
//   return useContext(
//     AuthContext
//   );
// }
import {
  createContext,
  useContext,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem("user");

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch {
      return null;
    }
  });

  const login = (loginResponse) => {

    const newToken =
      loginResponse?.token ||
      loginResponse?.accessToken;

    const newUser =
      loginResponse?.user ||
      loginResponse?.data?.user ||
      null;

    if (!newToken) {
      throw new Error(
        "Token not returned by server"
      );
    }

    localStorage.setItem(
      "token",
      newToken
    );

    if (newUser) {
      localStorage.setItem(
        "user",
        JSON.stringify(newUser)
      );
    }

    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  // =====================================================
  // ADMIN CHECK
  // =====================================================

  const isAdmin =
    String(
      user?.UserType || ""
    )
      .trim()
      .toUpperCase() === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        isAuthenticated: !!token,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}