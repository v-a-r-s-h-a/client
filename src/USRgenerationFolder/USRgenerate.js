import React, { useEffect, useState } from 'react'
import customAxios from "../axios";
import messages from '../constants/messages';
import { getApplicationStorage } from "../utilities/storage";

const _session = getApplicationStorage();

const USRgenerate = () => {
  const [discourse, setDiscourse] = useState('');
  const [discourse_name, setDiscourseName] = useState('');
  const [showIframe, setShowIframe] = useState(false);
  const [receivedIndex, setReceivedIndex] = useState('');
  const [receivedItem, setReceivedItem] = useState('')

  window.addEventListener("message", receiveMessage, false);

  function receiveMessage(event) {
    const { index, item } = event.data;
    setReceivedIndex(index);
    setReceivedItem(item);
    console.log(item);
  }

  // const saveChanges = () => {
  //   const body = {
  //     sentences: sentences,
  //     discourse_name: discourse_name
  //   };
  //   fetch('http://localhost:9999/usrgenerate', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(body)
  //   })
  //     .then(response => {
  //       alert("USRs Generated Successfully")
  //     })
  //     .then(data => console.log(data))
  //     .then(setShowIframe(true))
  //     .catch(error => console.error(error));
  // };

  function handleSubmit(event) {
    event.preventDefault();
  }

  function handleDiscourseContent(event) {
    try {
      setDiscourse(event.target.value);
    }
    catch (exception) {
      console.log(exception)
    }
  };

  function handleDiscourseName(event) {
    try {
      setDiscourseName(event.target.value);
    }
    catch (exception) {
      console.log(exception)
    }
    // // let discourse_name = event.target.value;
    // if (discourse_name.length > 255) {
    //   alert("Discourse name length should not be more than 255.");
    //   event.target.value = '';
    // }
    // else if (!/^[a-zA-Z0-9_]+$/.test(discourse_name)) {
    //   alert("Discourse name can only contain letters, numbers, and underscores.");
    //   event.target.value = ''; // reset the input value
    // }
  }

  async function handleFileSelection(event) {
    const file = event.target.files[0];
    const file_name = file.name.split('.')[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      // console.log('content:', content); 
      const lines = content.split('\n');
      const hashLines = lines.filter((line) => line.startsWith('#'));
      const sentencearray = lines.filter((line) => line.startsWith('#')).map((line) => line.replace('#', '').replace('\r', ''));
      // console.log('sentencearray:', sentencearray)
      const sentences = hashLines.map((line) => line.substr(1).trim()).join(' ');
      // console.log('sentences:', sentences);
      setDiscourseName(file_name);
      setDiscourse(sentences);
      setShowIframe(true);

      const array_of_usrs = [];
      let subarray_of_usrs = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('#')) {
          // Ignore this line
          continue;
        }
        const item = line.replace('\r', '').split(',');
        subarray_of_usrs.push(item);
        if (i === lines.length - 1 || lines[i + 1].startsWith('#')) {
          // End of subarray
          array_of_usrs.push(subarray_of_usrs);
          subarray_of_usrs = [];
        }
      }
      console.log('array_of_usrs:', array_of_usrs);

      const keys = ['Concept', 'Index', 'SemCateOfNouns', 'GNP', 'DepRel', 'Discourse', 'SpeakersView', 'Scope', 'SentenceType', 'Construction'];
      const jsondata = [];

      for (let i = 0; i < array_of_usrs.length; i++) {
        let array = array_of_usrs[i];
        if (array.length > 10) {
          array = array.slice(0, 10);
        }
        const obj = {};
        for (let j = 0; j < array.length; j++) {
          if (keys[j] === "Construction") {
            obj[keys[j]] = [array[j].join(",")]; // concatenate all elements of array[j] and put as a single element array
          } else {
            obj[keys[j]] = array[j];
            if (['SemCateOfNouns', 'GNP', 'DepRel', 'Discourse', 'SpeakersView', 'Scope'].includes(keys[j]) && array[j].length > array[0].length) {
              obj[keys[j]] = array[j].slice(0, array[0].length); // reduce the value array to the length of the Concept value array
            }
            else if (array[j].length < array[0].length && keys[j] !== 'SentenceType') {
              // Add empty strings to the value array until its length matches that of the Concept value array
              const diff = array[0].length - array[j].length;
              for (let k = 0; k < diff; k++) {
                obj[keys[j]].push('');
              }
            }
          }
        }
        jsondata.push(obj);
      }

      console.log('jsondata:', jsondata);

      const formTarget = event.target;
      const params = {
        sentences: sentences,
        discourse_name: file_name,
        jsondata: jsondata,
        sentencearray: sentencearray,
        author_id: localStorage.getItem("author_id")
      };
      const result = await customAxios.post('/fileinsert', params);

      if (result.status === 200) {
        alert(messages.USRsGeneratedSuccessfully);
      }

      // fetch('api/fileinsert/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(body)
      // })
      //   .then(response => {
      //     alert("Usr generated Successfully")
      //   })
      //   .then(data => console.log(data))
      //   .catch(error => console.error(error));
    };
    reader.readAsText(file);
  };

  async function handleAutomaticGeneratedUSRs(event) {
    event.preventDefault()
    try {
      const formTarget = event.target;
      const params = {
        discourse: discourse,
        discourse_name: discourse_name,
        author_id: localStorage.getItem("author_id")
      };
      // console.log(author_id)
      const result = await customAxios.post("/usrgenerate", params);

      if (result.status === 200) {
        alert(messages.USRsGeneratedSuccessfully);
        setDiscourse(discourse)
        setDiscourseName(discourse_name)
        setShowIframe(true)
      }
      if (result.response?.status === 400) {
        return alert(messages.somethingWentWrong);
      }
    }
    catch (exception) {
      console.log(exception)
    }

    // fetch('http://localhost:9999/usrgenerate', {
    //   method: 'POST',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ "sentences": discourse })
    // })
    //   .then(response => response.json())
    //   .then(response => {
    //     alert("Usr generated Successfully")
    //   })
    //   .then(response => console.log(JSON.stringify(response)))
    //   .then(() => setShowIframe(true))
    // // setTimeout(() => {

    // // }, 5000);
    // // setShowIframe(true);

  }


  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="entry_components">
          <div className="tta1">
            <p className="lab_discourse">Discourse</p>
            <textarea id="sentences" name="discourse" type="text" value={discourse} onChange={handleDiscourseContent} ></textarea></div>
          <div className="tta2">
            <div className="label_discourse" ><p>Enter discourse name:</p></div>
            <input id="discourse_name" name="discourse_name" value={discourse_name} type="text" onChange={handleDiscourseName} />
          </div>
          {/* <div className="ttab2"><input type='button' name="Save Sentences"  value="Save discourse" disabled='True' /></div> */}
          <div className="ttab3">
            <input type='file' onChange={handleFileSelection} />
            {/* <input type='submit' name="Generate USR" onClick={saveChanges} value="USR Generate" disabled={!sentences} /> */}
            <div className="ttab1"><input type='button' name="Generate USR" value="USR Generate" disabled={!discourse} onClick={handleAutomaticGeneratedUSRs} /></div>
          </div>
        </div>
        <div className="frame_container">
          <iframe className="outl" width="500" height="540" title="sentence" src={`/sentences/?discourse=${discourse}`} />
          <div className="usrtop"><iframe className="usr_usrtop" width="994px" id="usr" height="540" title="usr" src={`/usrtablepath?receivedindex=${receivedIndex}&discoursename=${discourse_name}&receivedItem=${receivedItem}`} /> </div>
        </div>

      </form>
    </>
  )
};

export default USRgenerate;