/**
 * WebSocket Modules - Barrel Export
 *
 * Экспортирует модули для работы с WebSocket соединением.
 * Эти модули используются WebSocketService через композицию.
 */
export { MessageQueue } from "./MessageQueue";
export type { QueuedMessage, MessageQueueConfig, EnqueueOptions, } from "./MessageQueue";
export { ConnectionMetrics } from "./ConnectionMetrics";
export type { WebSocketMetrics, ConnectionMetricsConfig, } from "./ConnectionMetrics";
export { HeartbeatManager } from "./HeartbeatManager";
export type { HeartbeatConfig, SendPingFn, OnTimeoutFn, OnPongFn, } from "./HeartbeatManager";
export { ReconnectionManager } from "./ReconnectionManager";
export type { ReconnectionConfig, ReconnectFn, OnAttemptFn, OnMaxAttemptsReachedFn, ReconnectionState, } from "./ReconnectionManager";
//# sourceMappingURL=index.d.ts.map