import jwtDecode from "jwt-decode";

interface DecodedToken {
  id: string;
}

export const getUserIdFromToken = (token: string): string | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.id;
  } catch (error) {
    return null;
  }
};
