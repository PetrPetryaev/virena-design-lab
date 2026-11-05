import React from 'react';
import starIcon from '../../assets/tree-icons/star-bold.svg?raw';
// Product rank: shared with the tree; no dedicated rank master in the DS snapshot.
export default function MemberRank({rank=0}){
 return <span className={`genealogy-rank ${rank===0?'is-zero':''}`} aria-label={`Ранг: ${rank} из 9`}><span className="genealogy-library-icon icon-star" aria-hidden="true" dangerouslySetInnerHTML={{__html:starIcon.replaceAll('"black"','"currentColor"')}}/><span>{rank}</span></span>;
}
