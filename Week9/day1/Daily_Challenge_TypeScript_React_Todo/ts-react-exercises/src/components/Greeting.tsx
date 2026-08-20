/**
 * Exercise 2: Creating a React Component with TypeScript
 *
 * This component demonstrates:
 * - A typed props interface (GreetingProps)
 * - A functional component annotated with React.FC<GreetingProps>
 * - Type-safe rendering of props inside JSX
 */

interface GreetingProps {
  name: string;
  messageCount: number;
}

function Greeting({ name, messageCount }: GreetingProps) {
  return (
    <div className="card">
      <h2>Hello, {name}! 👋</h2>
      <p>
        You have <strong>{messageCount}</strong>{' '}
        {messageCount === 1 ? 'new message' : 'new messages'}.
      </p>
    </div>
  );
}

export default Greeting;
