import type { MessageSender } from '@zenda/shared'
import { sendToWorkspace, isWorkspaceConnected } from '../modules/whatsapp/connection-manager.js'

/**
 * Concrete MessageSender that delivers events over WebSocket.
 * This is the current (WhatsApp bridge) transport.
 * Future channels (SMS, email, push) get their own implementations.
 */
export const wsMessageSender: MessageSender = {
  send(workspaceId: string, data: unknown): boolean {
    return sendToWorkspace(workspaceId, data)
  },

  isConnected(workspaceId: string): boolean {
    return isWorkspaceConnected(workspaceId)
  },
}
