import React,{useEffect, useRef} from 'react'
import CodeMirror, { changeEnd } from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';

import 'codemirror/theme/dracula.css'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/closebrackets'
import ACTIONS from '../Actions';

const Editor = ({socketRef,roomId, onCodeChange}) => {
  const editorRef = useRef(null)
  useEffect(() => {
    async function init() {
      editorRef.current = CodeMirror.fromTextArea(document.getElementById('realtimeEditor'),{
        mode: {name: 'javascript', json: true},
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true,
      })

      // Jo code lkha rahe vo server ko send kar rahe hai(roomId, code) -> server dekh raha hai us room id se jitne log connected hai usko code send kar de raha hai
      // jo code likha gaye vo sabhi user ko dikha ga
      editorRef.current.on('change', (instance, changes)=>{
        // console.log('changes', changes);
        const {origin} = changes;
        // jo bhi changes code me hoga vo dikha ga console par
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== 'setValue') {
          // console.log('working...',code);
          // code send kar rahe hai dusare user ko
          // server par lishen ho raha hoga
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          })
        }
        // console.log(code);
      });

      // editorRef.current.setValue(`console.log('hello')`);
    }
    init();
  }, []);

  // listen code change:-
  useEffect(()=>{
    if (socketRef.current) {
      // listen code change:-
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({code})=>{
        // console.log('reciveing last',code);
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      })
    }
    // leave button par
    return ()=> {
        if (socketRef.current !== null && socketRef.current !== undefined) {
          socketRef.current.off(ACTIONS.CODE_CHANGE);
        } else {
          console.log('Socket reference is null or undefined');
        }
    }
  },[socketRef.current])
  
  return <textarea id="realtimeEditor" ></textarea>
}
export default Editor;
