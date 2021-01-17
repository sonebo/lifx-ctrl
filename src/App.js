import './App.css';
import React, { useEffect, useState } from 'react';
import Switch from '@material-ui/core/Switch';
import Slider from '@material-ui/core/Slider';

const MAX_BRIGHT = 65535
const MAX_TEMP = 4000
const POWER_URL = "http://192.168.0.104/power"
const BRIGHT_URL = "http://192.168.0.104/brightness"
const TEMP_URL = "http://192.168.0.104/temperature"

function convertToPercent(val, max){
  return Math.round((val/max)*100)
}

function invertPercent(val, max){
  let x = Math.round((val/100)*max)
  console.log(val)
  return x
}

const useFetch = (url, options, setFn) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(url, options);
        const data = await res.text();
        setFn(Number(data)) // cast as number, if it is a string it evaluates to true always  
        setIsLoading(false)
      } catch (error) {
        setError(error)
      }
    };
    fetchData();
  }, []); // must be empty, since listing options as a dependency causes object comparison which will always be false and trigger update 
  return { error, isLoading };
};

const sendVal = async (url, val, setFn) => {
  setFn(val)
  await fetch(url, {
    method: "POST", 
    body: String(val)
  })
}


function App() {
  const [on,setOn] = useState(0);
  const [bright, setBright] = useState(0);
  const [temp, setTemp] = useState(0);
  const resPower = useFetch(POWER_URL, {method: "GET"}, setOn)
  const resBright = useFetch(BRIGHT_URL, {method: "GET"}, setBright)
  const resTemp = useFetch(TEMP_URL, {method: "GET"}, setTemp) 

  if(resPower.isLoading || resBright.isLoading || resTemp.isLoading) return <div>Is loading</div>
  if(resPower.error || resBright.error || resTemp.error) return <div>Something went wrong when fetching data</div>

  return (
    <div className="App">
      <Switch checked={!!on} onChange={() => sendVal(POWER_URL, on ? 0 : 1, setOn)}>Light Switch</Switch>
      <div>The lamp status is {on}</div>
      <Slider
        min={0} 
        max={100} 
        value={convertToPercent(bright, MAX_BRIGHT)} 
        onChange={(ev, value) => sendVal(BRIGHT_URL, invertPercent(value, MAX_BRIGHT), setBright)} />
      <Slider
        min={0} 
        max={100} 
        value={convertToPercent(temp, MAX_TEMP)} 
        onChange={(ev, value) => sendVal(TEMP_URL, invertPercent(value, MAX_TEMP), setTemp)} />
      <div>The temp is {convertToPercent(temp, MAX_TEMP)}%</div>
    </div>
  );
}

export default App;
