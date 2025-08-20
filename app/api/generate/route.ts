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
      // 简单的Python到JavaScript转换
      let jsCode = code
        // 移除注释
        .replace(/#.*$/gm, '')
        // 处理import语句
        .replace(/^import\s+\w+.*$/gm, '')
        .replace(/^from\s+\w+\s+import\s+.*$/gm, '')
        // 处理if __name__ == '__main__':
        .replace(/if\s+__name__\s*==\s*['"']__main__['"]:\s*/g, '')
        // 处理函数定义
        .replace(/def\s+(\w+)\s*\([^)]*\):/g, 'function $1() {')
        // 处理for循环
        .replace(/for\s+(\w+)\s+in\s+range\(([^)]+)\):/g, 'for (let $1 of range($2)) {')
        .replace(/for\s+(\w+)\s+in\s+([^:]+):/g, 'for (let $1 of $2) {')
        // 处理if语句
        .replace(/if\s+([^:]+):/g, 'if ($1) {')
        .replace(/elif\s+([^:]+):/g, '} else if ($1) {')
        .replace(/else:/g, '} else {')
        // 处理缩进（简化处理）
        .replace(/^\s{4,}/gm, '')
        // 添加缺失的大括号
        .replace(/\n(?=\s*[a-zA-Z_])/g, '\n}')
        // 处理Python特有语法
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null')
        // 处理列表推导式（简化）
        .replace(/\[([^[\]]+)\s+for\s+(\w+)\s+in\s+([^[\]]+)\]/g, '$3.map($2 => $1)')

      // 在安全环境中执行
      const func = new Function(...Object.keys(this.context), jsCode + '\n}')
      func(...Object.values(this.context))
      
      return this.output.join('\n')
    } catch (error) {
      throw new Error(`代码执行失败: ${error}`)
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