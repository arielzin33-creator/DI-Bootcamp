interface GreetingProps {
  name: string
  messageCount: number
}

function Greeting({ name, messageCount }: GreetingProps) {
  return (
    <div className="greeting">
      <h2>Hello, {name}! 👋</h2>
      <p>
        You have <strong>{messageCount}</strong>{' '}
        {messageCount === 1 ? 'new message' : 'new messages'}.
      </p>
    </div>
  )
}

export default Greeting
