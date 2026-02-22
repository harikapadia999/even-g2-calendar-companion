/**
 * Main Entry Point
 * 
 * Bootstraps the Calendar Companion application.
 */

import { initApp } from './app';

// Start the application
console.log('='.repeat(50));
console.log('Calendar Companion for Even G2');
console.log('Even Hub SDK Version');
console.log('='.repeat(50));

initApp().catch((err) => {
  console.error('Fatal error during initialization:', err);
  
  // Display error in DOM for debugging
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div style="padding: 20px; font-family: monospace;">
        <h1 style="color: red;">Initialization Failed</h1>
        <p><strong>Error:</strong> ${err.message}</p>
        <p>Please check the console for more details.</p>
        <hr>
        <h2>Troubleshooting:</h2>
        <ul>
          <li>Make sure you're running this app inside Even Hub</li>
          <li>Check that Google Calendar API credentials are configured</li>
          <li>Verify that you have internet connection</li>
          <li>Try refreshing the page</li>
        </ul>
      </div>
    `;
  }
});
