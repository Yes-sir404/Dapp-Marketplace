import "./app.css";
import ReactRouters from "./components/Routes/ReactRouters.tsx";
import { NotificationProvider } from "./contexts/NotificationContext";
import GlobalPopupNotificationManager from "./components/GlobalPopupNotificationManager";

function App() {
  return (
    <NotificationProvider>
      <GlobalPopupNotificationManager />
      <ReactRouters />
    </NotificationProvider>
  );
}

export default App;
