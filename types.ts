
import type { jsPDF } from 'jspdf';

declare global {
  interface Window {
    jspdf: {
      jsPDF: typeof jsPDF;
    };
  }
}

export interface Message {
    sender: 'user' | 'bot';
    text: string;
}
