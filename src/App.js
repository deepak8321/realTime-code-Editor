import React from 'react'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import EditorPage from './pages/EditorPage'
import  "./App.css";
import { Toaster } from 'react-hot-toast';
function App() {
  return (
    // sabhi Routes ko place karo(Home.js, EditorPage.js)
    <>
      <div>
        <Toaster 
          position='top-right'
          toastOptions={{success: {
            theme: {
              primary: '#4aed88'
            },
          },
          }}
        />
      </div>
      <BrowserRouter>
        <Routes>
        {/* (path:- routes ka path),(element:- name of routes) */}
          <Route path='/' element={<Home/>}></Route>
          <Route path='/editor/:roomId' element={<EditorPage/>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;  