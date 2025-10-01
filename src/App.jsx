import './App.css'
import SiteHeader from './Components/SiteHeader.jsx'
import CabinetSelectionForm from './Components/CabinetSelectionForm.jsx'
import SiteFooter from './Components/SiteFooter.jsx'

function App() {

  return (
    <>
      <SiteHeader />
      <main>
      <CabinetSelectionForm />  
      </main>
      <SiteFooter />
    </>
  )
}

export default App