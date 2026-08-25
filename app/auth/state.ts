export interface AuthActionState {
  readonly status: "idle" | "error" | "success";
  readonly message: string;
}

export const INITIAL_AUTH_STATE: AuthActionState = { status: "idle", message: "" };
