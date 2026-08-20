interface GreetingProps {
  name: string;
  messageCount: number;
}

export default function Greeting({ name, messageCount }: GreetingProps) {
  const messageWord = messageCount === 1 ? 'message' : 'messages';

  return (
    <div className="greeting">
      <h1>Hello, {name}!</h1>
      <p>
        You have <strong>{messageCount}</strong> new {messageWord}.
      </p>
    </div>
  );
}
