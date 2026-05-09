import {
  cancelPodcastJob,
  createPodcastJob,
  getPodcastJob,
  getPodcastResult,
  listPodcastJobs,
  previewPodcastPlan,
} from './tool-handlers'
import type { PodcastToolRegistry } from './contracts'

export type ToolName = keyof PodcastToolRegistry

export type ToolHandler<T extends ToolName> = (
  input: PodcastToolRegistry[T],
) => Promise<unknown>

export interface ToolDefinition {
  name: ToolName
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
    additionalProperties: boolean
  }
}

const sourceProperties = {
  type: {
    type: 'string',
    enum: ['file', 'url', 'text'],
  },
  path: {
    type: 'string',
    description: '当 type=file 时传入绝对路径或相对项目根路径。',
  },
  url: {
    type: 'string',
    description: '当 type=url 时传入网页链接。',
  },
  title: {
    type: 'string',
    description: '可选。文本来源的标题。',
  },
  content: {
    type: 'string',
    description: '当 type=text 时传入纯文本内容。',
  },
}

const configProperties = {
  language: {
    type: 'string',
  },
  duration_minutes: {
    type: 'integer',
    minimum: 1,
    maximum: 120,
  },
  format: {
    type: 'string',
    enum: ['dialogue', 'monologue', 'debate', 'brief'],
  },
  audience: {
    type: 'string',
  },
  tone: {
    type: 'string',
  },
  focus: {
    type: 'string',
  },
  speaker_count: {
    type: 'integer',
    enum: [1, 2],
  },
  include_intro: {
    type: 'boolean',
  },
  include_outro: {
    type: 'boolean',
  },
}

export const toolDefinitions: ToolDefinition[] = [
  {
    name: 'create_podcast_job',
    description:
      '创建文档转播客任务。输入一个或多个来源以及播客配置，返回异步任务 ID 和初始状态。',
    inputSchema: {
      type: 'object',
      properties: {
        sources: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: sourceProperties,
            required: ['type'],
            additionalProperties: false,
          },
        },
        config: {
          type: 'object',
          properties: configProperties,
          required: ['language', 'duration_minutes', 'format'],
          additionalProperties: false,
        },
      },
      required: ['sources', 'config'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_podcast_job',
    description: '根据 job_id 查询播客任务状态、执行阶段、进度与错误信息。',
    inputSchema: {
      type: 'object',
      properties: {
        job_id: {
          type: 'string',
          description: '播客任务 ID。',
        },
      },
      required: ['job_id'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_podcast_result',
    description: '获取已完成播客任务的最终结果，包括音频链接、文稿链接与摘要。',
    inputSchema: {
      type: 'object',
      properties: {
        job_id: {
          type: 'string',
          description: '播客任务 ID。',
        },
      },
      required: ['job_id'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_podcast_jobs',
    description: '列出最近的播客生成任务，便于在未提供 job_id 时查找最近任务。',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 50,
          description: '返回的任务数量上限。',
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: 'cancel_podcast_job',
    description: '取消尚未完成的播客任务。',
    inputSchema: {
      type: 'object',
      properties: {
        job_id: {
          type: 'string',
          description: '播客任务 ID。',
        },
      },
      required: ['job_id'],
      additionalProperties: false,
    },
  },
  {
    name: 'preview_podcast_plan',
    description: '只生成播客提纲和角色规划，不生成最终音频，适合用户先看讲述结构。',
    inputSchema: {
      type: 'object',
      properties: {
        sources: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            properties: sourceProperties,
            required: ['type'],
            additionalProperties: false,
          },
        },
        config: {
          type: 'object',
          properties: configProperties,
          required: ['language', 'duration_minutes', 'format'],
          additionalProperties: false,
        },
      },
      required: ['sources', 'config'],
      additionalProperties: false,
    },
  },
]

export const handlers: { [K in ToolName]: ToolHandler<K> } = {
  create_podcast_job: createPodcastJob,
  get_podcast_job: getPodcastJob,
  get_podcast_result: getPodcastResult,
  list_podcast_jobs: listPodcastJobs,
  cancel_podcast_job: cancelPodcastJob,
  preview_podcast_plan: previewPodcastPlan,
}
