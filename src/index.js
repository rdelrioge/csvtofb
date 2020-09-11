import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import firebase from "firebase/app";
import "firebase/firestore";
import { CSVToArray } from "./csvtoarray.js";

// Pegar configuración de App de FB en la que se desea subir los datos a Firestore
const firebaseConfig = {
  apiKey: "AIzaSyAvogVcTGPQGYthF5HioFjlM11KVsZao6w",
  authDomain: "gesmartwo.firebaseapp.com",
  databaseURL: "https://gesmartwo.firebaseio.com",
  projectId: "gesmartwo",
  storageBucket: "gesmartwo.appspot.com",
  messagingSenderId: "944116844534",
  appId: "1:944116844534:web:3de403944212e7fd36e9d7",
  measurementId: "G-VB5JRCZ67D",
};

export const fb = firebase.initializeApp(firebaseConfig);
export const db = fb.firestore();

const App = () => {
  const [creados, setCreados] = React.useState([]);
  const [consola, setConsola] = React.useState(false);
  const [coleccion, setColeccion] = React.useState("test");

  const uploadData = (e) => {
    e.preventDefault();
    // detectar si es un archivo CSV
    if (e.target.files[0].name.split(".").pop().toLowerCase() === "csv") {
      // Leer archivo en CSV y convertirlo en Array
      const reader = new FileReader();
      reader.onload = function () {
        let arr = CSVToArray(reader.result, ",");
        if (arr[arr.length - 1] < arr[0].length) {
          arr.pop();
        }
        let docsArr = [];
        // convertir array de arrays en objeto de objetos
        let parentO = {};
        let childO = {};
        for (let i = 1; i <= arr.length - 1; i++) {
          for (let j = 0; j < arr[0].length; j++) {
            // si algun dato es undefined, cambiarlo para que no mande error
            if (arr[i][j] === undefined) {
              childO[arr[0][j]] = "";
            } else {
              childO[arr[0][j]] = arr[i][j];
            }
          }
          parentO[i] = { ...childO };
          if (!consola) {
            // subir objeto a base de datos con autoID
            db.collection(coleccion)
              .add(parentO[i])
              .then((docRef) => {
                // console.log("Doc written with ID: ", docRef.id);
                docsArr.push(docRef.id);
                if (docsArr.length === arr.length - 1) {
                  setCreados(docsArr);
                  alert("Carga finalizada");
                }
              })
              .catch((err) => console.log("Error addign doc: ", err));
          } else {
            docsArr.push(parentO[i]);
            if (docsArr.length === arr.length - 1) {
              setCreados(docsArr);
              alert("Carga finalizada ve consola");
            }
          }
        }
      };
      reader.readAsText(e.target.files[0]);
      e.target.value = "";
    } else {
      alert("Please provide a valid CSV file");
    }
  };

  const enConsola = () => {
    consola ? setConsola(false) : setConsola(true);
  };
  return (
    <div className="App">
      <h1>Subir Archivo CSV a Firestore</h1>
      <h2>Instrucciones:</h2>
      <p>Agregar firebaseConfig en archivo index.js</p>
      <p>Ingresa el nombre de la coleccion</p>
      <input type="text" onChange={(e) => setColeccion(e.target.value)} />
      <p>Dar click en subir CSV y seleccionar el archivo</p>
      <h2>Datos actuales y configuración:</h2>
      <p>
        <b>Proyecto:</b> {firebaseConfig.projectId}
      </p>
      <p>
        <b>Colección:</b> {coleccion}
      </p>
      <div className="showEnConsola">
        <span>Monstrar solo en consola?</span>
        <label className="switch">
          <input
            type="checkbox"
            value={consola}
            onChange={(e) => enConsola(e.target.value)}
          />
          <span className="slider round"></span>
        </label>
      </div>
      <input
        className="inputFile"
        type="file"
        id="file-input"
        onChange={(e) => uploadData(e)}
      />
      <label className="file-input__label" htmlFor="file-input">
        SubirCSV
      </label>

      <h2>Resultados:</h2>
      <p>
        <b>Docs creados:</b> {creados.length}
      </p>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
