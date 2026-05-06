import { render, screen } from '@testing-library/react';

function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}

describe('Greeting', () => {
  it('renders the name', () => {
    render(<Greeting name="World" />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });
});
