"use client";

import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { cn } from '@/shared/lib/utils';

interface FAQProps {
  children?: React.ReactNode;
}

// This is a wrapper component for FAQ content in MDX
// Expects MDX content with h3 (###) for questions and p for answers
export function FAQ({ children }: FAQProps) {
  const faqItems: Array<{ question: string; answer: string }> = [];

  // Parse the content to extract FAQ items
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;

    // Look for h3 elements as questions
    if (child.type === 'h3') {
      const questionText = React.Children.toArray(child.props.children)
        .join('')
        .replace(/^Q:\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/\?$/, ''); // Remove trailing ? for display

      faqItems.push({ question: questionText, answer: '' });
    }

    // Look for p elements as answers (after questions)
    if (child.type === 'p' && faqItems.length > 0) {
      const lastItem = faqItems[faqItems.length - 1];
      if (!lastItem.answer) {
        lastItem.answer = React.Children.toArray(child.props.children).join('');
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
            <AccordionContent className="text-muted-foreground">
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
