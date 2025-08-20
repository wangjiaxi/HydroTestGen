'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'

// 动态导入Monaco编辑器以避免SSR问题
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface TestFile {
  name: string
  content: string
  size: number
  type: 'generator' | 'standard' | 'input' | 'output'
}

interface TestCase {
  input: string
  output: string
  index: number
}

export default function Home() {
  const [files, setFiles] = useState<TestFile[]>([])
  const [generatorCode, setGeneratorCode] = useState(`# Hydro测试数据生成器示例
import random

def generate_test_case():
    # 生成数组长度
    n = random.randint(1, 100)
    print(n)
    
    # 生成数组元素
    arr = [random.randint(1, 1000) for _ in range(n)]
    print(' '.join(map(str, arr)))

if __name__ == '__main__':
    generate_test_case()`)
  
  const [standardCode, setStandardCode] = useState(`# 标准程序示例
def solve():
    n = int(input())
    arr = list(map(int, input().split()))
    
    # 示例：求数组和
    result = sum(arr)
    print(result)

if __name__ == '__main__':
    solve()`)

  // 从localStorage加载保存的代码
  useState(() => {
    if (typeof window !== 'undefined') {
      const savedGenerator = localStorage.getItem('hydroGenerator')
      const savedStandard = localStorage.getItem('hydroStandard')
      if (savedGenerator) setGeneratorCode(savedGenerator)
      if (savedStandard) setStandardCode(savedStandard)
    }
  })
  
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [loading, setLoading] = useState(false)
  const [numCases, setNumCases] = useState(5)
  const [activeTab, setActiveTab] = useState<'files' | 'generator'>('files')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (!uploadedFiles) return

    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const newFile: TestFile = {
          name: file.name,
          content,
          size: file.size,
          type: file.name.includes('gen') ? 'generator' : 
                file.name.includes('std') ? 'standard' : 'input'
        }
        setFiles(prev => [...prev, newFile])
      }
      reader.readAsText(file)
    })
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const generateTestData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generator: generatorCode,
          standard: standardCode,
          numCases: numCases
        }),
      })
      
      const data = await response.json()
      if (data.success) {
        setTestCases(data.testCases)
      } else {
        alert('生成失败: ' + data.error)
      }
    } catch (error) {
      alert('请求失败: ' + error)
    }
    setLoading(false)
  }

  const downloadTestCases = () => {
    const zip = testCases.map((tc, i) => 
      `=== 测试点 ${i + 1} ===\n输入:\n${tc.input}\n输出:\n${tc.output}\n`
    ).join('\n')
    
    const blob = new Blob([zip], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hydro_testcases.txt'
    a.click()
  }

  const downloadSeparateFiles = () => {
    testCases.forEach((tc, i) => {
      // 下载输入文件
      const inputBlob = new Blob([tc.input], { type: 'text/plain' })
      const inputUrl = URL.createObjectURL(inputBlob)
      const inputLink = document.createElement('a')
      inputLink.href = inputUrl
      inputLink.download = `${i + 1}.in`
      inputLink.click()
      
      // 下载输出文件
      const outputBlob = new Blob([tc.output], { type: 'text/plain' })
      const outputUrl = URL.createObjectURL(outputBlob)
      const outputLink = document.createElement('a')
      outputLink.href = outputUrl
      outputLink.download = `${i + 1}.out`
      outputLink.click()
    })
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Hydro 测试数据生成器
          </h1>
          <p className="text-gray-600 mb-4">
            基于Hydro的测试数据生成功能，支持Python生成器和标准程序
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/examples"
              className="px-4 py-2 bg-hydro-blue text-white rounded-md hover:bg-hydro-dark"
            >
              📚 查看示例
            </a>
            <button
              onClick={() => {
                const savedGen = localStorage.getItem('hydroGenerator')
                const savedStd = localStorage.getItem('hydroStandard')
                if (savedGen) setGeneratorCode(savedGen)
                if (savedStd) setStandardCode(savedStd)
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              📥 加载保存的代码
            </button>
          </div>
        </div>

        {/* 标签页 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('files')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'files'
                    ? 'border-hydro-blue text-hydro-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📁 测试数据文件
              </button>
              <button
                onClick={() => setActiveTab('generator')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'generator'
                    ? 'border-hydro-blue text-hydro-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔧 生成测试数据
              </button>
            </nav>
          </div>
        </div>

        {/* 文件管理标签页 */}
        {activeTab === 'files' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">测试数据文件</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-hydro-blue text-white rounded-md hover:bg-hydro-dark"
                >
                  📤 上传文件
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  ⚙️ 配置
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  ➕ 创建
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".py,.txt,.in,.out"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* 文件列表 */}
            <div className="border border-gray-200 rounded-lg">
              <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                <div className="col-span-1">
                  <input type="checkbox" className="rounded" />
                </div>
                <div className="col-span-6">文件名</div>
                <div className="col-span-2">大小</div>
                <div className="col-span-3">操作</div>
              </div>
              
              {files.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="mb-4">📁</div>
                  <p>暂无文件，请上传测试数据文件</p>
                  <p className="text-sm mt-2">支持 .py, .txt, .in, .out 格式</p>
                </div>
              ) : (
                files.map((file, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 p-3 border-b border-gray-100 hover:bg-gray-50">
                    <div className="col-span-1">
                      <input type="checkbox" className="rounded" />
                    </div>
                    <div className="col-span-6 flex items-center">
                      <span className="mr-2">
                        {file.type === 'generator' ? '🔧' : 
                         file.type === 'standard' ? '✅' : '📄'}
                      </span>
                      {file.name}
                    </div>
                    <div className="col-span-2 text-gray-600">
                      {file.size} Bytes
                    </div>
                    <div className="col-span-3">
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800 mr-2"
                      >
                        🗑️
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">
                        ✏️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {files.length > 0 && (
              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                  📥 下载选中
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  🗑️ 移除选中
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  📝 重命名选中
                </button>
              </div>
            )}
          </div>
        )}

        {/* 生成器标签页 */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* 代码编辑区 */}
            <div className="space-y-6">
              {/* 数据生成器 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  🔧 数据生成器
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  数据生成器是一个生成测试数据的程序。它应该将结果输出到标准输出。
                </p>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <MonacoEditor
                    height="300px"
                    language="python"
                    theme="vs-light"
                    value={generatorCode}
                    onChange={(value) => setGeneratorCode(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>

              {/* 标准程序 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  ✅ 标准程序
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  标准程序是一个解决问题的程序。它应该将答案输出到标准输出。
                </p>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <MonacoEditor
                    height="300px"
                    language="python"
                    theme="vs-light"
                    value={standardCode}
                    onChange={(value) => setStandardCode(value || '')}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>

              {/* 生成控制 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      测试点数量
                    </label>
                    <input
                      type="number"
                      value={numCases}
                      onChange={(e) => setNumCases(parseInt(e.target.value) || 1)}
                      min="1"
                      max="20"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-hydro-blue"
                    />
                  </div>
                  
                  <button
                    onClick={generateTestData}
                    disabled={loading}
                    className="px-6 py-2 bg-hydro-blue text-white rounded-md hover:bg-hydro-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ 生成中...' : '🚀 生成'}
                  </button>
                  
                  <button
                    onClick={() => {
                      localStorage.setItem('hydroGenerator', generatorCode)
                      localStorage.setItem('hydroStandard', standardCode)
                      alert('代码已保存到本地存储')
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    💾 保存代码
                  </button>
                </div>
              </div>
            </div>

            {/* 结果显示区 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  📊 生成结果
                </h3>
                {testCases.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={downloadTestCases}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      📥 下载合并文件
                    </button>
                    <button
                      onClick={downloadSeparateFiles}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      📦 下载分离文件
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {testCases.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">📊</div>
                    <p>点击"生成"按钮开始生成测试数据</p>
                  </div>
                ) : (
                  testCases.map((testCase, index) => (
                    <div key={index} className="test-case-card border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-3">
                        📝 测试点 {index + 1}
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600 block mb-1">
                            📥 输入:
                          </span>
                          <pre className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto border">
                            {testCase.input}
                          </pre>
                        </div>
                        {testCase.output && (
                          <div>
                            <span className="text-sm font-medium text-gray-600 block mb-1">
                              📤 输出:
                            </span>
                            <pre className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto border">
                              {testCase.output}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">📖 使用说明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <h3 className="font-medium mb-2">🔧 数据生成器</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>使用Python编写生成测试数据的程序</li>
                <li>程序应该输出测试数据到标准输出</li>
                <li>可以使用random模块生成随机数据</li>
                <li>支持多种数据类型：数组、图、字符串等</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">✅ 标准程序</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>使用Python编写解决问题的标准答案</li>
                <li>程序读取生成器的输出作为输入</li>
                <li>输出正确答案到标准输出</li>
                <li>用于生成测试数据的期望输出</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}