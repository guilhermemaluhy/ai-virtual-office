import { createRoot } from 'react-dom/client';
import '../app/globals.css';
import { OfficeApp } from '../components/OfficeApp';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');
createRoot(root).render(<OfficeApp />);
