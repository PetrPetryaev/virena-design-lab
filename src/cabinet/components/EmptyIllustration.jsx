import React from 'react';
import successorArt from '../../assets/profile-illustrations/successor.svg';
import requisitesArt from '../../assets/profile-illustrations/requisites.svg';
const vectors=import.meta.glob('../../assets/empty-illustrations/*.svg',{eager:true,query:'?url',import:'default'});
import './empty-illustration.css';

export const emptyIllustrationCells={participants:0,invitations:1,finances:2,orders:3,learning:4,news:5,offers:6,calendar:7,materials:8,locations:9,knowledge:10,notifications:11,cart:12,support:13,shop:14,search:15};

// Measured ink bounds, including 4px antialias padding; generated cells are not perfectly centered.
const inkBounds=[[57, 83, 191, 134], [322, 65, 146, 160], [537, 84, 191, 150], [780, 56, 181, 174], [56, 311, 193, 152], [309, 309, 167, 154], [551, 303, 160, 164], [776, 315, 188, 149], [77, 543, 153, 173], [304, 550, 175, 153], [531, 562, 204, 140], [796, 552, 146, 155], [66, 798, 197, 143], [303, 800, 178, 134], [548, 778, 168, 172], [788, 787, 165, 162]];

const profileArt={successor:{src:successorArt,width:256,height:73.88},requisites:{src:requisitesArt,width:192,height:155.45}};

export default function EmptyIllustration({kind='search'}){
 const cell=emptyIllustrationCells[kind]??emptyIllustrationCells.search;
 const [, ,width,height]=inkBounds[cell];
 const name=Object.keys(emptyIllustrationCells)[cell];
 const src=vectors[`../../assets/empty-illustrations/${name}.svg`];
 const scale=.75;
 const art=profileArt[kind]||{src,width:width*scale,height:height*scale};
 return <div className="cab-empty-art" aria-hidden="true" data-illustration={kind}><span className="cab-empty-art-ink" style={{maskImage:`url(${art.src})`,width:art.width,height:art.height}}/></div>;
}
