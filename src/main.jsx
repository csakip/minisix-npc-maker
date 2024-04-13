import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import TopMenu from "./routes/TopMenu";
import Initiatives from "./routes/Initiatives";
import Npc from "./routes/Npc";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <TopMenu>
          <Initiatives />
        </TopMenu>
      ),
    },
    {
      path: "/npc",
      element: (
        <TopMenu>
          <Npc />
        </TopMenu>
      ),
    },
  ],
  { basename: "/minisix-npc-maker" }
);

ReactDOM.createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
