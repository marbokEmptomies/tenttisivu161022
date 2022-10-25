import './style.css'
import { useState, useReducer,useEffect } from 'react'
import { questions } from './Questions'


let appData = {
    questions,
    save: false,
    dataRefreshed: false,
    muistutaKayttajaa: false,
    dataMuutettu: false
    }

const reducer = (questionState, action) => {
    switch(action.type) {
        case "KYSYMYS_MUUTTUI": {
            console.log("kyssäri muuttui", action)
            const kopio = {...questionState}
            kopio.questions[action.payload.index].questionText = action.payload.uusiKysymys
            kopio.save = true
            kopio.dataMuutettu = true
            kopio.muistutaKayttajaa = false
            return kopio}
        case "VASTAUSVAIHTOEHTO_MUUTTUI": {
            console.log("vvmuuttui")
            const vastausVaihtoehtoKopio = {...questionState}
            vastausVaihtoehtoKopio.questions[action.payload.kysIndex].answerOptions[action.payload.index].answerText = action.payload.uusiVastausVaihtoehto
            vastausVaihtoehtoKopio.save = true
            vastausVaihtoehtoKopio.dataMuutettu = true
            vastausVaihtoehtoKopio.muistutaKayttajaa = false
            return vastausVaihtoehtoKopio}
        case "ADD_QUESTION": {
            console.log("lisää kyssäri muuttui", action)
            return {
                    ...questionState, 
                    questions: [...questionState.questions, 
                    {questionText: "Oletus",
                    answerOptions: []} ], 
                    save: true,
                    dataMuutettu: true,
                    muistutaKayttajaa: false 
                }}
        /*case "REMOVE_QUESTION": {
            console.log("poista kyssäri muuttui", action)
            }*/
        case "MUISTUTA_KAYTTAJAA": {
            console.log("muistutus-reducer", action)
            return {...questionState, muistutaKayttajaa: action.payload}
        }
        case "REFRESH_SAVE_STATE": {
            const kopio2 = {...questionState}
            kopio2.save = action.payload.save 
            return kopio2}
        case "ALUSTA_DATA":{
            return action.payload}
        default:
            throw new Error("Reducer error...")
    }
}

const MainContent = () => {

    const [questionList, dispatch] = useReducer(reducer, appData)
    //const [vastausOikein, setVastausOikein] = useState("")

    //tallennusmuistuttaja
    const [muistutusTimer, setMuistutusTimer] = useState(-1)

    const qList = questionList.questions.map((item, index) => {
        let kysIndex = index
        return (
            <div>
                <h2>{item.questionText}</h2>
                    <input type="text" value={item.questionText} onChange={(event) => {
                        dispatch({
                            type: "KYSYMYS_MUUTTUI",
                            payload: {
                                uusiKysymys: event.target.value, 
                                index: index
                            }
                        })
                    }} />
                    <button onClick={() =>
                        dispatch(
                        {
                            type: 'REMOVE_QUESTION'
                        }
                )}>Poista kysymys</button>  
                {item.answerOptions.map((vastaus, index) => {
                    return (<div>
                                {vastaus.answerText}
                                <input type="radio" name={vastaus.name} />
                                <input type="text" value={vastaus.answerText} onChange={(event) => {
                                    dispatch({
                                        type: "VASTAUSVAIHTOEHTO_MUUTTUI",
                                        payload: {
                                            uusiVastausVaihtoehto: event.target.value,
                                            index: index,
                                            kysIndex: kysIndex
                                        }
                                    })
                                }} />
                            </div>)
                })}
            </div>)
    })
    useEffect(() => {
        let tenttidata = localStorage.getItem('tenttidata')
        if (tenttidata==null) {
            console.log("data luettiin vakiosta")
            localStorage.setItem('tenttidata', JSON.stringify(appData))
            dispatch(
                {
                    type: "ALUSTA_DATA",
                    payload: appData
                }
            )
        } else {
            console.log("data luettiin local storagesta")
            dispatch(
                {
                    type: "ALUSTA_DATA",
                    payload: JSON.parse(tenttidata) 
                }
            )
        }
    }, [])
    
    useEffect(() => {
        if (questionList.save===true) {
            console.log("Pitää tallentaa")
            console.log("questionList:", questionList)
            localStorage.setItem('tenttidata', JSON.stringify(questionList))
            dispatch(
                {
                    type: "REFRESH_SAVE_STATE", 
                    payload:false
                })
            }

            if (muistutusTimer > -1) {
                clearTimeout(muistutusTimer)
            }
            
            setMuistutusTimer(setTimeout(() => {
                //appData.muistutaKayttajaa = true
                console.log("timer laukes")
                dispatch ( { type: "MUISTUTA_KAYTTAJAA", payload: true })
            }, 5000))

        appData.dataMuutettu = false

    }, [questionList.save])

    /* const tarkistaVastaus = (vastaus) => {
        if (vastaus) {
            setVastausOikein("Oikein")
            return 
        }
        setVastausOikein("Väärin")
    } */

    return (
        <div>
            <h1>Musiikin teoria</h1>
                {qList}
                <button onClick={() => 
                    dispatch(
                        {
                            type: 'ADD_QUESTION'
                        }
                    )}>Lisää uusi kysymys</button>
            <div>{appData.muistutaKayttajaa && <h1>Tallenna!</h1>}</div>
        </div>
    )
}
export default MainContent;