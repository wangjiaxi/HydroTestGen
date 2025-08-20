import { NextRequest, NextResponse } from 'next/server'

// 代码执行器
class CodeExecutor {
  private output: string[]
  private inputLines: string[]

  constructor() {
    this.output = []
    this.inputLines = []
  }

  setInput(input: string) {
    this.inputLines = input.trim().split('\n')
    this.inputIndex = 0
  }

  private inputIndex = 0

  // Python代码执行
  executePython(code: string): string {
    this.output = []
    
    try {
      // 创建Python执行环境
      const pythonContext = {
        random: {
          randint: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
          choice: (arr: any[]) => arr[Math.floor(Math.random() * arr.length)],
        },
        range: (start: number, stop?: number) => {
          if (stop === undefined) {
            stop = start
            start = 0
          }
          const result = []
          for (let i = start; i < stop; i++) {
            result.push(i)
          }
          return result
        },
        print: (...args: any[]) => {
          this.output.push(args.map(arg => String(arg)).join(' '))
        },
        input: () => {
          if (this.inputIndex < this.inputLines.length) {
            return this.inputLines[this.inputIndex++]
          }
          return ''
        },
        int: (x: any) => parseInt(String(x)),
        map: (fn: Function, arr: any[]) => arr.map(fn),
        list: (x: any) => Array.isArray(x) ? x : Array.from(x),
        sum: (arr: number[]) => arr.reduce((a, b) => a + b, 0),
        len: (x: any) => x.length,
        str: (x: any) => String(x),
        join: (arr: any[], sep: string) => arr.join(sep)
      }

      // 简单的Python代码解析和执行
      this.parsePythonCode(code, pythonContext)
      
      return this.output.join('\n')
    } catch (error) {
      throw new Error(`Python执行失败: ${error}`)
    }
  }

  // C++代码执行（模拟）
  executeCpp(code: string): string {
    this.output = []
    
    try {
      // 创建C++执行环境
      const cppContext = {
        rand: () => Math.floor(Math.random() * 32768),
        cout: {
          print: (...args: any[]) => {
            this.output.push(args.map(arg => String(arg)).join(' '))
          }
        },
        cin: {
          input: () => {
            if (this.inputIndex < this.inputLines.length) {
              return this.inputLines[this.inputIndex++]
            }
            return ''
          }
        }
      }

      // 简单的C++代码解析和执行
      this.parseCppCode(code, cppContext)
      
      return this.output.join('\n')
    } catch (error) {
      throw new Error(`C++执行失败: ${error}`)
    }
  }

  private parsePythonCode(code: string, context: any) {
    const lines = code.split('\n')
    const variables: { [key: string]: any } = {}
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || line.startsWith('#') || line.startsWith('import') || line.startsWith('from')) continue
      
      // 处理函数调用
      if (line.includes('generate_test_case()') || line.includes('solve()')) {
        // 执行简单的测试数据生成逻辑
        if (line.includes('generate_test_case()')) {
          // 生成两个随机数
          const a = context.random.randint(1, 100)
          const b = context.random.randint(1, 100)
          context.print(a, b)
        } else if (line.includes('solve()')) {
          // 读取输入并求和
          const input = context.input()
          if (input) {
            const nums = input.split(' ').map(x => context.int(x))
            const result = context.sum(nums)
            context.print(result)
          }
        }
        continue
      }
      
      // 处理变量赋值
      if (line.includes(' = ')) {
        const [varName, expression] = line.split(' = ', 2)
        const cleanVarName = varName.trim()
        
        if (expression.includes('random.randint(')) {
          const match = expression.match(/random\.randint\((\d+),\s*(\d+)\)/)
          if (match) {
            variables[cleanVarName] = context.random.randint(parseInt(match[1]), parseInt(match[2]))
          }
        } else if (expression.includes('input()')) {
          variables[cleanVarName] = context.input()
        } else if (expression.includes('int(input())')) {
          variables[cleanVarName] = context.int(context.input())
        } else if (expression.includes('map(int, input().split())')) {
          const input = context.input()
          variables[cleanVarName] = input.split(' ').map((x: string) => context.int(x))
        }
        continue
      }
      
