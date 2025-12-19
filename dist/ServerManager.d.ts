/**
 * ServerManager - Управление игровыми серверами
 *
 * Этот сервис отвечает за:
 * - Хранение списка серверов в localStorage
 * - Проверку доступности серверов
 * - Кэширование статуса серверов
 * - Управление выбранным сервером
 */
/**
 * Информация о сервере
 */
export interface ServerInfo {
    /** Уникальный идентификатор сервера */
    id: string;
    /** Отображаемое имя сервера */
    name: string;
    /** Хост сервера */
    host: string;
    /** Порт сервера */
    port: number;
    /** Является ли сервер дефолтным (нельзя удалить) */
    isDefault?: boolean;
    /** Время добавления сервера */
    addedAt: number;
}
/**
 * Статус доступности сервера
 */
export interface ServerStatus {
    /** ID сервера */
    serverId: string;
    /** Доступен ли сервер */
    isAvailable: boolean;
    /** Задержка соединения (мс) */
    latency?: number;
    /** Время последней проверки */
    lastChecked: number;
    /** Текст ошибки (если недоступен) */
    error?: string;
}
/**
 * Список серверов по умолчанию
 */
export declare const DEFAULT_SERVERS: ServerInfo[];
/**
 * Менеджер серверов
 *
 * Управляет списком игровых серверов, проверяет их доступность
 * и сохраняет настройки в localStorage.
 *
 * @example
 * ```typescript
 * // Получить список серверов
 * const servers = ServerManager.getServers();
 *
 * // Добавить новый сервер
 * const newServer = ServerManager.addServer({
 *   name: "My Server",
 *   host: "192.168.1.100",
 *   port: 8080
 * });
 *
 * // Проверить доступность
 * const status = await ServerManager.checkServerAvailability(newServer);
 * ```
 */
export declare class ServerManager {
    private static STORAGE_KEY;
    private static STATUS_CACHE_KEY;
    private static SELECTED_SERVER_KEY;
    private static CACHE_DURATION;
    /**
     * Получить список всех серверов
     *
     * @returns Массив серверов из localStorage или дефолтные серверы
     */
    static getServers(): ServerInfo[];
    /**
     * Сохранить список серверов
     *
     * @param servers - Массив серверов для сохранения
     */
    static saveServers(servers: ServerInfo[]): void;
    /**
     * Добавить новый сервер
     *
     * @param server - Данные сервера (без id и addedAt)
     * @returns Созданный сервер с генерированным id
     */
    static addServer(server: Omit<ServerInfo, "id" | "addedAt">): ServerInfo;
    /**
     * Удалить сервер
     *
     * @param serverId - ID сервера для удаления
     * @note Дефолтные серверы не могут быть удалены
     */
    static removeServer(serverId: string): void;
    /**
     * Обновить данные сервера
     *
     * @param serverId - ID сервера для обновления
     * @param updates - Частичные обновления
     */
    static updateServer(serverId: string, updates: Partial<ServerInfo>): void;
    /**
     * Получить WebSocket URL для сервера
     *
     * @param server - Информация о сервере
     * @returns WebSocket URL (ws:// или wss://)
     */
    static getServerUrl(server: ServerInfo): string;
    /**
     * Проверить доступность сервера
     *
     * Пытается установить WebSocket соединение и измеряет latency.
     *
     * @param server - Информация о сервере
     * @returns Статус доступности
     */
    static checkServerAvailability(server: ServerInfo): Promise<ServerStatus>;
    /**
     * Получить закэшированный статус сервера
     *
     * @param serverId - ID сервера
     * @returns Статус или null если кэш устарел/отсутствует
     */
    static getCachedStatus(serverId: string): ServerStatus | null;
    /**
     * Сохранить статус в кэш
     *
     * @param status - Статус сервера
     */
    static cacheStatus(status: ServerStatus): void;
    /**
     * Получить ID выбранного сервера
     *
     * @returns ID сервера или null
     */
    static getSelectedServerId(): string | null;
    /**
     * Установить выбранный сервер
     *
     * @param serverId - ID сервера
     */
    static setSelectedServerId(serverId: string): void;
    /**
     * Очистить выбранный сервер
     */
    static clearSelectedServer(): void;
    /**
     * Получить выбранный сервер
     *
     * @returns Информация о выбранном сервере или null
     */
    static getSelectedServer(): ServerInfo | null;
}
//# sourceMappingURL=ServerManager.d.ts.map