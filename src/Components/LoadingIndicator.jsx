import { ClipLoader } from 'react-spinners';
import './LoadingIndicator.css';

const LoadingIndicator = ({ loading, message = 'Loading...' }) => {
  if (!loading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <ClipLoader
          color="#0d6efd"
          loading={loading}
          size={50}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
