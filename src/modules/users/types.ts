import type { Role } from "../../types/roles";

export type PublicUser = {
    id: string;
    name: string;
    username: string;
    email: string;
    role: Role;
    bio: string | null;
    imageUrl: string | null;
    imagePublicId: string | null;
    themeId: string | null;
};