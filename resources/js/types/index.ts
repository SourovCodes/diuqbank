export type * from './auth';
export type * from './flash';
export type * from './pagination';

import type { Auth } from './auth';

export type SharedData = {
    name: string;
    auth: Auth;
    [key: string]: unknown;
};
