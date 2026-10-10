'use client';

import ReactMarkdown, { type Components } from 'react-markdown';

const components: Components = {
  p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-neutral">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="list-disc pl-4 mb-1.5 last:mb-0 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-4 mb-1.5 last:mb-0 space-y-0.5">{children}</ol>,
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  h1: ({ children }) => <h3 className="text-sm font-semibold text-neutral mt-2 mb-1 first:mt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="text-sm font-semibold text-neutral mt-2 mb-1 first:mt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="text-[13px] font-semibold text-neutral mt-2 mb-1 first:mt-0">{children}</h4>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2 hover:text-accent-hover">
      {children}
    </a>
  ),
  code: ({ children }) => <code className="font-mono text-[12px] bg-surface border border-border rounded-sm px-1">{children}</code>,
  pre: ({ children }) => <pre className="font-mono text-[12px] bg-surface border border-border rounded-md p-sm mb-1.5 overflow-x-auto">{children}</pre>,
  blockquote: ({ children }) => <blockquote className="border-l-2 border-accent/30 pl-sm text-text-dim mb-1.5">{children}</blockquote>,
  hr: () => <hr className="border-border my-2" />,
};

export default function ChatMarkdown({ content }: { content: string }) {
  return (
    <div className="text-neutral/90 leading-relaxed break-words">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
