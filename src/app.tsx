import React, { Suspense } from "react";
import { Route, Switch, Redirect } from "wouter";

import Home from "./pages/home";
import Studio from "./pages/studio";

function LoadingScreen() {
  return (
    <div className="app-loading">
      <div className="loading-logo">C</div>
      <div className="loading-spinner" />
      <p>Preparing your creative studio...</p>
    </div>
  );
}

function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-content">
        <span className="not-found-code">404</span>

        <h1>Scene not found.</h1>

        <p>
          The page you're looking for doesn't exist.
        </p>

        <a href="/" className="primary-button">
          Return Home
        </a>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Switch>
        <Route path="/" component={Home} />

        <Route path="/studio" component={Studio} />

        <Route>
          <NotFound />
        </Route>
      </Switch>
    </Suspense>
  );
}
