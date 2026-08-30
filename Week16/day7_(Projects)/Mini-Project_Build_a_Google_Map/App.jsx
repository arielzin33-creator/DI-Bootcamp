import Navbar from './components/Navbar';
import Map from './components/Map';
import './App.css';

function App() {
  return (
    <div>
      <Navbar />
      <div className="text-center my-4">
        <h1>GOOGLE MAPS API with REACT JS</h1>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <Map />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
