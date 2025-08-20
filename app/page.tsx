'use client'

import { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'

// 动态导入Monaco编辑器以避免SSR问题
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface TestCase {
  input: string
  output: string
  index: number
}

export default function Home() {
  const [generatorCode, setGeneratorCode] = useState(`# Python数据生成器示例
import random

def generate_test_case():
    # 生成两个随机数
    a = random.randint(1, 100)
    b = random.randint(1, 100)
    print(a, b)

if __name__ == '__main__':
    generate_test_case()`)
  
  const [standardCode, setStandardCode] = useState(`# Python标准程序示例
def solve():
    a, b = map(int, input().split())
    print(a + b)

if __name__ == '__main__':
    solve()`)

  const [generatorLang, setGeneratorLang] = useState<'python' | 'cpp'>('python')
  const [standardLang, setStandardLang] = useState<'python' | 'cpp'>('python')
  
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [loading, setLoading] = useState(false)
  const [numCases, setNumCases] = useState(5)
  const generatorFileRef = useRef<HTMLInputElement>(null)
  const standardFileRef = useRef<HTMLInputElement>(null)

  // 文件拖拽处理
  const handleFileDrop = useCallback((e: React.DragEvent, type: 'generator' | 'standard') => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        if (type === 'generator') {
          setGeneratorCode(content)
          // 根据文件扩展名设置语言
          if (file.name.endsWith('.cpp') || file.name.endsWith('.cc')) {
            setGeneratorLang('cpp')
          } else {
            setGeneratorLang('python')
          }
        } else {
          setStandardCode(content)
          if (file.name.endsWith('.cpp') || file.name.endsWith('.cc')) {
            setStandardLang('cpp')
          } else {
            setStandardLang('python')
          }
        }
      }
      reader.readAsText(file)
    }
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'generator' | 'standard') => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (type === 'generator') {
        setGeneratorCode(content)
        if (file.name.endsWith('.cpp') || file.name.endsWith('.cc')) {
          setGeneratorLang('cpp')
        } else {
          setGeneratorLang('python')
        }
      } else {
        setStandardCode(content)
        if (file.name.endsWith('.cpp') || file.name.endsWith('.cc')) {
          setStandardLang('cpp')
        } else {
          setStandardLang('python')
        }
      }
    }
    reader.readAsText(file)
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
          generatorLang: generatorLang,
          standard: standardCode,
          standardLang: standardLang,
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

  // 下载ZIP文件
  const downloadZip = async () => {
    if (testCases.length === 0) return

    // 创建ZIP文件内容
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    
    testCases.forEach((tc, i) => {
      zip.file(`${i + 1}.in`, tc.input)
      zip.file(`${i + 1}.out`, tc.output)
    })
    
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = 'testcases.zip'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 下载单个测试点
  const downloadSingleCase = (testCase: TestCase, index: number) => {
    // 下载输入文件
    const inputBlob = new Blob([testCase.input], { type: 'text/plain' })
    const inputUrl = URL.createObjectURL(inputBlob)
    const inputLink = document.createElement('a')
    inputLink.href = inputUrl
    inputLink.download = `${index + 1}.in`
    inputLink.click()
    URL.revokeObjectURL(inputUrl)
    
    // 下载输出文件
    const outputBlob = new Blob([testCase.output], { type: 'text/plain' })
    const outputUrl = URL.createObjectURL(outputBlob)
    const outputLink = document.createElement('a')
    outputLink.href = outputUrl
    outputLink.download = `${index + 1}.out`
    outputLink.click()
    URL.revokeObjectURL(outputUrl)
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
            基于Hydro的测试数据生成功能，支持Python和C++生成器
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
                localStorage.setItem('hydroGenerator', generatorCode)
                localStorage.setItem('hydroStandard', standardCode)
                alert('代码已保存')
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              💾 保存代码
            </button>
          </div>
        </div>

          {/* 左侧：代码编辑区 */}
          <div className="space-y-6">
            {/* 数据生成器 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  🔧 数据生成器
                </h3>
                <div className="flex gap-2">
                  <select
                    value={generatorLang}
                    onChange={(e) => setGeneratorLang(e.target.value as 'python' | 'cpp')}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                  </select>
                  <button
                    onClick={() => generatorFileRef.current?.click()}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    📁 上传文件
                  </button>
                </div>
              </div>
              
              <input
                ref={generatorFileRef}
                type="file"
                accept=".py,.cpp,.cc,.c"
                onChange={(e) => handleFileUpload(e, 'generator')}
                className="hidden"
              />
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-hydro-blue transition-colors"
                onDrop={(e) => handleFileDrop(e, 'generator')}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
              >
                <MonacoEditor
                  height="300px"
                  language={generatorLang}
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
              <p className="text-xs text-gray-500 mt-2">
                支持拖拽文件到编辑器或点击上传按钮
              </p>
            </div>

            {/* 标准程序 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  ✅ 标准程序
                </h3>
                <div className="flex gap-2">
                  <select
                    value={standardLang}
                    onChange={(e) => setStandardLang(e.target.value as 'python' | 'cpp')}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                  </select>
                  <button
                    onClick={() => standardFileRef.current?.click()}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    📁 上传文件
                  </button>
                </div>
              </div>
              
              <input
                ref={standardFileRef}
                type="file"
                accept=".py,.cpp,.cc,.c"
                onChange={(e) => handleFileUpload(e, 'standard')}
                className="hidden"
              />
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-hydro-blue transition-colors"
                onDrop={(e) => handleFileDrop(e, 'standard')}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
              >
                <MonacoEditor
                  height="300px"
                  language={standardLang}
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
              <p className="text-xs text-gray-500 mt-2">
                支持拖拽文件到编辑器或点击上传按钮
              </p>
            </div>

            {/* 生成控制 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-4">
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
              </div>
            </div>
          </div>

          {/* 右侧：结果显示区 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                📊 生成结果
              </h3>
              {testCases.length > 0 && (
                <button
                  onClick={downloadZip}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  📦 下载ZIP
                </button>
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
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-800">
                        📝 测试点 {index + 1}
                      </h4>
                      <button
                        onClick={() => downloadSingleCase(testCase, index)}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        📥 下载
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600 block mb-1">
                          📥 输入:
                        </span>
                        <pre className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto border max-h-20 overflow-y-auto">
                          {testCase.input}
                        </pre>
                      </div>
                      {testCase.output && (
                        <div>
                          <span className="text-sm font-medium text-gray-600 block mb-1">
                            📤 输出:
                          </span>
                          <pre className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto border max-h-20 overflow-y-auto">
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