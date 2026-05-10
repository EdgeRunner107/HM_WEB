import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('renders main navigation and data tabs', () => {
  render(<App />);

  expect(screen.getByRole('link', { name: '홈' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '멤버' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '데이터' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '영상' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: '기여도' })).toBeInTheDocument();
});
