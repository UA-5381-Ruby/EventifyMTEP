import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';


function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

it('renders the name', () => {
  render(<Greeting name="World" />);
  expect(screen.getByText('Hello, World!')).toBeInTheDocument();
});