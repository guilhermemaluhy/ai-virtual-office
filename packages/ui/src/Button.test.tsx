import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Button } from './index.js';

describe('Button', () => {
  it('renders with defaults', () => {
    expect(renderToStaticMarkup(<Button>Ok</Button>)).toBe(
      '<button type="button" data-variant="primary">Ok</button>',
    );
  });
});
