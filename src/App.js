import './App.css';
import './bootstrap.min.css';
import ResBuilder from './components/ResBuilder';

function App() {
  return <>
    <div className="navbar navbar-expand-lg fixed-top navbar-dark bg-primary">
      <div className="container">
        {/* eslint-disable-next-line */}
        <a className="navbar-brand">Amazfit Bip</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarResponsive">
          <ul className="navbar-nav">


            <li className="nav-item">
              {/* eslint-disable-next-line */}
              <a className="nav-link">Res builder</a>
            </li>

            <li className="nav-item">
              {/* eslint-disable-next-line */}
              <a className="nav-link">Firmware (fw)</a>
            </li>

            <li className="nav-item">
              {/* eslint-disable-next-line */}
              <a className="nav-link">Fonts (ft)</a>
            </li>

            <li className="nav-item">
              {/* eslint-disable-next-line */}
              <a className="nav-link">Upload</a>
            </li>


          </ul>
        </div>
      </div>
    </div>

    <div className="container">
      <br/><br/><br/><br/>
      <div className="row">
        <ResBuilder />
      </div>
    </div>
  </>;
}

export default App;
