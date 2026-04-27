import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { NavigationHistoryProvider } from "@/components/navigation/NavigationHistoryProvider";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <NavigationHistoryProvider>{children}</NavigationHistoryProvider>
    </ProtectedRoute>
  );
}
