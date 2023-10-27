import { Outlet } from "react-router-dom";
// import LoginHeader from "../Login/LoginHeader";
// import Footer from "./Footer";

const Layout2 = () => {
  return (
    <>
      {/* <LoginHeader /> */}
      <main>
        {/* all the children of the Layout component */}
        <Outlet />
      </main>
      {/* <Footer /> */}
    </>
  );
};

export default Layout2;
