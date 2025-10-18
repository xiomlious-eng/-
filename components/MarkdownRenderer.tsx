
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderContent = () => {
    const blocks = content.split(/(\`\`\`[\s\S]*?\`\`\`)/g);

    return blocks.map((block, index) => {
      if (block.startsWith('```')) {
        const code = block.replace(/```/g, '').trim();
        return (
          <pre key={index} className="bg-gray-800 text-white p-4 rounded-md my-2 overflow-x-auto">
            <code>{code}</code>
          </pre>
        );
      }

      return (
        <div key={index}>
          {block.split('\n').map((line, lineIndex) => {
            if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
              return (
                <li key={lineIndex} className="ml-6 list-disc" dangerouslySetInnerHTML={{ __html: formatLine(line.substring(2)) }}></li>
              );
            }
            return (
              <p key={lineIndex} className="my-1" dangerouslySetInnerHTML={{ __html: formatLine(line) }}></p>
            );
          })}
        </div>
      );
    });
  };

  const formatLine = (line: string) => {
    return line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  return <div className="prose prose-slate dark:prose-invert max-w-none">{renderContent()}</div>;
};

export default MarkdownRenderer;
