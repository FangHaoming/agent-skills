import type { PodcastTranscript } from '../../contracts/podcast'
import type { ScriptGenerator, GenerateScriptInput } from './types'

function buildSummary(input: GenerateScriptInput): string {
  const focus = input.config.focus ?? '核心主题'
  return `这是一份基于 ${input.documents.length} 份资料生成的 stub 播客脚本，重点讲解 ${focus}。`
}

export class StubScriptGenerator implements ScriptGenerator {
  async generate(input: GenerateScriptInput): Promise<PodcastTranscript> {
    const focus = input.config.focus ?? '核心主题'
    const sourceTitles = input.documents.map((document) => document.title).join('、')
    const dialogue = input.config.format !== 'monologue'

    return {
      title: `${focus} 播客脚本`,
      summary: buildSummary(input),
      sections: [
        {
          heading: '开场',
          lines: dialogue
            ? [
                {
                  speaker: 'host',
                  text: `今天我们围绕 ${focus} 展开，资料来源包括 ${sourceTitles}。`,
                },
                {
                  speaker: 'guest',
                  text: '我会先拆解实现链路，再补充适合工程落地的做法。',
                },
              ]
            : [
                {
                  speaker: 'host',
                  text: `今天我们围绕 ${focus} 展开，资料来源包括 ${sourceTitles}。`,
                },
              ],
        },
        {
          heading: '主体',
          lines: [
            {
              speaker: 'host',
              text: `当前目标受众是 ${input.config.audience ?? 'general-audience'}。`,
            },
            {
              speaker: dialogue ? 'guest' : 'host',
              text: '后续接入真实 LLM 时，这里会替换为结构化脚本生成结果。',
            },
          ],
        },
      ],
    }
  }
}
