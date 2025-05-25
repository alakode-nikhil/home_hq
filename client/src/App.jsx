import { RouterProvider } from 'react-router-dom';
import router from './router'; // Import your configured router

function App() {
    return (
        <RouterProvider router={router} />
    );
}

export default App;