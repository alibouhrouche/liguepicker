import {
    createBrowserRouter,
} from "react-router-dom";
import Root from "./root";
// import Home from "./home";
import ErrorPage from "../error-page";
import React from "react";
// import Cardview from "./cardview";
// import Exif from "./Image/Exif";
// import ErrorPage from "../error-page";

const router = createBrowserRouter([
    {
      // path: "/",
      Component: Root,
      errorElement: React.createElement(ErrorPage),
      children: [
            // {
            //     path: "/",
            //     Component: Home,
            // },
            // {
            //     path: "/image/exif",
            //     lazy: () => import("./Image/Exif"),
            // },
            // {
            //     path: "/pdf/flat",
            //     lazy: () => import("./pdf/Flat"),
            // },
            // {
            //     path: "/clipboard",
            //     lazy: () => import("./Clipboard"),
            // },
            {
                path: "/",
                lazy: () => import("./Picker"),
            },
            {
                path: "/edit",
                lazy: () => import("./Picker/Picker"),
            },
            {
                path: "/result",
                lazy: () => import("./Picker/Result"),
            }
      ]
    }
]);

export default router;