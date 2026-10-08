import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomePage from './page';

describe('HomePage', () => {
  it('renders the title', () => {
    expect(renderToStaticMarkup(<HomePage />)).toContain('<h1>AI Virtual Office</h1>');
  });
});
