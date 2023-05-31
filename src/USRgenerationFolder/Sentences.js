import React, { useEffect, useState } from 'react';
import Pagination from '@mui/material/Pagination';
import messages from '../constants/messages';
import customAxios from "../axios";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


const Sentences = () => {
  const [value_in_array, setValueInArray] = useState([]);
  const [page, setPage] = useState(1);
  const sentencesPerPage = 11;
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [usrsForSenteces, setUsrsForSenteces] = useState()
  const [showUSREditTable, setshowUSREditTable] = useState(false);


  const getUsrForSentences = async () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const discourse_id = searchParams.get('discourseid');
      const result = await customAxios.get(`/usrs_for_a_discourse/${discourse_id}`);

      if (result.status === 200) {
        setUsrsForSenteces(result.data)
        console.log(usrsForSenteces)
      }

      if (result.response?.status === 400) {
        return alert(messages.somethingWentWrong);
      }
    }
    catch (exception) {
      console.log(exception)
    }
  };

  useEffect(() => {
    try {
      if (showUSREditTable) {
        getUsrForSentences();
        setshowUSREditTable(false)
      }
    }
    catch (exception) {
      console.log(exception)
    }
  }, [getUsrForSentences, showUSREditTable])


  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const sentence = searchParams.get('discourse');
      // const ending = /(?<=[।])/g;
      const ending = /\।|\?|\||\./;

      let value_in_array = sentence.split(ending);
      setValueInArray(value_in_array);
    }
    catch (exception) {
      console.log(exception)
    }

  }, []);

  const handleClick = (index, item) => {
    setTimeout(() => {
      setHighlightedIndex(index);
      window.parent.postMessage({ index, item }, '*');
    }, 500);
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(window.location)
  }

  const startIndex = (page - 1) * sentencesPerPage;
  const endIndex = startIndex + sentencesPerPage;
  const selectedSentences = value_in_array.slice(startIndex, endIndex);
  const pageCount = Math.ceil(value_in_array.length / sentencesPerPage);

  return (

    <div>
      {selectedSentences.map((item, index) => (
        <p key={startIndex + index} style={{ backgroundColor: highlightedIndex === startIndex + index ? 'yellow' : 'white' }} onClick={event => handleClick(startIndex + index, item)}>
          {startIndex + index + 1}.
          {item}

          {/* <div class="idtooltip">{startIndex + index + 1}.
            <span class="idtooltiptext">{usrsForSenteces[index]['USR_ID']}<ContentCopyIcon onClick={handleCopyToClipboard}></ContentCopyIcon></span>
          </div>
          <div class="tooltip">{item}
            <span class="tooltiptext"><ContentCopyIcon onClick={handleCopyToClipboard}></ContentCopyIcon><br></br>{usrsForSenteces[index]['orignal_USR_json']}</span>
          </div> */}
        </p>
      ))}
      <div className='alignPagination'>
        <Pagination count={pageCount} size="large" page={page} onChange={handleChangePage} />
      </div>


    </div>
  );
};

export default Sentences;