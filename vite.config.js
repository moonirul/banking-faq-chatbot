import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace with your GitHub repository name for project pages.
// Example: repository "banking-faq-chatbot" => base: "/banking-faq-chatbot/"
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/banking-faq-chatbot/' : '/',
})