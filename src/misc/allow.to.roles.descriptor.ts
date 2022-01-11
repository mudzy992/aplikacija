import { SetMetadata } from "@nestjs/common";

export const AllowToRoles = (...roles: ('administrator' | 'user')[]) => {
     return SetMetadata('allow_to_roles', roles);
};

/* uzima ili administrator ili user (ili oboje), kao niz takvih argumenata, te ih pretvara u pojedinačne
elemente i setuje u metadata koji se zove allow_to_roles, spisak tih rolova */