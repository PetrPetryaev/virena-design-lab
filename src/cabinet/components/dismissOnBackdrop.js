// Native dialog backdrops target the dialog itself; interior padding must stay inert.
export default function dismissOnBackdrop(event, dismiss) {
 if (event.target !== event.currentTarget) return;
 const {left,right,top,bottom} = event.currentTarget.getBoundingClientRect();
 if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dismiss();
}
