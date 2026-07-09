import { useState, useRef } from 'react'
import { apiService } from '../../services/api.service'
import type { QueryResponse } from '../../types'

const SUGGESTED_QUESTIONS = [
    'What is the current fraud situation?',
    'Which region has the highest transaction volume?',
    'Are there any critical anomalies right now?',
    'What is the overall system failure rate?',
]

export const QueryPanel = () => {
    const [question, setQuestion] = useState('')
    const [response, setResponse] = useState<QueryResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSubmit = async () => {
        if (!question.trim() || isLoading) return

        setIsLoading(true)
        setError(null)
        setResponse(null)

        try {
            const result = await apiService.query(question.trim())
            setResponse(result)
        } catch {
            setError('Query failed. Check that the backend is running.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSuggestion = (q: string) => {
        setQuestion(q)
        // Focus the textarea after selecting a suggestion
        setTimeout(() => {
            textareaRef.current?.focus()
        }, 0)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-800">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-800">
                <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    Query Intelligence
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                    Ask anything about the current system state
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Suggested questions */}
                <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">
                        Suggested
                    </p>
                    <div className="space-y-1.5">
                        {SUGGESTED_QUESTIONS.map((q) => (
                            <button
                                key={q}
                                type="button"
                                onClick={() => handleSuggestion(q)}
                                className="w-full text-left text-xs text-gray-400 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded px-3 py-2 transition-colors cursor-pointer"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Response area */}
                {isLoading && (
                    <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="text-xs text-gray-500 ml-1">Claude is analyzing...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/20 rounded-lg p-4 border border-red-900/40">
                        <p className="text-xs text-red-400">{error}</p>
                    </div>
                )}

                {response && !isLoading && (
                    <div className="space-y-3">
                        <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700">
                            <p className="text-xs text-blue-400 uppercase tracking-wider mb-2">
                                Claude
                            </p>
                            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                                {response.answer}
                            </p>
                        </div>

                        <div className="bg-gray-800/20 rounded-lg p-3 border border-gray-800">
                            <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">
                                Context used
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-xs text-gray-600">Events</p>
                                    <p className="text-xs text-gray-400 font-mono">
                                        {response.contextSnapshot.totalEvents.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Volume</p>
                                    <p className="text-xs text-gray-400 font-mono">
                                        ${response.contextSnapshot.totalTransactionVolume.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Fraud</p>
                                    <p className="text-xs text-gray-400 font-mono">
                                        {response.contextSnapshot.fraudCount}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Anomalies</p>
                                    <p className="text-xs text-gray-400 font-mono">
                                        {response.contextSnapshot.anomalyCount}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
          <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about fraud, volume, anomalies..."
              rows={2}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-blue-600 transition-colors"
          />
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!question.trim() || isLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors shrink-0"
                    >
                        Ask
                    </button>
                </div>
                <p className="text-xs text-gray-600 mt-1.5">
                    Enter to submit. Shift+Enter for new line.
                </p>
            </div>
        </div>
    )
}
