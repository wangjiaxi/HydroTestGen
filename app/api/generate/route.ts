import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import { spawn } from 'child_process'

// 在 Node.js 运行时执行
export const runtime = 'nodejs'

async function runWithSpawn(command: string, args: string[], options: { input?: string, timeoutMs?: number } = {}): Promise<{ stdout: string, stderr: string }> {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] })
		let stdout = ''
		let stderr = ''
		let timedOut = false

		const timeout = setTimeout(() => {
			timedOut = true
			child.kill('SIGKILL')
		}, options.timeoutMs ?? 5000)

		child.stdout.on('data', (data) => {
			stdout += data.toString()
		})
		child.stderr.on('data', (data) => {
			stderr += data.toString()
		})
		child.on('error', (err) => {
			clearTimeout(timeout)
			reject(err)
		})
		child.on('close', (code) => {
			clearTimeout(timeout)
			if (timedOut) {
				return reject(new Error('执行超时'))
			}
			if (code === 0) {
				resolve({ stdout, stderr })
			} else {
				reject(new Error(stderr || `进程退出码 ${code}`))
			}
		})

		if (options.input) {
			child.stdin.write(options.input)
		}
		child.stdin.end()
	})
}

async function tryRun(commands: string[], args: string[], options: { input?: string, timeoutMs?: number } = {}): Promise<{ stdout: string, stderr: string, used: string }> {
	let lastErr: any = null
	for (const cmd of commands) {
		try {
			const res = await runWithSpawn(cmd, args, options)
			return { ...res, used: cmd }
		} catch (err: any) {
			lastErr = err
			if (err && (err.code === 'ENOENT' || /ENOENT/.test(String(err)))) {
				continue
			}
			throw err
		}
	}
	throw new Error(`未找到可用的命令: ${commands.join('/')}. 原因: ${lastErr ? String(lastErr) : '未知'}`)
}

async function runPython(code: string, stdin?: string): Promise<string> {
	const tmpDir = os.tmpdir()
	const file = path.join(tmpDir, `exec-${Date.now()}-${Math.random().toString(36).slice(2)}.py`)
	await fs.writeFile(file, code, 'utf8')
	try {
		const { stdout } = await tryRun(['python3', 'python'], [file], { input: stdin, timeoutMs: 8000 })
		return stdout
	} finally {
		await fs.unlink(file).catch(() => {})
	}
}

async function compileCpp(sourcePath: string, outputPath: string) {
	await tryRun(['g++', 'clang++', 'c++'], ['-std=c++17', '-O2', sourcePath, '-o', outputPath], { timeoutMs: 15000 })
}

async function runCpp(code: string, stdin?: string): Promise<string> {
	const tmpDir = os.tmpdir()
	const src = path.join(tmpDir, `exec-${Date.now()}-${Math.random().toString(36).slice(2)}.cpp`)
	const bin = path.join(tmpDir, `exec-${Date.now()}-${Math.random().toString(36).slice(2)}`)
	await fs.writeFile(src, code, 'utf8')
	try {
		await compileCpp(src, bin)
		const { stdout } = await runWithSpawn(bin, [], { input: stdin, timeoutMs: 8000 })
		return stdout
	} finally {
		await fs.unlink(src).catch(() => {})
		await fs.unlink(bin).catch(() => {})
	}
}

export async function POST(request: NextRequest) {
	try {
		const { generator, generatorLang, standard, standardLang, numCases } = await request.json()

		if (!generator || !numCases) {
			return NextResponse.json({ success: false, error: '缺少必要参数' })
		}

		// 基础安全检查
		const dangerousPatterns = [
			/system\s*\(/,
			/exec\s*\(/,
			/eval\s*\(/,
			/import\s+os/,
			/import\s+subprocess/,
			/include\s*<\s*cstdlib\s*>/,
			/__import__/,
			/compile\s*\(/,
		]
		for (const pattern of dangerousPatterns) {
			if (pattern.test(generator) || (standard && pattern.test(standard))) {
				return NextResponse.json({ success: false, error: '代码包含不安全的操作' })
			}
		}

		const testCases = [] as { input: string, output: string, index: number }[]

		for (let i = 0; i < Math.min(numCases, 20); i++) {
			try {
				// 运行生成器，得到输入
				let input = ''
				if (generatorLang === 'python') {
					input = await runPython(generator)
				} else {
					input = await runCpp(generator)
				}

				// 运行标准程序，得到输出
				let output = ''
				if (standard) {
					if (standardLang === 'python') {
						output = await runPython(standard, input)
					} else {
						output = await runCpp(standard, input)
					}
				}

				testCases.push({
					input: (input || '').trim(),
					output: (output || '').trim(),
					index: i + 1,
				})
			} catch (error) {
				return NextResponse.json({ success: false, error: `测试点 ${i + 1} 生成失败: ${error instanceof Error ? error.message : '未知错误'}` })
			}
		}

		return NextResponse.json({ success: true, testCases })
	} catch (error) {
		console.error('生成测试数据失败:', error)
		return NextResponse.json({ success: false, error: error instanceof Error ? error.message : '未知错误' })
	}
}