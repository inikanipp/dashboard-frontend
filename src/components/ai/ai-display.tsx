


'use client'

import React from 'react'

interface AIDisplayProps {
  content: string
}

export function AIDisplay({ content }: AIDisplayProps) {
  const formatContent = (text: string): React.ReactNode => {
    const lines = text.split('\n')
    
    return lines.map((line, lineIndex) => {
      const trimmedLine = line.trim()
      
      if (trimmedLine === '') {
        return <div key={lineIndex} className="h-3" />
      }
      
      if (trimmedLine.startsWith('### ')) {
        return (
          <h3 key={lineIndex} className="text-sm md:text-base font-bold text-blue-700 mt-4 mb-2">
            {trimmedLine.replace('### ', '')}
          </h3>
        )
      }
      
      if (trimmedLine.startsWith('## ')) {
        return (
          <h2 key={lineIndex} className="text-base md:text-lg font-bold text-blue-800 mt-5 mb-2">
            {trimmedLine.replace('## ', '')}
          </h2>
        )
      }
      
      if (trimmedLine.startsWith('# ')) {
        return (
          <h1 key={lineIndex} className="text-lg md:text-xl font-bold text-blue-900 mt-5 mb-3">
            {trimmedLine.replace('# ', '')}
          </h1>
        )
      }
      
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
        const itemText = trimmedLine.replace(/^[-•]\s*/, '')
        return (
          <div key={lineIndex} className="flex items-start gap-2 ml-1 md:ml-2 mb-1">
            <span className="text-blue-500 mt-0.5 md:mt-1">•</span>
            <span className="text-xs md:text-sm break-words" dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
          </div>
        )
      }
      
      if (/^\d+\.\s/.test(trimmedLine)) {
        const itemText = trimmedLine.replace(/^\d+\.\s*/, '')
        return (
          <div key={lineIndex} className="flex items-start gap-2 ml-1 md:ml-2 mb-1">
            <span className="text-blue-600 font-medium min-w-[16px] md:min-w-[20px]">{trimmedLine.match(/^\d+/)?.[0]}.</span>
            <span className="text-xs md:text-sm break-words" dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
          </div>
        )
      }
      
      if (trimmedLine.startsWith('```')) {
        return null
      }
      
      return (
        <p key={lineIndex} className="text-xs md:text-sm mb-2 break-words" dangerouslySetInnerHTML={{ __html: formatInline(trimmedLine) }} />
      )
    })
  }

  const formatInline = (text: string): string => {
    let result = text
    
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-800">$1</strong>')
    
    result = result.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    
    result = result.replace(/`(.*?)`/g, '<code class="bg-slate-100 text-pink-600 px-1 md:px-1.5 py-0.5 rounded text-[10px] md:text-xs font-mono break-words">$1</code>')
    
    result = result.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 underline hover:text-blue-800 break-words" target="_blank" rel="noopener noreferrer">$1</a>')
    
    return result
  }

  return (
    <div className="ai-content break-words overflow-hidden w-full">
      {formatContent(content)}
    </div>
  )
}