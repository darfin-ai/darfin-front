import { RouterProvider } from "react-router";
import { ThemeProvider } from "next-themes";
import { router } from "./routes";
import { AuthProvider } from "./features/auth";
import { LocaleProvider } from "./shared/i18n";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="darfin-theme">
      <LocaleProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
