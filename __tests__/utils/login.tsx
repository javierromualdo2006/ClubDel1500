import { act } from "@testing-library/react";
import { AuthContextType } from "@/contexts/auth-context";
import { useAuth } from "@/contexts/auth-context";

// ⚠️ Este hook NO puede ejecutarse directamente fuera de React.
// Por eso exportamos una función que se usa DENTRO del propio test.
export async function login(auth: AuthContextType) {
  await act(async () => {
    await auth.login("admin@gmail.com", "12345678");
  });
}
