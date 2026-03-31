
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { warmUpServices } from "./app/utils/api";

  warmUpServices();
  createRoot(document.getElementById("root")!).render(<App />);
  