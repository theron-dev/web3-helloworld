import { Flowbite } from 'flowbite-react';
import {
  Route,
  Routes,
} from "react-router-dom";
import HelloWorld from './page/HelloWorld';

function App() {
  return (
    <Flowbite theme={{
      theme: {
        alert: {
          color: {
            primary: 'bg-primary'
          }
        },
        minWidth: {
          '1/2': '50%'
        },
      }
    }} className="min-h-screen">
      <Routes>
        <Route path="/" element={<HelloWorld></HelloWorld>}></Route>
      </Routes>
    </Flowbite >
  );
}

export default App;
