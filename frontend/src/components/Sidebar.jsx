// import { NavLink } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// function Sidebar({ mobileOpen, setMobileOpen }) {
//   const { user } = useAuth();

//   const menuItems = [
//     {
//       name: "Dashboard",
//       path: "/dashboard",
//       icon: "📊",
//     },
//     {
//       name: "Bank Master",
//       path: "/banks",
//       icon: "🏦",
//     },
//     {
//       name: "Area Master",
//       path: "/areas",
//       icon: "📍",
//     },
//     {
//       name: "Company Master",
//       path: "/companies",
//       icon: "🏢",
//     },
//     {
//       name: "Member Master",
//       path: "/members",
//       icon: "👤",
//     },
//   ];

//   return (
//     <>
//       {mobileOpen && (
//         <div
//           className="sidebar-overlay"
//           onClick={() => setMobileOpen(false)}
//         />
//       )}

//       <aside
//         className={`sidebar ${
//           mobileOpen ? "sidebar-open" : ""
//         }`}
//       >
//         <div className="sidebar-logo">
//           <div className="logo-icon">🛕</div>

//           <div>
//             <h2>Temple</h2>
//             <span>Management</span>
//           </div>
//         </div>

//         <div className="sidebar-user">
//           <div className="user-avatar">
//             {user?.UserName?.charAt(0) ||
//               user?.username?.charAt(0) ||
//               "U"}
//           </div>

//           <div>
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

//         <nav className="sidebar-menu">
//           <p className="menu-title">MAIN MENU</p>

//           {menuItems.map((item) => (
//             <NavLink
//               key={item.path}
//               to={item.path}
//               onClick={() => setMobileOpen(false)}
//               className={({ isActive }) =>
//                 `menu-link ${
//                   isActive ? "active" : ""
//                 }`
//               }
//             >
//               <span className="menu-icon">
//                 {item.icon}
//               </span>

//               <span>{item.name}</span>
//             </NavLink>
//           ))}
//         </nav>
//       </aside>
//     </>
//   );
// }

// export default Sidebar;
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, isAdmin } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "📊",
    },
    {
      name: "Bank Master",
      path: "/banks",
      icon: "🏦",
    },
    {
      name: "Area Master",
      path: "/areas",
      icon: "📍",
    },
    {
      name: "Company Master",
      path: "/companies",
      icon: "🏢",
    },
    {
      name: "Member Master",
      path: "/members",
      icon: "👤",
    },
  ];

  const adminMenuItems = [
    {
      name: "Add User",
      path: "/add-user",
      icon: "👤",
    },
    {
      name: "Users",
      path: "/users",
      icon: "👥",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: "⚙️",
    },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${
          mobileOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-logo">
          <div className="logo-icon">🛕</div>

          <div>
            <h2>Temple</h2>
            <span>Management</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.UserName?.charAt(0) ||
              user?.username?.charAt(0) ||
              "U"}
          </div>

          <div>
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

        <nav className="sidebar-menu">
          <p className="menu-title">MAIN MENU</p>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `menu-link ${
                  isActive ? "active" : ""
                }`
              }
            >
              <span className="menu-icon">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <p className="menu-title admin-title">
                ADMINISTRATION
              </p>

              {adminMenuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `menu-link ${
                      isActive ? "active" : ""
                    }`
                  }
                >
                  <span className="menu-icon">
                    {item.icon}
                  </span>

                  <span>{item.name}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;