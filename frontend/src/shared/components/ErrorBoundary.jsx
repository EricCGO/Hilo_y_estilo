import { Component } from 'react';
import { AlertCircle } from '@/shared/icons';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container section">
        <div className="error-box">
          <h3><AlertCircle size={18} /> Algo salió mal</h3>
          <p>{this.state.error.message}</p>
          <button className="btn btn--outline" onClick={() => window.location.reload()}>
            Recargar página
          </button>
        </div>
      </div>
    );
  }
}
