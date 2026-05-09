import type { PodcastToolRegistry } from './contracts'
import {
  createErrorResponse,
  createSuccessResponse,
  tryReadMessages,
  writeMessage,
  type JsonRpcId,
  type JsonRpcRequest,
} from './protocol'
import { handlers, toolDefinitions, type ToolName } from './tool-registry'

const SERVER_NAME = 'document-to-podcast'
const SERVER_VERSION = '0.0.1'
const SUPPORTED_PROTOCOL_VERSION = '2024-11-05'

let initialized = false
let buffer = Buffer.alloc(0)

export async function invokeTool<T extends ToolName>(
  name: T,
  input: PodcastToolRegistry[T],
): Promise<unknown> {
  return handlers[name](input)
}

function hasRequestId(request: JsonRpcRequest): request is JsonRpcRequest & { id: JsonRpcId } {
  return Object.prototype.hasOwnProperty.call(request, 'id')
}

function ensureInitialized(request: JsonRpcRequest): boolean {
  if (initialized) {
    return true
  }

  if (hasRequestId(request)) {
    writeMessage(
      createErrorResponse(
        request.id,
        -32002,
        'Server not initialized',
      ),
    )
  }

  return false
}

async function handleRequest(request: JsonRpcRequest): Promise<void> {
  if (request.method === 'notifications/initialized') {
    initialized = true
    return
  }

  if (request.method === 'initialize') {
    initialized = true

    if (!hasRequestId(request)) {
      return
    }

    writeMessage(
      createSuccessResponse(request.id, {
        protocolVersion: SUPPORTED_PROTOCOL_VERSION,
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: SERVER_NAME,
          version: SERVER_VERSION,
        },
      }),
    )
    return
  }

  if (request.method === 'tools/list') {
    if (!ensureInitialized(request) || !hasRequestId(request)) {
      return
    }

    writeMessage(
      createSuccessResponse(request.id, {
        tools: toolDefinitions,
      }),
    )
    return
  }

  if (request.method === 'tools/call') {
    if (!ensureInitialized(request) || !hasRequestId(request)) {
      return
    }

    const toolName = request.params?.name
    const toolArgs = (request.params?.arguments ?? {}) as Record<string, unknown>

    if (typeof toolName !== 'string' || !(toolName in handlers)) {
      writeMessage(
        createErrorResponse(
          request.id,
          -32602,
          'Unknown tool name',
          { toolName },
        ),
      )
      return
    }

    try {
      const result = await invokeTool(toolName as ToolName, toolArgs as never)

      writeMessage(
        createSuccessResponse(request.id, {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
          structuredContent: result,
        }),
      )
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown tool error'
      writeMessage(
        createSuccessResponse(request.id, {
          content: [
            {
              type: 'text',
              text: message,
            },
          ],
          isError: true,
        }),
      )
    }
    return
  }

  if (hasRequestId(request)) {
    writeMessage(createErrorResponse(request.id, -32601, 'Method not found'))
  }
}

async function main(): Promise<void> {
  process.stdin.on('data', (chunk: Buffer | string) => {
    try {
      buffer = Buffer.concat([buffer, Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)])
      const parsed = tryReadMessages(buffer)
      buffer = parsed.remaining

      for (const message of parsed.messages) {
        void handleRequest(message)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid request'
      writeMessage(createErrorResponse(null, -32700, message))
      buffer = Buffer.alloc(0)
    }
  })

  process.stdin.on('end', () => {
    process.exit(0)
  })

  process.stdin.resume()
}

void main()
