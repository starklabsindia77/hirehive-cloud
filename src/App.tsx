import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              ✅ Cache Cleared Successfully
            </h1>
            <p style={{ color: '#666' }}>
              The app is now rebuilding. Please let me know you see this message.
            </p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
