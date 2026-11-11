import React from 'react';
// Images are supplied by the approved illustration library; no synthetic rank mapping.
export default function AchievementBadge({src,alt=''}) {
 return src ? <img className="pd-achievement-badge" src={src} alt={alt}/> : null;
}
