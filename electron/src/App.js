import './App.css';
import RegistrationForm from "./RegistrationForm";
import SendMessageForm from "./SendMessageForm";
import ReceiveMessageForm from "./ReceiveMessageForm";

function App() {
  return (
    <div className="App">
      <RegistrationForm></RegistrationForm>
      <SendMessageForm></SendMessageForm>
      <ReceiveMessageForm></ReceiveMessageForm>
    </div>
  );
}

export default App;
