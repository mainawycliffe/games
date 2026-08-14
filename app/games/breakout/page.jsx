'use client';
import Link from "next/link";

export default function BreakoutPage() {
  return (
    <div style={{
      position: 'absolute',
      top: '55px', 
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#09090b',
      
      backgroundImage: `
        linear-gradient(to right, rgba(168, 85, 247, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(168, 85, 247, 0.04) 1px, transparent 1px)
      `,
      backgroundSize: '30px 30px',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box',
      padding: '24px'
    }}>
      
      
      <style>{`
        .arcade-button {
          width: 100%;
          background-color: #a855f7;
          border: 1px solid #c084fc;
          color: #ffffff;
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          padding: 16px 32px;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255,255,255,0.3);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          
          /* Forced Flex centering alignments */
          display: flex;
          align-items: center;
          justify-content: center; 
          text-align: center;
          padding-left: 0 !important;
          padding-right: 0 !important;
          
          box-sizing: border-box;
        }

        .arcade-button:hover {
          background-color: #b55fe6;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 28px rgba(168, 85, 247, 0.6), inset 0 1px 0 rgba(255,255,255,0.4);
          border-color: #e9d5ff;
        }
      `}</style>

      
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'rgba(168, 85, 247, 0.12)',
        filter: 'blur(80px)',
        borderRadius: '50%',
        top: '20%',
        left: '25%',
        pointerEvents: 'none'
      }} />

      <main style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '40px',
        borderRadius: '24px',
        border: '2px solid rgba(168, 85, 247, 0.25)',
        backgroundColor: 'rgba(15, 11, 25, 0.75)',
        backdropFilter: 'blur(12px)',
        padding: '64px 80px',
        textAlign: 'center',
        boxShadow: '0 0 40px rgba(168, 85, 247, 0.15), inset 0 0 20px rgba(168, 85, 247, 0.05)',
        maxWidth: '500px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
      
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h1 style={{
            fontSize: '3.75rem',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            margin: 0,
            lineHeight: '1.1',
            textTransform: 'uppercase',
            background: 'linear-gradient(to bottom, #ffffff 40%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 8px rgba(168, 85, 247, 0.4))'
          }}>
            BREAKOUT
          </h1>
          <p style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.25em',
            color: '#a1a1aa',
            textTransform: 'uppercase',
            margin: 0,
            opacity: 0.8
          }}>
            Classic Arcade Action
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href={issueUrl(41)}>Read the full spec (issue #41)</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
