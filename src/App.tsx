import { AppRouter } from "@/app/router";
import { useOfflineSync } from "@/hooks/useOfflineSync";

export default function App() {
  useOfflineSync();

  return <AppRouter />;
}
