"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ApiDocsPage() {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        setLoading(true);
        const response = await fetch('/API_Docs.md');
        if (!response.ok) {
          throw new Error(`Failed to fetch API documentation: ${response.status}`);
        }
        const content = await response.text();
        setMarkdownContent(content);
      } catch (err) {
        console.error('Error fetching API docs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load API documentation');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkdown();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Documentation</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">API Documentation</h1>
            <p className="mt-2 text-sm text-gray-600">
              Complete reference for all available API endpoints in the GST Bill application
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                <circle cx={4} cy={4} r={3} />
              </svg>
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-8">
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }: any) => (
                  <h1 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    {children}
                  </h1>
                ),
                h2: ({ children }: any) => (
                  <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3 pb-2 border-b border-gray-100">
                    {children}
                  </h2>
                ),
                h3: ({ children }: any) => (
                  <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }: any) => (
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                code: ({ inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <div className="my-4">
                      {match && (
                        <div className="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700 border-b">
                          {match[1].toUpperCase()}
                        </div>
                      )}
                      <pre className="bg-gray-50 p-4 overflow-x-auto text-sm">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                ul: ({ children }: any) => (
                  <ul className="list-disc list-inside space-y-1 text-gray-600 mb-4">
                    {children}
                  </ul>
                ),
                ol: ({ children }: any) => (
                  <ol className="list-decimal list-inside space-y-1 text-gray-600 mb-4">
                    {children}
                  </ol>
                ),
                li: ({ children }: any) => (
                  <li className="leading-relaxed">
                    {children}
                  </li>
                ),
                table: ({ children }: any) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }: any) => (
                  <thead className="bg-gray-50">
                    {children}
                  </thead>
                ),
                tbody: ({ children }: any) => (
                  <tbody className="bg-white divide-y divide-gray-200">
                    {children}
                  </tbody>
                ),
                tr: ({ children }: any) => (
                  <tr>
                    {children}
                  </tr>
                ),
                th: ({ children }: any) => (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {children}
                  </th>
                ),
                td: ({ children }: any) => (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {children}
                  </td>
                ),
                blockquote: ({ children }: any) => (
                  <blockquote className="border-l-4 border-blue-400 pl-4 py-2 my-4 bg-blue-50">
                    <div className="text-blue-800">
                      {children}
                    </div>
                  </blockquote>
                ),
                a: ({ href, children }: any) => (
                  <a
                    href={href}
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }: any) => (
                  <strong className="font-semibold text-gray-900">
                    {children}
                  </strong>
                ),
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <p className="mt-1">
          For technical support or questions about these APIs, please contact the development team.
        </p>
      </div>
    </div>
  );
}
