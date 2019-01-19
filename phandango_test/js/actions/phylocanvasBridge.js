import isEqual from 'lodash/isEqual';

/*    setYValues
When a change in phylocanvas is detected we need to
update the store with the y positions of the taxa
which are in view.
It's more complicated because phylocanvas updates
all the time, even when nothing changes.
So we check for this, as we don't want to update
unnecessarily
*/
export function setYValues(phylocanvas) {
  // THUNK
  return function (dispatch, getState) {
    const activeTaxa = {};
    const pixelRatio = _getPixelRatio(phylocanvas.canvas.canvas);
    const heightHalf = phylocanvas.prerenderer.getStep(phylocanvas) / 2 * phylocanvas.zoom / pixelRatio;

    const allTaxa = new Array();
    for (let i = 0; i < phylocanvas.leaves.length; i++) {
      allTaxa.push( phylocanvas.leaves[i].id );
    }

    for (let i = 0; i < allTaxa.length; i++) {
      const centerY = _translatePhylocanvasCoordsToPixels(phylocanvas.branches[allTaxa[i]].centery, phylocanvas, pixelRatio);
      // should check if it is visible...
      activeTaxa[allTaxa[i]] = [ centerY - heightHalf, centerY + heightHalf ];
    }

    // console.log('--------- comparing -------');
    // console.log(getState().phylogeny.activeTaxa);
    // console.log(activeTaxa);
    // console.log('--------- ', isEqual(getState().phylogeny.activeTaxa, activeTaxa), ' -------');

    if (!isEqual(getState().phylogeny.activeTaxa, activeTaxa)) {
      dispatch({ type: 'updatedTaxaPositions', activeTaxa: activeTaxa });
    }
  };
}


function _translatePhylocanvasCoordsToPixels(y, phylocanvas, pixelRatio) {
  /* sort of undoing the translateClick function of PhyloCanvas
   * updated for phylocavnas 2.0.0 rc9
   */
  let ret = y;
  ret  = ret / pixelRatio;
  ret *= phylocanvas.zoom;
  ret += phylocanvas.offsety;
  return ret;
}


function _getBackingStorePixelRatio(context) { // PhyloCanvas code
  return (
    context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    1
  );
}

function _getPixelRatio(canvas) { // PhyloCanvas code
  return (window.devicePixelRatio || 1) / _getBackingStorePixelRatio(canvas);
}

