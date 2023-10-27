import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ConfirmGlobal from "../Confirm/ConfirmGlobal";
import Header from "./Header";
import Welcome from "./Welcome";

const Layout = () => {
  return (
    <>
      <Header />
      <main>
        <Welcome />
        {/* all the children of the Layout component */}
        <Outlet />
        {/********************************************/}
        <ConfirmGlobal /> {/******* custom confirm modal ********/}
        <ToastContainer
          enableMultiContainer
          containerId={"A"}
          position="bottom-right"
          autoClose={1000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          limit={1}
        />{" "}
        {/******* toast system *****************/}
      </main>
      {/* <Footer /> */}
    </>
  );
};

export default Layout;
