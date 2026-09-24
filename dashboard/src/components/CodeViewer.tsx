'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function CodeViewer({ code, language = 'text' }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  // Map our language metadata to Prism language names
  const langLower = language.toLowerCase();
  let prismLang = 'javascript'; // default
  
  if (langLower.includes('python')) prismLang = 'python';
  else if (langLower.includes('java') && !langLower.includes('script')) prismLang = 'java';
  else if (langLower.includes('c++') || langLower.includes('cpp')) prismLang = 'cpp';
  else if (langLower.includes('c#') || langLower.includes('csharp')) prismLang = 'csharp';
  else if (langLower.includes('rust')) prismLang = 'rust';
  else if (langLower.includes('go')) prismLang = 'go';
  else if (langLower.includes('ruby')) prismLang = 'ruby';
  else if (langLower.includes('sql')) prismLang = 'sql';
  else if (langLower.includes('typescript') || langLower.includes('ts')) prismLang = 'typescript';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1e1e1e] rounded-b-xl overflow-hidden relative group">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded border border-slate-700 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="overflow-x-auto text-sm">
        <SyntaxHighlighter
          language={prismLang}
          style={vscDarkPlus}
          showLineNumbers={true}
          wrapLines={false}
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            background: 'transparent',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: '#6b7280',
            textAlign: 'right',
            userSelect: 'none'
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
