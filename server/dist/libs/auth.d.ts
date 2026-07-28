export declare const auth: import("better-auth").Auth<{
    database: (options: import("better-auth").BetterAuthOptions) => import("better-auth").DBAdapter<import("better-auth").BetterAuthOptions>;
    emailAndPassword: {
        enabled: true;
    };
    socialProviders: {
        google: {
            enabled: boolean;
            clientId: string;
            clientSecret: string;
        };
    };
    trustedOrigins: string[];
}>;
export default auth;
//# sourceMappingURL=auth.d.ts.map