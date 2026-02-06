export type DiskUsage = {
    path: string;
    total: number | null;
    free: number | null;
    used: number | null;
};

export type ServerStatusData = {
    generatedAt: string;
    system: {
        hostname: string | null;
        os: string | null;
        kernel: string | null;
        architecture: string | null;
        uptime_seconds: number | null;
    };
    load: {
        one: number | null;
        five: number | null;
        fifteen: number | null;
    };
    cpu: {
        cores: number | null;
        usage_percent: number | null;
        model: string | null;
    };
    memory: {
        total: number | null;
        available: number | null;
        used: number | null;
    };
    disk: {
        base: DiskUsage;
        storage: DiskUsage;
    };
    runtime: {
        php_version: string;
        php_sapi: string;
        laravel_version: string;
        timezone: string | null;
    };
    config: {
        app_name: string | null;
        env: string;
        server_software: string | null;
        memory_limit: string | null;
        post_max_size: string | null;
        upload_max_filesize: string | null;
        max_execution_time: string | null;
        extensions_count: number;
    };
};
