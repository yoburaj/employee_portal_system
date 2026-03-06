import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';

const WebcamCapture = ({ onCapture, isEnrolling = false, autoStop = false, loading = false }) => {
    const webcamRef = useRef(null);
    const [isAuto, setIsAuto] = React.useState(false);
    const timerRef = useRef(null);

    React.useEffect(() => {
        if (autoStop && isAuto) {
            setIsAuto(false);
        }
    }, [autoStop, isAuto]);

    const capture = useCallback(() => {
        if (webcamRef.current && !loading) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc && onCapture) {
                onCapture(imageSrc);
            }
        }
    }, [onCapture, loading]);

    React.useEffect(() => {
        if (isAuto && !loading) {
            timerRef.current = setInterval(() => {
                capture();
            }, 150); // Capture every 150ms for a smooth burst
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isAuto, capture, loading]);

    const videoConstraints = {
        width: 640,
        height: 480,
        facingMode: "user"
    };

    return (
        <div className="webcam-container">
            <div className="webcam-wrapper glass" style={{
                position: 'relative',
                borderRadius: '1rem',
                overflow: 'hidden',
                border: '4px solid var(--glass-border)',
                maxWidth: '420px',
                height: 'auto',
                maxHeight: '38vh',
                margin: '0 auto'
            }}>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    mirrored={true}
                />
                <div className="face-overlay" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60%',
                    height: '70%',
                    border: '2px dashed var(--primary-color)',
                    borderRadius: '2rem',
                    pointerEvents: 'none',
                    boxShadow: isAuto ? '0 0 20px var(--primary-color)' : 'none',
                    transition: 'box-shadow 0.3s'
                }} />
                {isAuto && (
                    <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'rgba(239, 68, 68, 0.8)',
                        color: 'white',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '2rem',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        animation: 'pulse 1s infinite'
                    }}>
                        <div style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%' }}></div>
                        AUTO
                    </div>
                )}
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                {isEnrolling ? (
                    <button
                        className={`btn ${isAuto ? 'btn-outline' : 'btn-primary'}`}
                        onClick={() => setIsAuto(!isAuto)}
                        disabled={loading}
                        style={{ minWidth: '180px', padding: '0.5rem 1rem', fontSize: '0.8125rem', borderColor: isAuto ? 'var(--danger-color)' : '' }}
                    >
                        <Camera size={16} />
                        {isAuto ? 'Stop Auto Capture' : 'Start Auto Capture'}
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={capture} disabled={loading} style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
                        <Camera size={16} />
                        {loading ? 'Verifying...' : 'Verify Identity'}
                    </button>
                )}
            </div>
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default WebcamCapture;
