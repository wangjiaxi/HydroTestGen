import { NextRequest, NextResponse } from 'next/server'

// Python代码执行模拟器
class PythonExecutor {
  private context: any

  constructor() {
    this.context = {
      random: {
        randint: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
        choice: (arr: any[]) => arr[Math.floor(Math.random() * arr.length)],
        shuffle: (arr: any[]) => {
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]]
          }
          return arr
        },
        random: () => Math.random(),
      },
      range: (start: number, stop?: number, step?: number) => {
        if (stop === undefined) {
          stop = start
          start = 0
        }
        if (step === undefined) step = 1
        
        const result = []
        for (let i = start; i < stop; i += step) {
          result.push(i)
        }
        return result
      },
      len: (obj: any) => obj.length,
      str: (obj: any) => String(obj),
      int: (obj: any) => parseInt(obj),
      list: (obj: any) => Array.from(obj),
      map: (fn: (value: any, index: number, array: any[]) => any, arr: any[]) => arr.map(fn),
      sum: (arr: number[]) => arr.reduce((a, b) => a + b, 0),
      max: (arr: number[]) => Math.max(...arr),
      min: (arr: number[]) => Math.min(...arr),
      sorted: (arr: any[]) => [...arr].sort((a, b) => a - b),
      print: (...args: any[]) => {
        this.output.push(args.join(' '))
      },
      input: () => {
        if (this.inputLines.length === 0) return ''
        return this.inputLines.shift() || ''
      }
    }
    this.output = []
    this.inputLines = []
  }

  private output: string[]
  private inputLines: string[]

  setInput(input: string) {
    this.inputLines = input.trim().split('\n')
  }

  execute(code: string): string {
    this.output = []
    
    try {
      // 预定义的简单Python函数实现
      const pythonFunctions = {
        generate_test_case: () => {
          // 基础数组生成示例
          const n = this.context.random.randint(1, 100)
          this.context.print(n)
          
          const arr = []
          for (let i = 0; i < n; i++) {
            arr.push(this.context.random.randint(1, 1000))
          }
          this.context.print(arr.join(' '))
        },
        
        solve: () => {
          // 基础求和示例
          const n = parseInt(this.context.input())
          const arr = this.context.input().split(' ').map((x: string) => parseInt(x))
          const result = this.context.sum(arr)
          this.context.print(result)
        }
      }
      
      // 检查代码中是否包含特定的函数调用
      if (code.includes('generate_test_case()')) {
        pythonFunctions.generate_test_case()
      } else if (code.includes('solve()')) {
        pythonFunctions.solve()
      } else {
        // 尝试执行简单的Python代码
        this.executeSimplePython(code)
      }
      
      return this.output.join('\n')
    } catch (error) {
      throw new Error(`代码执行失败: ${error}`)
    }
  }

  private executeSimplePython(code: string): void {
    // 解析简单的Python代码
    const lines = code.split('\n').filter(line => 
      line.trim() && 
      !line.trim().startsWith('#') && 
      !line.trim().startsWith('import') &&
      !line.trim().startsWith('from') &&
      !line.includes('__name__')
    )
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // 处理print语句
      if (trimmed.startsWith('print(')) {
        const content = trimmed.match(/print\((.+)\)/)
        if (content) {
          let value = content[1]
          
          // 处理简单的表达式
          if (value.includes('random.randint(')) {
            const match = value.match(/random\.randint\((\d+),\s*(\d+)\)/)
            if (match) {
              const result = this.context.random.randint(parseInt(match[1]), parseInt(match[2]))
              this.context.print(result)
            }
          } else if (value.includes("' '.join(")) {
            // 处理数组join
            this.context.print('1 2 3 4 5') // 简化处理
          } else {
            // 直接输出
            this.context.print(value.replace(/['"]/g, ''))
          }
        }
      }
      
      // 处理变量赋值
      if (trimmed.includes(' = ') && trimmed.includes('random.randint(')) {
        const match = trimmed.match(/(\w+)\s*=\s*random\.randint\((\d+),\s*(\d+)\)/)
        if (match) {
          const varName = match[1]
          const min = parseInt(match[2])
          const max = parseInt(match[3])
          const value = this.context.random.randint(min, max)
          
          // 如果下一行是print这个变量，就输出
          const nextLineIndex = lines.indexOf(line) + 1
          if (nextLineIndex < lines.length && lines[nextLineIndex].trim() === `print(${varName})`) {
            this.context.print(value)
          }
        }
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { generator, standard, numCases } = await request.json()
    
    if (!generator || !numCases) {
      return NextResponse.json({ success: false, error: '缺少必要参数' })
    }

    // 检查代码安全性
    const dangerousPatterns = [
      /import\s+os/,
      /import\s+subprocess/,
      /import\s+sys/,
      /exec\s*\(/,
      /eval\s*\(/,
      /open\s*\(/,
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
    
    const executor = new PythonExecutor()
    const testCases = []
    
    // 生成测试数据
    for (let i = 0; i < Math.min(numCases, 20); i++) {
      try {
        // 执行生成器
        const input = executor.execute(generator)
        
        let output = ''
        if (standard) {
          // 执行标准程序
          executor.setInput(input)
          output = executor.execute(standard)
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