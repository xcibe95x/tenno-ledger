import { Component } from 'react';

// Catches render-time errors so an unexpected bug shows a recoverable message
// instead of a blank white screen. Local progress is untouched (it lives in
// localStorage), so a reload almost always recovers.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('render error', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="app-crash" role="alert">
          <h1>Something went wrong.</h1>
          <p>Your saved progress is safe on this device. Reloading usually fixes it.</p>
          <button className="btn btn-gold" onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
