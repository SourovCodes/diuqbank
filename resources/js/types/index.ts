export type * from './auth';
export type * from './contributor';
export type * from './flash';
export type * from './pagination';
export type * from './question';

import type { Auth } from './auth';

export type SharedData = {
    name: string;
    auth: Auth;
    [key: string]: unknown;
};
