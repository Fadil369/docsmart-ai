// Mock implementation of GitHub Spark hooks and services
// This allows the project to run without the @github/spark dependency

import { useState, useEffect } from 'react';

// Mock useKV hook for persistent storage
export function useKV<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to store value in localStorage:', error);
    }
  }, [key, value]);

  return [value, setValue];
}

// Mock Spark LLM functionality
declare global {
  // eslint-disable-next-line no-var
  var spark: {
    llm: (prompt: string, model?: string, json?: boolean) => Promise<string>;
    llmPrompt: (strings: TemplateStringsArray, ...values: unknown[]) => string;
  };
}

// Initialize mock Spark global
globalThis.spark = {
  llm: async (prompt: string, model?: string, json?: boolean) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Return mock responses based on prompt content
    if (json) {
      if (prompt.includes('analyze') || prompt.includes('analysis')) {
        return JSON.stringify({
          summary: "This document contains structured content that has been processed by the AI system. The analysis reveals key insights and actionable recommendations for optimization.",
          keyPoints: [
            "Document structure is well-organized and ready for processing",
            "Content contains actionable information suitable for AI enhancement",
            "Multiple optimization opportunities identified for improved workflow"
          ],
          sentiment: "positive",
          actionItems: [
            "Review document formatting for consistency",
            "Implement suggested optimizations for better readability",
            "Consider automated processing for similar documents"
          ],
          insights: [
            "Document shows high compatibility with AI-powered workflows",
            "Content structure suggests professional document management needs",
            "Optimization potential identified in document organization"
          ],
          confidence: 0.92,
          language: "en",
          documentType: "business document",
          wordCount: 450,
          readingTime: 3
        });
      }
      
      if (prompt.includes('insights') || prompt.includes('recommendations')) {
        return JSON.stringify([
          "Consider implementing automated document classification",
          "Document structure shows potential for template creation",
          "Workflow optimization opportunities identified",
          "Integration with existing systems recommended"
        ]);
      }

      if (prompt.includes('template')) {
        return JSON.stringify({
          template: "# Document Template\n\n**Date:** [DATE]\n**Author:** [NAME]\n**Subject:** [SUBJECT]\n\n## Content\n[CONTENT]\n\n## Summary\n[SUMMARY]",
          fields: ["DATE", "NAME", "SUBJECT", "CONTENT", "SUMMARY"],
          instructions: "Replace bracketed placeholders with actual values when using this template."
        });
      }

      return JSON.stringify({ result: "Mock response for JSON request" });
    }
    
    // Non-JSON responses
    if (prompt.includes('translate')) {
      return "This is a mock translation result. The original content has been processed and would be translated according to the specified language requirements.";
    }
    
    if (prompt.includes('merge')) {
      return "Document 1: Content Overview\n\nDocument 2: Additional Information\n\n---\n\nMerged Summary: This is a mock merged document that combines the essential elements from multiple sources into a cohesive and well-structured format.";
    }
    
    return "This is a mock AI response. The system is working correctly and would provide detailed analysis and insights in a production environment.";
  },

  llmPrompt: (strings: TemplateStringsArray, ...values: unknown[]) => {
    return strings.reduce((result, string, i) => {
      return result + string + (values[i] || '');
    }, '');
  }
};

export default spark;