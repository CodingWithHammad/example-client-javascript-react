import VapiWidget from "./widget";

function App() {
  const assistantId = import.meta.env.VITE_APP_ASSISTANT_ID;
  return (
    <div>
      <h1>My App</h1>
      <VapiWidget assistantId={assistantId} />
    </div>
  );
}

export default App;
