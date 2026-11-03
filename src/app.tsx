import { Route, Switch } from "wouter";
import Home from "./pages/home";
import Studio from "./pages/studio";

function NotFound() {
  return (
    <main className="not-found">
      <h1>404</h1>
      <p>Sorry, this page could not be found.</p>
      <a href="/">Return to Home</a>
    </main>
  );
}

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/studio" component={Studio} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
