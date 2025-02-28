import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './assets/styles/index.css'
import AppRoutes from './presentation/routes/AppRoutes.tsx'
import { Provider } from 'react-redux'
import { store } from './infrastructure/redux/store.ts'
import { ThemeProvider } from './context/ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