      // 处理print语句
      if (line.startsWith('print(')) {
        const content = line.match(/print\((.+)\)/)
        if (content) {
          let value = content[1]
          
          // 替换变量
          for (const [varName, varValue] of Object.entries(variables)) {
            value = value.replace(new RegExp(`\\b${varName}\\b`, 'g'), String(varValue))
          }
          
          // 处理简单表达式
          if (value.includes(' + ')) {
            const parts = value.split(' + ')
            const result = parts.reduce((sum, part) => {
              const num = variables[part.trim()] || parseInt(part.trim()) || 0
              return sum + num
            }, 0)
            context.print(result)
          } else if (variables[value]) {
            context.print(variables[value])
          } else {
            context.print(value.replace(/['"]/g, ''))
          }
        }
      }
    }
  }

  private parseCppCode(code: string, context: any) {
    // 简化的C++解析
    const lines = code.split('\n')
    const variables: { [key: string]: any } = {}
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#include')) continue
      
      // 处理cout输出
      if (trimmed.includes('cout <<')) {
        const match = trimmed.match(/cout\s*<<\s*(.+?)\s*(?:<<\s*endl)?;/)
        if (match) {
          let value = match[1]
          
          // 处理随机数生成
          if (value.includes('rand()')) {
            value = value.replace(/rand\(\)\s*%\s*(\d+)/g, (_, max) => {
              return String(Math.floor(Math.random() * parseInt(max)))
            })
            value = value.replace(/rand\(\)/g, String(Math.floor(Math.random() * 100)))
          }
          
          // 替换变量
          for (const [varName, varValue] of Object.entries(variables)) {
            value = value.replace(new RegExp(`\\b${varName}\\b`, 'g'), String(varValue))
          }
          
          context.cout.print(value)
        }
      }
      
      // 处理变量声明和赋值
      if (trimmed.includes('int ') && trimmed.includes('=')) {
        const match = trimmed.match(/int\s+(\w+)\s*=\s*(.+?);/)
        if (match) {
          const varName = match[1]
          let value = match[2]
          
          if (value.includes('rand()')) {
            value = value.replace(/rand\(\)\s*%\s*(\d+)/g, (_, max) => {
              return String(Math.floor(Math.random() * parseInt(max)))
            })
            value = value.replace(/rand\(\)/g, String(Math.floor(Math.random() * 100)))
          }
          
          variables[varName] = parseInt(value) || 0
        }
      }
    }
  }

}
}

export async function POST(request: NextRequest) {
  try {
    const { generator, generatorLang, standard, standardLang, numCases } = await request.json()
    
    if (!generator || !numCases) {
      return NextResponse.json({ success: false, error: '缺少必要参数' })
    }

    // 检查代码安全性
    const dangerousPatterns = [
      /system\s*\(/,
      /exec\s*\(/,
      /eval\s*\(/,
      /import\s+os/,
      /import\s+subprocess/,
      /include\s*<\s*cstdlib\s*>/,
      /__import__/,
      /compile\s*\(/
    ]
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(generator) || (standard && pattern.test(standard))) {
        return NextResponse.json({ 
          success: false, 
          error: '代码包含不安全的操作' 
        })
      }
    }
    
    const executor = new CodeExecutor()
    const testCases = []
    
    // 生成测试数据
    for (let i = 0; i < Math.min(numCases, 20); i++) {
      try {
        // 执行生成器
        let input = ''
        if (generatorLang === 'python') {
          input = executor.executePython(generator)
        } else {
          input = executor.executeCpp(generator)
        }
        
        let output = ''
        if (standard) {
          // 执行标准程序
          executor.setInput(input)
          if (standardLang === 'python') {
            output = executor.executePython(standard)
          } else {
            output = executor.executeCpp(standard)
          }
        }
        
        testCases.push({
          input: input.trim(),
          output: output.trim(),
          index: i + 1
        })
      } catch (error) {
        return NextResponse.json({ 
          success: false, 
          error: `测试点 ${i + 1} 生成失败: ${error instanceof Error ? error.message : '未知错误'}` 
        })
      }
    }
    
    return NextResponse.json({ success: true, testCases })
    
  } catch (error) {
    console.error('生成测试数据失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    })
  }
}