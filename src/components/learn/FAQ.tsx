"use client";

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { cn } from '@/shared/lib/utils';

// Helper function to extract text from React children recursively
function getTextFromChildren(children: React.ReactNode): string {
  if (!children) return '';
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return children.toString();
  if (Array.isArray(children)) return children.map(getTextFromChildren).join('');
  if (React.isValidElement(children)) return getTextFromChildren(children.props.children);
  return '';
}

// This is a wrapper component for FAQ content in MDX
// Expects MDX content with h3 (###) for questions and p for answers
export function FAQ({ children }: FAQProps) {
  const faqItems: Array<{ question: string; answer: string }> = [];

  // Parse the content to extract FAQ items
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    // Get the type of the child (could be a string like 'h3' or a component)
    const type = child.type;
    const isH3 = type === 'h3' || (typeof type === 'function' && (type as any).displayName === 'h3');
    const isP = type === 'p' || (typeof type === 'function' && (type as any).displayName === 'p');

    // Look for h3 elements as questions
    if (isH3) {
      const questionText = getTextFromChildren(child.props.children)
        .replace(/^Q:\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/\?$/, ''); // Remove trailing ? for display

      if (questionText) {
        faqItems.push({ question: questionText, answer: '' });
      }
    }

    // Look for p elements as answers (after questions)
    if (isP && faqItems.length > 0) {
      const lastItem = faqItems[faqItems.length - 1];
      if (!lastItem.answer) {
        lastItem.answer = getTextFromChildren(child.props.children);
      }
    }
  });

  return (
    <section className="my-8 rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqItems.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left font-medium">
              {item.question}?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground whitespace-pre-wrap">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

// Helper function to get FAQ data from MDX content for FAQPage Schema
export function extractFAQData(mdxContent: string): Array<{ question: string; answer: string }> {
  const faqData: Array<{ question: string; answer: string }> = [];

  // Extract FAQ section
  const faqMatch = mdxContent.match(/<FAQ>[\s\S]*?<\/FAQ>/);
  if (!faqMatch) return faqData;

  const faqContent = faqMatch[0].replace(/<\/?FAQ>/g, '');

  // Extract question/answer pairs using regex
  // Questions are marked with ### (h3 in MDX)
  const questionRegex = /###\s+(.+?)\n([\s\S]*?)(?=\n###|\n*<$)/g;
  let match;

  while ((match = questionRegex.exec(faqContent)) !== null) {
    const question = match[1].trim();
    const answer = match[2].trim();

    if (question && answer) {
      faqData.push({
        question: question.replace(/^Q:\s*/, '').replace(/^\d+\.\s*/, ''),
        answer
      });
    }
  }

  return faqData;
}
