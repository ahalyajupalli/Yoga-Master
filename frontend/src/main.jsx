import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import AuthProvider from "./utilities/providers/AuthProvider";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

import "react-toastify/dist/ReactToastify.css";
import Aos from "aos";
import router from "./routes/router";

Aos.init();
ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </AuthProvider>
);

export default router;
