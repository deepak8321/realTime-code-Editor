import React,{useEffect, useState, useRef} from 'react'
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
// useParams:- is hooks that help to get data from url
// useRef ke change hone par Component Re-Render nahi hoga

function EditorPage() {
  const reactNavigator = useNavigate()
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const {roomId} = useParams();
  // {roomId} also use params.roomId
  // console.log(params);
  const location = useLocation() // router se jo data aa raha usko access kar sakte hai
  
  // by default koi connected nahi hoga:-
  const [clients, setClients] = useState([]);
  
  useEffect(()=>{
    const init = async () => {
      // useRef use hoga to current use hoga
      socketRef.current = await initSocket();
      socketRef.current.on('connect_error', (err)=> handleErrors(err));
      socketRef.current.on('connect_failed', (err)=> handleErrors(err));

      function handleErrors(e) {
        // console.log('socket error', e);
        toast.error('Socket connection failed, try again later')
        reactNavigator('/');
      }

      // socket me event perform kar rahe hai
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      })

      // Listening for joined event
      socketRef.current.on(ACTIONS.JOINED, 
        ({clients, username, socketId})=> {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room`);
            // console.log(`${username} joined`);
          }
          // clients vale State ke andar push kar rahe hai
          setClients(clients);

          // jab koi new user joine hog tab pahle vala code sync ho jaye
          // server par listen hoga 
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
      });

      // Listening for disconnected event;-
      socketRef.current.on(ACTIONS.DISCONNECTED, ({socketId, username})=> {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter(
            (client)=>client.socketId !== socketId
            );
        })
      })
    };
    init();
    // listenner ko clear karna jaruri hota hai. nahi to memory leake ka problem ho jayega
    return () => {
      if (socketRef.current !== null && socketRef.current !== undefined) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      } else {
        // console.log('Socket reference is null or undefined');
      }
    }
    
  },[])


  async function copyRoomId () {
    try {
      // use BOM
      await navigator.clipboard.writeText(roomId)
      toast.success('Room Id has been copied to your clipboard')
    } catch (error) {
      toast.error('Could not copy the Room Id')
      // console.log(error);
    }
  }

  function leaveRoom() {
    reactNavigator('/');
  }

    if (!location.state) {
      return <Navigate to='/' />
    }
  
  return (
    <div className='mainWrap'>
      <div className='aside'>
        <div className='asideInner'>
          <div className='logo'>
            <img 
              className='logoImage' 
              src="/code-sync.png" 
              alt="logo" 
            />
          </div>
          <h3>Connected</h3>
          <div className='clientsList'>
            {
              clients.map((client)=>(
                <Client 
                  key={client.socketId} 
                  username = {client.username}
                />
              ))
            }
          </div>
        </div>
        <button className='btn copyBtn' onClick={copyRoomId}>Copy Room Id</button>
        <button className='btn leaveBtn' onClick={leaveRoom} >Leave</button>
      </div>
      <div className='editorWrap'>
        <Editor 
        socketRef={socketRef}
          roomId ={roomId} 
          onCodeChange = {(code)=>{
          codeRef.current = code;
          }
        }/>
      </div>
    </div>
  )
}
export default EditorPage;

