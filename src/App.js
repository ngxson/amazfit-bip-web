import './App.css';
import { getResData } from './utils/res-extract';
import { downloadArrayBuffer, getResBinary } from './utils/res-pack';

function App() {
  const test = async function () {
    const resData = await getResData('not_latin_1.1.2.05_ENGLISH');
    const newResBin = await getResBinary(resData);
    downloadArrayBuffer(newResBin, 'not_latin_1.1.2.05_ENGLISH_packed.res');
  };

  return (
    <div>
      <button onClick={test}>TESTTTTT</button>
    </div>
  );
}

export default App;
