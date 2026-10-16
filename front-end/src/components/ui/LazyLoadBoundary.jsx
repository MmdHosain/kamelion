import { Component } from 'react';

// A failed chunk download must leave a recovery action on weak connections.
export default class LazyLoadBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div role="alert" dir="rtl" className="relative z-[10001] bg-white p-8 text-center">
          <p>بارگذاری انجام نشد. اتصال اینترنت را بررسی کنید.</p>
          <button type="button" onClick={() => window.location.reload()}>
            بارگذاری دوباره صفحه
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
