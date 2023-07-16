import React,{useState} from 'react'
import { toast } from 'react-hot-toast';
import {v4 as uuidv4} from 'uuid';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate()
    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('')
    const createNewRoom = (e) => {
        e.preventDefault(); // new page par jane se rokta hai
        const id = uuidv4();
        setRoomId(id);
        toast.success('Created new room')
    }
    
const joinRoom = () =>{
    if (!roomId || !username) {
        toast.error('Room Id & username is required');
        return;
    }
    // Redirect:-
    navigate(`/editor/${roomId}`,{
        // state pass kar rahe hai dusare url par acess kar paye gaye.
        state : {
            username,
        },
    });
}
const handleInputEnter = (e)=>{
    // console.log('event',e.code); // enter press karke dekho
    if (e.code === 'Enter') {
        joinRoom();
    }
}

  return (
    <div className='homePageWrapper'>
        <div className='formWrapper'>
            <img className='homePageLogo' src='/code-sync.png' alt='code-sync-logo'/>
            <h4 className='mainLabel'>Paste invitation ROOM ID</h4>
            <div className='inputGroup'>
                <input 
                    type="text" 
                    className='inputBox' 
                    placeholder='Room ID'
                    onChange={(e)=>setRoomId(e.target.value)}
                    value={roomId}
                    // Enter press hone ke baad login ho jaye(feature) 
                    onKeyUp={handleInputEnter}
                />

                <input 
                    type="text" 
                    className='inputBox' 
                    placeholder='USERNAME'
                    onChange={(e)=>setUsername(e.target.value)}
                    value={username}
                    onKeyUp={handleInputEnter}
                />

                <button className='btn joinBtn' onClick={joinRoom}>JOIN</button>
                <span className='createInfo'>
                    Login as a GUST &nbsp;
                    <a onClick={createNewRoom} href="" className='createNewBtn'>new room</a>
                </span>
            </div>
        </div>
        <footer>
            <h4>Built with 🧡 &nbsp; by &nbsp;
            <a href="">Deepak</a></h4>
        </footer>
    </div>
  )
}

export default Home