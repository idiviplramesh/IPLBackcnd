// import { useAuth } from "../context/AuthContext";

// function Navbar({ setMobileOpen }) {
//   const { user, logout } = useAuth();

//   return (
//     <header className="navbar">
//       <button
//         className="mobile-menu-button"
//         onClick={() => setMobileOpen(true)}
//       >
//         ☰
//       </button>

//       <div className="navbar-title">
//         <h1>Temple Management System</h1>
//         <p>Administration Panel</p>
//       </div>

//       <div className="navbar-right">
//         <div className="navbar-user">
//           <div className="navbar-avatar">
//             {user?.UserName?.charAt(0) ||
//               user?.username?.charAt(0) ||
//               "U"}
//           </div>

//           <div className="navbar-user-info">
//             <strong>
//               {user?.UserName ||
//                 user?.username ||
//                 "User"}
//             </strong>

//             <small>
//               {user?.UserType ||
//                 user?.role ||
//                 "User"}
//             </small>
//           </div>
//         </div>

//         <button
//           className="logout-button"
//           onClick={logout}
//         >
//           Logout
//         </button>
//       </div>
//     </header>
//   );
// }

// export default Navbar;

import { useAuth } from "../context/AuthContext";

function Navbar({ setMobileOpen }) {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <button
        className="mobile-menu-button"
        onClick={() => setMobileOpen(true)}
      >
        ☰
      </button>

      <div className="navbar-title">
        <h1>Temple Management System</h1>
        <p>Administration Panel</p>
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-avatar">
            {user?.UserName?.charAt(0) ||
              user?.username?.charAt(0) ||
              "U"}
          </div>

          <div className="navbar-user-info">
            <strong>
              {user?.UserName ||
                user?.username ||
                "User"}
            </strong>

            <small>
              {user?.UserType ||
                user?.role ||
                "User"}
            </small>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;