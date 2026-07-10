export declare enum UserRole {
    CUSTOMER = "CUSTOMER",
    ADMIN = "ADMIN"
}
export declare class User {
    id: string;
    username: string;
    passwordHash: string;
    email: string;
    name: string;
    gender: string;
    phoneNumber: string;
    dob: string;
    role: UserRole;
    refreshTokenHash: string | null;
    createdAt: Date;
    updatedAt: Date;
}
