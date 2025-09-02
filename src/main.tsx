import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import './index.css'
import App from './App.tsx'

// Create a theme with forced light mode and custom button styles
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  cssVarPrefix: 'none',
  components: {
    Button: {
      baseStyle: {
        bg: 'black',
        color: 'white',
        _hover: {
          bg: '#333333'
        }
      }
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider theme={theme} resetCSS={false}>
      <App />
    </ChakraProvider>
  </StrictMode>,
)
