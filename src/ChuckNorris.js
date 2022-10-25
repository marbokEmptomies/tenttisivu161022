//import logo from './logo.svg';
//import './App.css';
import { useReducer, useEffect } from "react"
import axios from 'axios'
import './norris.css'
import punch from './punch.wav'

const vitsiObj = {
    vitsi: [],
    vitsiaHaetaan: false,
    hakuValmis: false,
    hakuEpaonnistui: false,
    kaynnistaAjastin: false
}

const reducer = (state, action) => {
  switch(action.type) {
    case 'VITSIN_NOUTO_ALOITETTU':
      console.log("nouto aloitettu")
      return {...state, vitsiaHaetaan: true, hakuValmis: false}
    case 'VITSI_NOUDETTU':
      console.log("nouto valmis")
      return {...state, vitsi: action.payload, vitsiaHaetaan: false, hakuValmis: true}
    case 'SEURAAVA_VITSI':
      console.log('seuraavan vitsin nouto valmis')
      return {...state, vitsi: action.payload, vitsiaHaetaan: false, hakuValmis: true}
    case 'KÄYNNISTÄ_AJASTIN':
      console.log("kaynnistaAjastin")
      return {...state, kaynnistaAjastin: true}
    case 'HAKU_EPÄONNISTUI':
      console.log("haku epäonnistui")
      return {...state, hakuEpaonnistui: true, vitsiaHaetaan: false, hakuValmis: false}
    default:
      throw new Error("Action.type kentän arvoa ei tunnistettu.")
  }
}

const ChuckApp = () => {
  const [appData, dispatch] = useReducer(reducer, {vitsiObj})

  useEffect(() => {
    async function haeDataa() {
      try {
        dispatch({ type: 'VITSIN_NOUTO_ALOITETTU' })
        //haetaan vitsiä result-muuttujalle
        
        let result = await axios('https://api.chucknorris.io/jokes/random')
        //vitsi (value) payloadina reduceriin
        dispatch({ type: 'VITSI_NOUDETTU', payload: result.data.value })
        console.log(result.data.value)

        dispatch({ type: 'KÄYNNISTÄ_AJASTIN'})
      } 
      catch (error) {
        console.log("virhe haussa: ", error)
        dispatch({type: 'HAKU_EPÄONNISTUI'})
      }
    }
    haeDataa()

/*     setInterval(async() => {
      try {
        let result = await axios('https://api.chucknorris.io/jokes/random')
        dispatch({ type: 'SEURAAVA_VITSI', payload: result.data.value})
      }
      catch (error) {
        console.log('virhe haussa: ', error)
        dispatch({type: 'HAKU_EPÄONNISTUI'})
      }
    }, 60000) */

  }, [])

  useEffect(() => {
    let timer
    if(appData.kaynnistaAjastin) {
      timer = setInterval(async() => {
        try {
          let result = await axios('https://api.chucknorris.io/jokes/random')
          dispatch({ type: 'SEURAAVA_VITSI', payload: result.data.value})
        }
        catch (error) {
          console.log('virhe haussa: ', error)
          dispatch({type: 'HAKU_EPÄONNISTUI'})
        }
      }, 10000)
    }
      
    return () => clearTimeout(timer)
  }, [appData.kaynnistaAjastin])

  const handleClick = async () => {
    appData.vitsiaHaetaan = true
    let playSound = () => new Audio(punch).play()
    console.log("audio")
    try {
      let result = await axios('https://api.chucknorris.io/jokes/random')
      dispatch({ type: 'SEURAAVA_VITSI', payload: result.data.value})
    }
    catch (error) {
      console.log('virhe haussa: ', error)
      dispatch({type: 'HAKU_EPÄONNISTUI'})
    }
    playSound()
  }

  return (
    <>
      <body>
        <div>
            <h1 className="header">Daily Chuck: </h1>
              <div className="joke_container">
                <p className="vitsi">{appData.vitsi}</p>
              </div>
                <button onClick={handleClick}>Roundhouse Kick</button>
              

          <div className="footer"><small>{appData.vitsiaHaetaan && "Vitsin haku käynnissä..."}</small></div>
          <div className="footer"><small>{appData.hakuValmis && "Valmis"}</small></div>
          <div className="footer"><small>{appData.hakuEpaonnistui && "Vitsin haku epäonnistui..."}</small></div>

        </div>
      </body>
    </>
  )
}

export default ChuckApp;