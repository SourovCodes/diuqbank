export type SessionUser = {
  id: string;
  name: string;
  email: string;
  /** Profile image URL, or null to show initials. */
  image?: string | null;
};
