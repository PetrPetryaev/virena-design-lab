import React from 'react';

// Decorative demo arc, not a live countdown or a percentage of a billing period.
export function TimeRing({days=7}){
 const arc=Math.max(0,Math.min(100,25*days/7));
 return <svg className="overview-time-ring" viewBox="0 0 64 64" aria-hidden="true"><circle className="time-track" cx="32" cy="32" r="29"/><circle className="time-remaining" cx="32" cy="32" r="29" pathLength="100" strokeDasharray={`${arc} 100`}/></svg>;
}
