import * as ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "./style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import TopMenu from "./common/TopMenu";
import Initiatives from "./initiative/InitiativesPage";
import Npc from "./npcs/Npc";

const router = createHashRouter([
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
]);

ReactDOM.createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
