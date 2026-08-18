import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResumeDocument from './ResumeDocument';

describe('ResumeDocument', () => {
  it('renders supplied content and omits absent education', () => {
    render(<ResumeDocument templateId="modern" content={{ name: 'Jordan Patel', summary: 'Backend engineer', skills: [{ name: 'Node.js', category: 'Backend' }], experiences: [] }} />);
    expect(screen.getByText('Jordan Patel')).toBeTruthy();
    expect(screen.getByText('Node.js')).toBeTruthy();
    expect(screen.queryByText('Education')).toBeNull();
  });

  it('supports every premium template without losing resume content', () => {
    const templates = ['modern', 'minimal', 'classic', 'executive', 'creative', 'editorial', 'swiss', 'atlas', 'noir', 'ivy', 'coastal', 'slate', 'aurora', 'monogram', 'compact'];
    for (const templateId of templates) {
      const { unmount } = render(<ResumeDocument templateId={templateId} content={{ name: `Candidate ${templateId}`, experiences: [] }} />);
      expect(screen.getByText(`Candidate ${templateId}`)).toBeTruthy();
      unmount();
    }
  });
});
