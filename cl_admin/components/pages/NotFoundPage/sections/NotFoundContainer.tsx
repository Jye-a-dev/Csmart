'use client';

import CircuitGraphic from './CircuitGraphic';
import ErrorContent, { ErrorFooter } from './ErrorContent';
import ActionButtons from './ActionButtons';

export default function NotFoundContainer() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] bg-[linear-gradient(to_right,#09090b0a_1px,transparent_1px),linear-gradient(to_bottom,#09090b0a_1px,transparent_1px)] bg-size-[20px_20px] flex flex-col justify-center items-center p-6 font-sans relative overflow-hidden">
      {/* Custom Styles for Keyframe Animations & Brutalist Effects */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        .animate-float {
          animation: float-slow 4s ease-in-out infinite;
        }
        .brutal-card {
          border: 4px solid #09090B;
          box-shadow: 8px 8px 0px 0px #09090B;
          transition: all 0.2s ease;
        }
        .brutal-card:hover {
          transform: translate(-2px, -2px);
          box-shadow: 10px 10px 0px 0px #09090B;
        }
        .btn-brutal-custom {
          border: 3px solid #09090B;
          box-shadow: 4px 4px 0px 0px #09090B;
          transition: all 0.15s ease;
        }
        .btn-brutal-custom:hover:not(:disabled) {
          transform: translate(1px, 1px);
          box-shadow: 3px 3px 0px 0px #09090B;
        }
        .btn-brutal-custom:active:not(:disabled) {
          transform: translate(3px, 3px);
          box-shadow: 1px 1px 0px 0px #09090B;
        }
      `}} />

      {/* Background Decorative Grid Elements */}
      <div className="absolute top-10 left-10 w-24 h-24 border-2 border-dashed border-[#09090B]/10 rounded-full animate-spin [animation-duration:20s] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-36 h-36 border-2 border-dashed border-[#09090B]/10 rounded-full animate-spin [animation-duration:30s] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-lg brutal-card bg-white p-8 md:p-12 text-center relative z-10">
        <CircuitGraphic />
        <ErrorContent />
        <ActionButtons />
        <ErrorFooter />
      </div>
    </div>
  );
}
