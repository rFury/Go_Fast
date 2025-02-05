export interface User {
    _id?: string;
    username?: string;
    email: string;
    role: "USER" | "DELIVERY" | "STOCKING";
    last_name: string;
    first_name: string;
    image?: string;
    password: string;
    isActive?: boolean;

  }
  