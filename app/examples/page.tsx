'use client'

import { useState } from 'react'

const examples = [
  {
    title: '基础数组生成',
    description: '生成一个随机数组和对应的求和答案',
    generator: `import random

def generate_test_case():
    # 生成数组长度
    n = random.randint(1, 100)
    print(n)
    
    # 生成数组元素
    arr = [random.randint(1, 1000) for _ in range(n)]
    print(' '.join(map(str, arr)))

if __name__ == '__main__':
    generate_test_case()`,
    standard: `def solve():
    n = int(input())
    arr = list(map(int, input().split()))
    
    # 求数组和
    result = sum(arr)
    print(result)

if __name__ == '__main__':
    solve()`
  },
  {
    title: '图论 - 树生成',
    description: '生成一棵随机树',
    generator: `import random

def generate_tree():
    n = random.randint(3, 50)
    print(n)
    
    # 生成树的边
    for i in range(2, n + 1):
        parent = random.randint(1, i - 1)
        print(parent, i)

if __name__ == '__main__':
    generate_tree()`,
    standard: `def solve():
    n = int(input())
    edges = []
    
    for _ in range(n - 1):
        u, v = map(int, input().split())
        edges.append((u, v))
    
    # 输出边数
    print(len(edges))

if __name__ == '__main__':
    solve()`
  },
  {
    title: '字符串生成',
    description: '生成随机字符串并计算长度',
    generator: `import random
import string

def generate_string():
    length = random.randint(1, 50)
    chars = ''.join(random.choice(string.ascii_lowercase) for _ in range(length))
    print(chars)

if __name__ == '__main__':
    generate_string()`,
    standard: `def solve():
    s = input().strip()
    print(len(s))

if __name__ == '__main__':
    solve()`
  },
  {
    title: '区间查询',
    description: '生成数组和查询区间',
    generator: `import random

def generate_queries():
    n = random.randint(5, 20)
    q = random.randint(1, 10)
    
    print(n, q)
    
    # 生成数组
    arr = [random.randint(1, 100) for _ in range(n)]
    print(' '.join(map(str, arr)))
    
    # 生成查询
    for _ in range(q):
        l = random.randint(1, n)
        r = random.randint(l, n)
        print(l, r)

if __name__ == '__main__':
    generate_queries()`,
    standard: `def solve():
    n, q = map(int, input().split())
    arr = list(map(int, input().split()))
    
    for _ in range(q):
        l, r = map(int, input().split())
        # 计算区间和 (1-indexed)
        result = sum(arr[l-1:r])
        print(result)

if __name__ == '__main__':
    solve()`
  },
  {
    title: '排序问题',
    description: '生成随机数组并排序',
    generator: `import random

def generate_array():
    n = random.randint(1, 30)
    print(n)
    
    arr = [random.randint(1, 1000) for _ in range(n)]
    print(' '.join(map(str, arr)))

if __name__ == '__main__':
    generate_array()`,
    standard: `def solve():
    n = int(input())
    arr = list(map(int, input().split()))
    
    # 排序并输出
    arr.sort()
    print(' '.join(map(str, arr)))

if __name__ == '__main__':
    solve()`
  }
]

export default function Examples() {
  const [selectedExample, setSelectedExample] = useState(0)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    alert(`${type}代码已复制到剪贴板`)
  }

  const useExample = (generator: string, standard: string) => {
    localStorage.setItem('hydroGenerator', generator)
    localStorage.setItem('hydroStandard', standard)
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📚 代码示例
          </h1>
          <p className="text-gray-600">
            Hydro测试数据生成器的常用模板和示例
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 示例列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">示例列表</h2>
              <div className="space-y-2">
                {examples.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedExample(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedExample === index
                        ? 'bg-hydro-blue text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{example.title}</div>
                    <div className="text-sm opacity-80 mt-1">
                      {example.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 代码显示 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {examples[selectedExample].title}
                </h2>
                <button
                  onClick={() => useExample(
                    examples[selectedExample].generator,
                    examples[selectedExample].standard
                  )}
                  className="px-4 py-2 bg-hydro-blue text-white rounded-md hover:bg-hydro-dark"
                >
                  🚀 使用此模板
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">
                {examples[selectedExample].description}
              </p>

              {/* 生成器代码 */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-800">
                    🔧 数据生成器
                  </h3>
                  <button
                    onClick={() => copyToClipboard(examples[selectedExample].generator, '生成器')}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    📋 复制
                  </button>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono overflow-x-auto border">
                  <code>{examples[selectedExample].generator}</code>
                </pre>
              </div>

              {/* 标准程序代码 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-800">
                    ✅ 标准程序
                  </h3>
                  <button
                    onClick={() => copyToClipboard(examples[selectedExample].standard, '标准程序')}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    📋 复制
                  </button>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono overflow-x-auto border">
                  <code>{examples[selectedExample].standard}</code>
                </pre>
              </div>
            </div>

            {/* 使用说明 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                📖 使用说明
              </h3>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-medium mb-2">🔧 数据生成器说明</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>使用Python的random模块生成随机数据</li>
                    <li>通过print()函数输出测试数据</li>
                    <li>可以生成各种类型的数据：数组、图、字符串等</li>
                    <li>注意数据范围和约束条件</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">✅ 标准程序说明</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>读取生成器输出的数据作为输入</li>
                    <li>实现问题的正确解法</li>
                    <li>输出正确答案供对比验证</li>
                    <li>确保算法的正确性和效率</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">🚀 快速开始</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>选择一个适合的示例模板</li>
                    <li>点击"使用此模板"按钮</li>
                    <li>根据需要修改代码</li>
                    <li>设置测试点数量并生成</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-hydro-blue text-white rounded-lg hover:bg-hydro-dark"
          >
            ← 返回生成器
          </a>
        </div>
      </div>
    </div>
  )
}