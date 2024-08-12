import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Location from "./pages/Location";
import Main from "./pages/Main";

const router = createBrowserRouter([
  {
    path: "/location/:id",
    element: <Location />,
  },
  {
    path: "/",
    element: <Main />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
