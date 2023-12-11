import './App.css';
import Landing from './components/Landing';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Landing />
      </div>
    </AuthProvider>
  );
}

export default App;
