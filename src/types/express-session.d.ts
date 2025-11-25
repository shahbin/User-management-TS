import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };

    admin?: {
      _id: string;
      name: string;
      email: string;
      role: string;
    } | null;

    toast?: string | null;
    toastError?: string | null;
    pwdError?: string | null;
    openPwdModal?: boolean | null;
  }
}
